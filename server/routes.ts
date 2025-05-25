import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import puppeteer from "puppeteer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  // Get all projects with optional sorting
  app.get("/api/projects", async (req, res) => {
    try {
      const { sortBy = "lastActivity" } = req.query;
      const projects = await storage.getProjects();
      
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
  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const project = await storage.createProject(validatedData, userId);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
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

  // Capture website screenshot
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

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      // Set timeout and navigate
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      // Take screenshot
      const screenshot = await page.screenshot({ 
        type: 'png',
        fullPage: false
      });
      
      await browser.close();
      
      // Return screenshot as base64 data URL
      const base64Screenshot = `data:image/png;base64,${screenshot.toString('base64')}`;
      res.json({ screenshot: base64Screenshot });
      
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
