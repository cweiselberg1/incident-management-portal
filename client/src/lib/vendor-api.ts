import { apiRequest } from "./queryClient";
import type { Vendor, InsertVendor, Document } from "@shared/schema";

export const vendorApi = {
  // Vendor operations
  getVendors: async (): Promise<Vendor[]> => {
    const response = await apiRequest("GET", "/api/vendors");
    return response.json();
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const response = await apiRequest("GET", `/api/vendors/${id}`);
    return response.json();
  },

  createVendor: async (vendor: InsertVendor): Promise<Vendor> => {
    const response = await apiRequest("POST", "/api/vendors", vendor);
    return response.json();
  },

  updateVendor: async (id: string, vendor: Partial<InsertVendor>): Promise<Vendor> => {
    const response = await apiRequest("PUT", `/api/vendors/${id}`, vendor);
    return response.json();
  },

  deleteVendor: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/vendors/${id}`);
  },

  // Document operations
  getVendorDocuments: async (vendorId: string): Promise<Document[]> => {
    const response = await apiRequest("GET", `/api/vendors/${vendorId}/documents`);
    return response.json();
  },

  uploadDocument: async (vendorId: string, file: File, name: string, type: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);

    const response = await fetch(`/api/vendors/${vendorId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text}`);
    }

    return response.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/documents/${id}`);
  },

  // Agreement operations
  sendAgreement: async (vendorId: string): Promise<{ message: string; email: string; vendor: string }> => {
    const response = await apiRequest("POST", `/api/vendors/${vendorId}/send-agreement`);
    return response.json();
  },

  // Statistics
  getStats: async (): Promise<{
    totalVendors: number;
    signedBAAs: number;
    pendingBAAs: number;
    expiringSoon: number;
  }> => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },
};
