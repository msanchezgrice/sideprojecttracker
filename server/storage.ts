import { projects, users, type Project, type InsertProject, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Project operations
  getProjects(userId?: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject, userId: string): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  updateLastActivity(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private users: Map<string, User>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.users = new Map();
    this.currentId = 1;
    
    // Start clean - no sample data for new users
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  private initializeSampleData() {
    const sampleProjects: Omit<Project, 'id'>[] = [
      {
        name: "VibeCRM Dashboard",
        description: "Customer relationship management system",
        status: "active",
        progress: 87,
        monthlyCost: 24700, // $247.00 in cents
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        aiUpdates: 3,
        githubUrl: "https://github.com/user/vibecrm",
        liveUrl: "https://vibecrm.demo.com",
        docsUrl: "https://docs.vibecrm.com",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        userId: "demo-user"
      },
      {
        name: "AI Content Generator",
        description: "Automated blog post and social media content creation",
        status: "paused",
        progress: 65,
        monthlyCost: 8900, // $89.00 in cents
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        aiUpdates: 0,
        githubUrl: "https://github.com/user/ai-content",
        liveUrl: "",
        docsUrl: "",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      },
      {
        name: "Expense Tracker Mobile",
        description: "React Native app for personal finance management",
        status: "active",
        progress: 42,
        monthlyCost: 12700, // $127.00 in cents
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        aiUpdates: 0,
        githubUrl: "https://github.com/user/expense-tracker",
        liveUrl: "",
        docsUrl: "",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
      {
        name: "E-commerce Analytics",
        description: "Real-time sales dashboard with predictive insights",
        status: "blocked",
        progress: 28,
        monthlyCost: 15600, // $156.00 in cents
        lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        aiUpdates: 0,
        githubUrl: "https://github.com/user/ecommerce-analytics",
        liveUrl: "",
        docsUrl: "",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      },
      {
        name: "Portfolio Website v3",
        description: "Personal portfolio with interactive animations",
        status: "planning",
        progress: 15,
        monthlyCost: 1200, // $12.00 in cents
        lastActivity: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        aiUpdates: 0,
        githubUrl: "",
        liveUrl: "",
        docsUrl: "",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    sampleProjects.forEach(project => {
      const id = this.currentId++;
      this.projects.set(id, { ...project, id });
    });
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject, userId: string): Promise<Project> {
    const id = this.currentId++;
    const project: Project = {
      ...insertProject,
      id,
      userId,
      lastActivity: new Date(),
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }

    const updatedProject: Project = {
      ...existingProject,
      ...updates,
      lastActivity: new Date(),
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async updateLastActivity(id: number): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.lastActivity = new Date();
      this.projects.set(id, project);
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    const result = await db.select().from(projects);
    return result;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        ...insertProject,
        githubUrl: insertProject.githubUrl || null,
        liveUrl: insertProject.liveUrl || null,
        docsUrl: insertProject.docsUrl || null,
      })
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updates,
        githubUrl: updates.githubUrl ? updates.githubUrl : null,
        liveUrl: updates.liveUrl ? updates.liveUrl : null,
        docsUrl: updates.docsUrl ? updates.docsUrl : null,
        lastActivity: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateLastActivity(id: number): Promise<void> {
    await db
      .update(projects)
      .set({ lastActivity: new Date() })
      .where(eq(projects.id, id));
  }
}

export const storage = new MemStorage();
