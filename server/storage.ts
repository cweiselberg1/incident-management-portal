import { type User, type InsertUser, type Vendor, type InsertVendor, type Document, type InsertDocument } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  // Document methods
  getDocumentsByVendor(vendorId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vendors: Map<string, Vendor>;
  private documents: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.documents = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const now = new Date();
    const vendor: Vendor = { 
      ...insertVendor,
      agreementType: insertVendor.agreementType || null,
      agreementStatus: insertVendor.agreementStatus || "pending",
      riskStatus: insertVendor.riskStatus || "not_started",
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updatedVendor: Vendor = {
      ...vendor,
      ...updates,
      updatedAt: new Date()
    };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    // Also delete associated documents
    const vendorDocuments = Array.from(this.documents.values()).filter(doc => doc.vendorId === id);
    vendorDocuments.forEach(doc => this.documents.delete(doc.id));
    
    return this.vendors.delete(id);
  }

  // Document methods
  async getDocumentsByVendor(vendorId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.vendorId === vendorId)
      .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      status: insertDocument.status || "active",
      fileSize: insertDocument.fileSize || null,
      id,
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
