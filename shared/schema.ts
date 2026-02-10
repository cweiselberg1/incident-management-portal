import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"), // 'admin' | 'privacy_officer' | 'user'
});

export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Reporter info
  reporterName: text("reporter_name").notNull(),
  reporterEmail: text("reporter_email").notNull(),
  reporterPhone: text("reporter_phone"),
  reporterRole: text("reporter_role"),

  // Incident details
  incidentDate: date("incident_date").notNull(),
  discoveryDate: date("discovery_date").notNull(),
  description: text("description").notNull(),
  location: text("location"),

  // PHI details
  phiInvolved: boolean("phi_involved").notNull().default(false),
  phiTypes: text("phi_types"),
  individualsAffected: text("individuals_affected"),

  // Breach details
  breachType: text("breach_type"),
  breachCause: text("breach_cause"),

  // Status tracking
  status: text("status").notNull().default("reported"),
  priority: text("priority").notNull().default("medium"),

  // Resolution
  containmentActions: text("containment_actions"),
  correctiveActions: text("corrective_actions"),
  preventiveMeasures: text("preventive_measures"),

  // OCR reporting
  ocrReportRequired: boolean("ocr_report_required").default(false),
  ocrReportDate: date("ocr_report_date"),
  ocrConfirmationNumber: text("ocr_confirmation_number"),

  // Notifications sent
  notifiedIndividuals: boolean("notified_individuals").default(false),
  notifiedHhs: boolean("notified_hhs").default(false),
  notifiedMedia: boolean("notified_media").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const incidentNotes = pgTable("incident_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => incidents.id),
  userId: varchar("user_id").references(() => users.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidentDocuments = pgTable("incident_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => incidents.id),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const annualReminders = pgTable("annual_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  year: text("year").notNull(),
  sentAt: timestamp("sent_at"),
  incidentCount: text("incident_count"),
});

// Training modules
export const trainingModules = pgTable("training_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(), // HTML/Markdown content
  type: text("type").notNull(), // 'policy' | 'hipaa_101' | 'cybersecurity'
  isActive: boolean("is_active").notNull().default(true),
  requiresAttestation: boolean("requires_attestation").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User training completions
export const trainingCompletions = pgTable("training_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => trainingModules.id),
  completedAt: timestamp("completed_at").defaultNow(),
  attestation: text("attestation"), // User's attestation text
  expiresAt: timestamp("expires_at"), // For annual renewals
  score: text("score"), // If there's a quiz/test
});

// Privacy Officer configuration
export const privacyOfficerConfig = pgTable("privacy_officer_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notifyOnIncident: boolean("notify_on_incident").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertIncidentNoteSchema = createInsertSchema(incidentNotes).omit({
  id: true,
  createdAt: true,
});

export const insertIncidentDocumentSchema = createInsertSchema(incidentDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingCompletionSchema = createInsertSchema(trainingCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertPrivacyOfficerConfigSchema = createInsertSchema(privacyOfficerConfig).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export type InsertIncidentNote = z.infer<typeof insertIncidentNoteSchema>;
export type IncidentNote = typeof incidentNotes.$inferSelect;

export type InsertIncidentDocument = z.infer<typeof insertIncidentDocumentSchema>;
export type IncidentDocument = typeof incidentDocuments.$inferSelect;

export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type TrainingModule = typeof trainingModules.$inferSelect;

export type InsertTrainingCompletion = z.infer<typeof insertTrainingCompletionSchema>;
export type TrainingCompletion = typeof trainingCompletions.$inferSelect;

export type InsertPrivacyOfficerConfig = z.infer<typeof insertPrivacyOfficerConfigSchema>;
export type PrivacyOfficerConfig = typeof privacyOfficerConfig.$inferSelect;
