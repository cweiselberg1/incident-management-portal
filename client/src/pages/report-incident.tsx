import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { incidentApi } from "@/lib/incident-api";
import { useToast } from "@/hooks/use-toast";

export default function ReportIncident() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterRole: "",
    incidentDate: "",
    discoveryDate: "",
    description: "",
    location: "",
    phiInvolved: false,
    phiTypes: "",
    individualsAffected: "",
    breachType: "",
    breachCause: "",
    priority: "medium",
  });

  // Check authentication
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => incidentApi.reportIncident(data),
    onSuccess: (result) => {
      toast({
        title: "Incident Reported",
        description: `Incident ID: ${result.incidentId}`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to report an incident",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [user, isLoading, setLocation, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // Show loading or nothing while checking auth
  if (isLoading || !user) {
    return null;
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeItem="report" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-800">Report Security Incident</h2>
          <p className="text-slate-600 mt-1">Complete this form to report a HIPAA security incident. You are logged in as a verified employee, but you may choose to remain anonymous in your report.</p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle>Reporter Information (Optional - For Anonymous Reporting)</CardTitle>
                <CardDescription>
                  You may choose to identify yourself or remain anonymous. Your login verifies you are a valid employee.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Name *</Label>
                  <Input
                    id="reporterName"
                    required
                    placeholder="Your name or 'Anonymous'"
                    value={formData.reporterName}
                    onChange={(e) => handleChange("reporterName", e.target.value)}
                  />
                  <p className="text-sm text-slate-500 mt-1">Enter "Anonymous" or "N/A" to remain anonymous</p>
                </div>
                <div>
                  <Label htmlFor="reporterEmail">Email</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => handleChange("reporterEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>What happened and when?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incidentDate">Date of Incident *</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      required
                      value={formData.incidentDate}
                      onChange={(e) => handleChange("incidentDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discoveryDate">Date Discovered *</Label>
                    <Input
                      id="discoveryDate"
                      type="date"
                      required
                      value={formData.discoveryDate}
                      onChange={(e) => handleChange("discoveryDate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location of Incident</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Office, Server Room, Remote"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    placeholder="Describe what happened in detail..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="breachType">Type of Incident</Label>
                  <Select
                    value={formData.breachType}
                    onValueChange={(value) => handleChange("breachType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unauthorized_access">Unauthorized Access/Employee Snooping</SelectItem>
                      <SelectItem value="unauthorized_disclosure">Unauthorized Disclosure of PHI</SelectItem>
                      <SelectItem value="misdirected_fax">Misdirected Fax</SelectItem>
                      <SelectItem value="misdirected_email">Misdirected Email</SelectItem>
                      <SelectItem value="misdirected_mail">Misdirected Mail/Records</SelectItem>
                      <SelectItem value="theft_device">Theft of Device (Laptop/Phone/USB)</SelectItem>
                      <SelectItem value="theft_records">Theft of Physical Records</SelectItem>
                      <SelectItem value="loss_device">Loss of Device</SelectItem>
                      <SelectItem value="loss_records">Loss of Physical Records</SelectItem>
                      <SelectItem value="hacking">Hacking/Cyberattack</SelectItem>
                      <SelectItem value="phishing">Phishing/Malware Attack</SelectItem>
                      <SelectItem value="ransomware">Ransomware</SelectItem>
                      <SelectItem value="improper_disposal">Improper Disposal of PHI</SelectItem>
                      <SelectItem value="unattended_phi">PHI Left Visible/Unattended</SelectItem>
                      <SelectItem value="verbal_disclosure">Verbal Disclosure in Public Area</SelectItem>
                      <SelectItem value="social_media">Social Media Disclosure</SelectItem>
                      <SelectItem value="missing_baa">Missing/Inadequate BAA</SelectItem>
                      <SelectItem value="access_denial">Denied Patient Access to Records</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit Incident Report"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
