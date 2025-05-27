import express from "express";
import { storage } from "../server/storage";
import { insertProjectSchema } from "../shared/schema";
import { z } from "zod";
import { requireAuth } from '../server/clerkAuth';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up storage
app.locals.storage = storage;

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
    
    if (guestAccounts[email] === password) {
      const user = await storage.upsertUser({
        id: email.split('@')[0] + '-user',
        email: email,
        firstName: 'Guest',
        lastName: 'User',
        profileImageUrl: null
      });
      
      res.json({ success: true, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Check if user is logged in
app.get('/api/auth/user', async (req: any, res) => {
  try {
    res.json({
      id: 'test-user-123',
      email: 'test@doodad.ai',
      firstName: 'Test',
      lastName: 'User'
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Get all projects
app.get("/api/projects", async (req: any, res) => {
  try {
    const { sortBy = "lastActivity" } = req.query;
    const userId = 'test-user-123'; // Use test user for now
    const projects = await storage.getProjects(userId);
    
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
    const userId = 'test-user-123'; // Use test user for now
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

// Export for Vercel
export default app; 