import {
  users, incidents, incidentNotes, incidentDocuments, annualReminders,
  type User, type InsertUser,
  type Incident, type InsertIncident,
  type IncidentNote, type InsertIncidentNote,
  type IncidentDocument, type InsertIncidentDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql } from "drizzle-orm";

export class DatabaseStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Incident methods
  async getIncidents(status?: string, priority?: string): Promise<Incident[]> {
    let query = db.select().from(incidents);

    if (status && priority) {
      return await db.select().from(incidents)
        .where(and(eq(incidents.status, status), eq(incidents.priority, priority)))
        .orderBy(desc(incidents.createdAt));
    } else if (status) {
      return await db.select().from(incidents)
        .where(eq(incidents.status, status))
        .orderBy(desc(incidents.createdAt));
    } else if (priority) {
      return await db.select().from(incidents)
        .where(eq(incidents.priority, priority))
        .orderBy(desc(incidents.createdAt));
    }

    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident || undefined;
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(insertIncident).returning();
    return incident;
  }

  async updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident | undefined> {
    const updateData: any = { ...updates, updatedAt: new Date() };

    // If status is being set to resolved, set resolvedAt
    if (updates.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const [incident] = await db.update(incidents)
      .set(updateData)
      .where(eq(incidents.id, id))
      .returning();
    return incident || undefined;
  }

  async deleteIncident(id: string): Promise<boolean> {
    // Delete associated notes and documents first
    await db.delete(incidentNotes).where(eq(incidentNotes.incidentId, id));
    await db.delete(incidentDocuments).where(eq(incidentDocuments.incidentId, id));

    const result = await db.delete(incidents).where(eq(incidents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getIncidentsByYear(year: string): Promise<Incident[]> {
    return await db.select().from(incidents)
      .where(sql`EXTRACT(YEAR FROM ${incidents.createdAt}) = ${year}`)
      .orderBy(desc(incidents.createdAt));
  }

  // Incident notes methods
  async getIncidentNotes(incidentId: string): Promise<IncidentNote[]> {
    return await db.select().from(incidentNotes)
      .where(eq(incidentNotes.incidentId, incidentId))
      .orderBy(desc(incidentNotes.createdAt));
  }

  async createIncidentNote(insertNote: InsertIncidentNote): Promise<IncidentNote> {
    const [note] = await db.insert(incidentNotes).values(insertNote).returning();
    return note;
  }

  // Incident documents methods
  async getIncidentDocuments(incidentId: string): Promise<IncidentDocument[]> {
    return await db.select().from(incidentDocuments)
      .where(eq(incidentDocuments.incidentId, incidentId))
      .orderBy(desc(incidentDocuments.uploadedAt));
  }

  async getIncidentDocument(id: string): Promise<IncidentDocument | undefined> {
    const [document] = await db.select().from(incidentDocuments).where(eq(incidentDocuments.id, id));
    return document || undefined;
  }

  async createIncidentDocument(insertDocument: InsertIncidentDocument): Promise<IncidentDocument> {
    const [document] = await db.insert(incidentDocuments).values(insertDocument).returning();
    return document;
  }

  async deleteIncidentDocument(id: string): Promise<boolean> {
    const result = await db.delete(incidentDocuments).where(eq(incidentDocuments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Annual reminder methods
  async getReporterEmailsForYear(year: string): Promise<string[]> {
    const incidentsForYear = await db.select({ email: incidents.reporterEmail })
      .from(incidents)
      .where(sql`EXTRACT(YEAR FROM ${incidents.createdAt}) = ${year}`);

    // Get unique emails
    const uniqueEmails = [...new Set(incidentsForYear.map(i => i.email))];
    return uniqueEmails;
  }

  async createAnnualReminder(email: string, year: string) {
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(incidents)
      .where(and(
        eq(incidents.reporterEmail, email),
        sql`EXTRACT(YEAR FROM ${incidents.createdAt}) = ${year}`
      ));

    const [reminder] = await db.insert(annualReminders).values({
      email,
      year,
      sentAt: new Date(),
      incidentCount: String(count[0]?.count || 0)
    }).returning();

    return reminder;
  }
}

export const storage = new DatabaseStorage();
