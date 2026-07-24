import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category", {
    enum: ["web-tasarim-ve-gelistirme", "mobil-uygulama", "oyun-gelistirme", "yapay-zeka"],
  }).notNull(),
  city: text("city", { enum: ["Konya", "Afyonkarahisar"] }).notNull(),
  stage: text("stage", { enum: ["MVP", "Prototip"] }).notNull(),
  problem: text("problem").notNull().default(""),
  targetAudience: text("target_audience").notNull().default(""),
  solution: text("solution").notNull().default(""),
  futurePlans: text("future_plans").notNull().default(""),
  techStack: text("tech_stack").array().notNull().default([]),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  coverUrl: text("cover_url"),
  screenshotUrls: text("screenshot_urls").array().notNull().default([]),
  // AI Usage
  aiIsUsed: boolean("ai_is_used").notNull().default(false),
  aiTools: text("ai_tools").array().notNull().default([]),
  aiUsageAreas: text("ai_usage_areas").array().notNull().default([]),
  aiVerificationMethod: text("ai_verification_method").notNull().default(""),
  // Security & Ethics
  securityNoRealPersonalData: boolean("security_no_real_personal_data").notNull().default(false),
  securityNoSecretsInGithub: boolean("security_no_secrets_in_github").notNull().default(false),
  securityCopyrightCompliant: boolean("security_copyright_compliant").notNull().default(false),
  // Status
  status: text("status", { enum: ["pending", "approved", "rejected", "draft"] }).notNull().default("draft"),
  adminFeedback: text("admin_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
