import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planning"), // planning, active, paused, completed, blocked
  progress: integer("progress").notNull().default(0), // 0-100
  monthlyCost: integer("monthly_cost").notNull().default(0), // in cents
  lastActivity: timestamp("last_activity", { withTimezone: true }).notNull().defaultNow(),
  aiUpdates: integer("ai_updates").notNull().default(0),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  docsUrl: text("docs_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
