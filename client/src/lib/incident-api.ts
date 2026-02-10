import { apiRequest } from "./queryClient";
import type { Incident, InsertIncident, IncidentNote, IncidentDocument } from "@shared/schema";

export const incidentApi = {
  // Incident operations
  getIncidents: async (status?: string, priority?: string): Promise<Incident[]> => {
    let url = "/api/incidents";
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiRequest("GET", url);
    return response.json();
  },

  getIncident: async (id: string): Promise<Incident> => {
    const response = await apiRequest("GET", `/api/incidents/${id}`);
    return response.json();
  },

  createIncident: async (incident: InsertIncident): Promise<Incident> => {
    const response = await apiRequest("POST", "/api/incidents", incident);
    return response.json();
  },

  reportIncident: async (incident: InsertIncident): Promise<{ message: string; incidentId: string; status: string }> => {
    const response = await apiRequest("POST", "/api/incidents/report", incident);
    return response.json();
  },

  updateIncident: async (id: string, incident: Partial<InsertIncident>): Promise<Incident> => {
    const response = await apiRequest("PUT", `/api/incidents/${id}`, incident);
    return response.json();
  },

  deleteIncident: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/incidents/${id}`);
  },

  // Notes operations
  getIncidentNotes: async (incidentId: string): Promise<IncidentNote[]> => {
    const response = await apiRequest("GET", `/api/incidents/${incidentId}/notes`);
    return response.json();
  },

  addNote: async (incidentId: string, note: string): Promise<IncidentNote> => {
    const response = await apiRequest("POST", `/api/incidents/${incidentId}/notes`, { note });
    return response.json();
  },

  // Document operations
  getIncidentDocuments: async (incidentId: string): Promise<IncidentDocument[]> => {
    const response = await apiRequest("GET", `/api/incidents/${incidentId}/documents`);
    return response.json();
  },

  uploadDocument: async (incidentId: string, file: File, name: string): Promise<IncidentDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await fetch(`/api/incidents/${incidentId}/documents`, {
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

  // Statistics
  getStats: async (): Promise<{
    totalIncidents: number;
    reported: number;
    investigating: number;
    contained: number;
    resolved: number;
    reportedToOcr: number;
    critical: number;
    phiInvolved: number;
    pendingOcrReport: number;
  }> => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },

  // Reports
  getAnnualReport: async (year: string) => {
    const response = await apiRequest("GET", `/api/reports/annual/${year}`);
    return response.json();
  },

  // Reminders
  sendAnnualReminders: async () => {
    const response = await apiRequest("POST", "/api/reminders/annual");
    return response.json();
  }
};
