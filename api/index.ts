import express from "express";
import { z } from "zod";
import { clerkClient } from '@clerk/clerk-sdk-node';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define schema inline to avoid import issues
const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planning"),
  progress: integer("progress").notNull().default(0),
  monthlyCost: integer("monthly_cost").notNull().default(0),
  lastActivity: timestamp("last_activity", { withTimezone: true }).notNull().defaultNow(),
  aiUpdates: integer("ai_updates").notNull().default(0),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  docsUrl: text("docs_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Define validation schema inline
const insertProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
  status: z.enum(["planning", "active", "paused", "completed", "blocked"]),
  progress: z.number().min(0).max(100),
  monthlyCost: z.number().min(0),
  aiUpdates: z.number().min(0).default(0),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  docsUrl: z.string().url().optional().or(z.literal("")),
});

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

// Auth middleware
async function requireAuth(req: any, res: any, next: any) {
  try {
    console.log('🔍 Auth middleware - Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      userAgent: req.headers['user-agent'],
      url: req.url
    });
    
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : null;
    
    console.log('🔑 Session token:', sessionToken ? 'Present (length: ' + sessionToken.length + ')' : 'Missing');
    
    if (!sessionToken) {
      console.log('❌ No session token provided');
      return res.status(401).json({ message: 'No session token provided' });
    }

    const sessionClaims = await clerkClient.verifyToken(sessionToken);
    
    if (!sessionClaims || !sessionClaims.sub) {
      return res.status(401).json({ message: 'Invalid session token' });
    }

    const user = await clerkClient.users.getUser(sessionClaims.sub);
    
    // Store user data in database - use insert with conflict handling
    try {
      await db.insert(users).values({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.imageUrl,
      });
      console.log('✅ User created in database:', user.id);
    } catch (insertError: any) {
      // If user already exists, update their info
      await db.update(users)
        .set({
          email: user.emailAddresses[0]?.emailAddress || null,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.imageUrl,
        })
        .where(eq(users.id, user.id));
      console.log('✅ User updated in database:', user.id);
    }
    
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    };

    console.log('✅ Authentication successful for user:', user.id);
    next();
  } catch (error: any) {
    console.error('❌ Clerk auth verification error:', error);
    return res.status(401).json({ message: 'Authentication failed', error: error?.message });
  }
}

// Check if user is logged in
app.get('/api/auth/user', requireAuth, async (req: any, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      imageUrl: req.user.imageUrl
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 DATABASE_URL exists:', !!connectionString);
    console.log('🌐 Connection string format:', connectionString?.substring(0, 30) + '...');
    
    // Simple connection test
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    console.log('✅ Database connection successful');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: result.rows[0].current_time 
    });
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed', 
      error: error?.message || 'Unknown error',
      code: error?.code,
      errno: error?.errno
    });
  }
});

// Get all projects
app.get("/api/projects", requireAuth, async (req: any, res) => {
  try {
    const { sortBy = "lastActivity" } = req.query;
    const userId = req.user.id;
    
    console.log('📊 Fetching projects for user:', userId);
    const projectList = await db.select().from(projects).where(eq(projects.userId, userId));
    
    const sortedProjects = projectList.sort((a, b) => {
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
  } catch (error: any) {
    console.error("❌ Projects fetch error:", error);
    res.status(500).json({ message: "Failed to fetch projects", error: error?.message || "Unknown error" });
  }
});

// Get a single project
app.get("/api/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error: any) {
    console.error("Project fetch error:", error);
    res.status(500).json({ message: "Failed to fetch project", error: error?.message || "Unknown error" });
  }
});

// Create a new project
app.post("/api/projects", requireAuth, async (req: any, res) => {
  try {
    console.log('🚀 Creating project for user:', req.user.id);
    console.log('📝 Project data:', req.body);
    
    const validatedData = insertProjectSchema.parse(req.body);
    const userId = req.user.id;
    
    const [project] = await db.insert(projects).values({
      ...validatedData,
      userId,
      githubUrl: validatedData.githubUrl || null,
      liveUrl: validatedData.liveUrl || null,
      docsUrl: validatedData.docsUrl || null,
    }).returning();
    
    console.log('✅ Project created successfully:', project.id);
    res.status(201).json(project);
  } catch (error: any) {
    console.error("❌ Project creation error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    if (error?.message?.includes('connect') || error?.message?.includes('ENOTFOUND')) {
      return res.status(503).json({ 
        message: "Database connection error", 
        error: "Unable to connect to database. Please try again later." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create project", 
      error: error?.message || "Unknown error occurred" 
    });
  }
});

// Update a project (PATCH)
app.patch("/api/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const validatedData = insertProjectSchema.partial().parse(req.body);
    const [updatedProject] = await db.update(projects)
      .set(validatedData)
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error: any) {
    console.error("Project update error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Failed to update project", error: error?.message || "Unknown error" });
  }
});

// Update a project (PUT - alternative endpoint)
app.put("/api/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const validatedData = insertProjectSchema.partial().parse(req.body);
    const [updatedProject] = await db.update(projects)
      .set(validatedData)
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error: any) {
    console.error("Project update error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Failed to update project", error: error?.message || "Unknown error" });
  }
});

// Update project activity
app.post("/api/projects/:id/activity", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const [updatedProject] = await db.update(projects)
      .set({ lastActivity: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Activity updated", project: updatedProject });
  } catch (error: any) {
    console.error("Activity update error:", error);
    res.status(500).json({ message: "Failed to update activity", error: error?.message || "Unknown error" });
  }
});

// Screenshot endpoint (placeholder)
app.get("/api/screenshot", async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ message: "URL parameter is required" });
    }

    // For now, return a placeholder response
    // In the future, you could implement actual screenshot functionality
    res.json({ 
      success: true, 
      message: "Screenshot functionality not implemented yet",
      url: url,
      screenshot: null 
    });
  } catch (error: any) {
    console.error("Screenshot error:", error);
    res.status(500).json({ message: "Failed to generate screenshot", error: error?.message || "Unknown error" });
  }
});

// Delete a project
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error("Project deletion error:", error);
    res.status(500).json({ message: "Failed to delete project", error: error?.message || "Unknown error" });
  }
});

// Get dashboard statistics
app.get("/api/stats", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const projectList = await db.select().from(projects).where(eq(projects.userId, userId));
    
    const activeProjects = projectList.filter(p => p.status === "active").length;
    const totalCost = projectList.reduce((sum, p) => sum + p.monthlyCost, 0);
    const avgProgress = projectList.length > 0 
      ? Math.round(projectList.reduce((sum, p) => sum + p.progress, 0) / projectList.length)
      : 0;
    const pendingAiUpdates = projectList.reduce((sum, p) => sum + p.aiUpdates, 0);

    res.json({
      activeProjects,
      totalCost,
      avgProgress,
      pendingAiUpdates,
    });
  } catch (error: any) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error?.message || "Unknown error" });
  }
});

// Export for Vercel
export default app; 