import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertTriangle, CheckCircle, Clock, FileWarning, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { incidentApi } from "@/lib/incident-api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => incidentApi.getIncidents(),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => incidentApi.getStats(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      incidentApi.updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Incident updated" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "bg-yellow-100 text-yellow-800";
      case "investigating": return "bg-blue-100 text-blue-800";
      case "contained": return "bg-purple-100 text-purple-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "reported_to_ocr": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeItem="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Incident Management</h2>
              <p className="text-slate-600 mt-1">Track and manage HIPAA security incidents</p>
            </div>
            <Link href="/report">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm text-slate-500">Total Incidents</p>
                    <p className="text-2xl font-bold">{stats?.totalIncidents || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-slate-500">Investigating</p>
                    <p className="text-2xl font-bold">{stats?.investigating || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-slate-500">Resolved</p>
                    <p className="text-2xl font-bold">{stats?.resolved || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Incidents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : incidents.length === 0 ? (
                <p className="text-slate-500">No incidents reported yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Reporter</th>
                        <th className="text-left py-3 px-2">Description</th>
                        <th className="text-left py-3 px-2">Priority</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident: any) => (
                        <tr key={incident.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-2 text-sm">
                            {new Date(incident.incidentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-sm">{incident.reporterName}</td>
                          <td className="py-3 px-2 text-sm max-w-xs truncate">
                            {incident.description}
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Link href={`/incident/${incident.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <select
                                className="text-sm border rounded px-2 py-1"
                                value={incident.status}
                                onChange={(e) =>
                                  updateMutation.mutate({
                                    id: incident.id,
                                    data: { status: e.target.value },
                                  })
                                }
                              >
                                <option value="reported">Reported</option>
                                <option value="investigating">Investigating</option>
                                <option value="contained">Contained</option>
                                <option value="resolved">Resolved</option>
                                <option value="reported_to_ocr">Reported to OCR</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
