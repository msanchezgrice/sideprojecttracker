import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { clerkClient } from '@clerk/clerk-sdk-node';
import { requireAuth } from './clerkAuth';
import puppeteer from "puppeteer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled while setting up Clerk
  // await setupAuth(app);

  // Simple guest login for testing
  app.post('/api/auth/guest-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Guest login attempt:", { email, password });
      
      // Simple guest accounts for testing
      const guestAccounts: Record<string, string> = {
        'guest@sidepilot.com': 'password123',
        'demo@doodad.ai': 'demo123',
        'test@sidepilot.com': 'test123',
        'user1@sidepilot.com': 'user123',
        'user2@sidepilot.com': 'user123',
        'admin@doodad.ai': 'admin123',
        'developer@sidepilot.com': 'dev123'
      };
      
      console.log("Available accounts:", Object.keys(guestAccounts));
      console.log("Password match:", guestAccounts[email] === password);
      
      if (guestAccounts[email] === password) {
        // Create a simple session
        const user = await storage.upsertUser({
          id: email.split('@')[0] + '-user',
          email: email,
          firstName: 'Guest',
          lastName: 'User',
          profileImageUrl: null
        });
        
        // Set simple session
        (req.session as any).user = user;
        console.log("Login successful for:", email);
        res.json({ success: true, user });
      } else {
        console.log("Login failed - credential mismatch");
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check if user is logged in (guest or OAuth)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for guest session first
      if ((req.session as any)?.user) {
        return res.json((req.session as any).user);
      }
      
      // Fall back to OAuth if available
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      // Return a test user for now while we set up Clerk properly
      res.json({
        id: 'test-user',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Get all projects with optional sorting
  app.get("/api/projects", async (req: any, res) => {
    try {
      const { sortBy = "lastActivity" } = req.query;
      // Temporarily use fixed user ID while we fix authentication
      const userId = "temp-user-id";
      const projects = await storage.getProjects(userId);
      
      // Sort projects based on the sortBy parameter
      const sortedProjects = projects.sort((a, b) => {
        switch (sortBy) {
          case "progress":
            return b.progress - a.progress;
          case "cost":
            return b.monthlyCost - a.monthlyCost;
          case "aiUpdates":
            return b.aiUpdates - a.aiUpdates;
          case "lastActivity":
          default:
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        }
      });

      res.json(sortedProjects);
    } catch (error) {
      console.error("Projects fetch error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req: any, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      // Temporarily use a fixed user ID while we fix authentication
      const userId = "temp-user-id";
      const project = await storage.createProject(validatedData, userId);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Project creation error:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update a project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, validatedData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Update last activity timestamp
  app.post("/api/projects/:id/activity", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      await storage.updateLastActivity(id);
      res.status(200).json({ message: "Activity updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      
      const activeProjects = projects.filter(p => p.status === "active").length;
      const totalCost = projects.reduce((sum, p) => sum + p.monthlyCost, 0);
      const avgProgress = projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0;
      const pendingAiUpdates = projects.reduce((sum, p) => sum + p.aiUpdates, 0);

      res.json({
        activeProjects,
        totalCost,
        avgProgress,
        pendingAiUpdates,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Capture website screenshot or metadata
  app.get("/api/screenshot", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL parameter is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // First try to get basic metadata by fetching the page HTML
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Doodad.ai Bot)'
          },
          timeout: 5000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        // Extract basic metadata
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
        const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
        
        const metadata = {
          title: titleMatch ? titleMatch[1].trim() : 'Website',
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          image: ogImageMatch ? ogImageMatch[1].trim() : null,
          url: url
        };
        
        // Return metadata instead of screenshot for now
        res.json({ 
          screenshot: null,
          metadata: metadata,
          message: "Metadata extracted successfully"
        });
        
      } catch (fetchError) {
        // If fetch fails, return a placeholder response
        res.json({ 
          screenshot: null,
          metadata: {
            title: new URL(url).hostname,
            description: 'Website preview unavailable',
            image: null,
            url: url
          },
          message: "Unable to fetch website data"
        });
      }
      
    } catch (error) {
      console.error("Screenshot error:", error);
      res.status(500).json({ 
        message: "Failed to capture screenshot",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
