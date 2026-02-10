import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { incidentApi } from "@/lib/incident-api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, AlertTriangle, FileText, Shield, Bell } from "lucide-react";

export default function IncidentDetail() {
  const [, params] = useRoute("/incident/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const incidentId = params?.id;

  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => incidentApi.getIncident(incidentId!),
    enabled: !!incidentId,
  });

  const [formData, setFormData] = useState({
    status: "",
    priority: "",
    containmentActions: "",
    correctiveActions: "",
    preventiveMeasures: "",
    ocrReportRequired: false,
    ocrReportDate: "",
    ocrConfirmationNumber: "",
    notifiedIndividuals: false,
    notifiedHhs: false,
    notifiedMedia: false,
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        status: incident.status || "",
        priority: incident.priority || "",
        containmentActions: incident.containmentActions || "",
        correctiveActions: incident.correctiveActions || "",
        preventiveMeasures: incident.preventiveMeasures || "",
        ocrReportRequired: incident.ocrReportRequired || false,
        ocrReportDate: incident.ocrReportDate || "",
        ocrConfirmationNumber: incident.ocrConfirmationNumber || "",
        notifiedIndividuals: incident.notifiedIndividuals || false,
        notifiedHhs: incident.notifiedHhs || false,
        notifiedMedia: incident.notifiedMedia || false,
      });
    }
  }, [incident]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => incidentApi.updateIncident(incidentId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Incident Updated", description: "Changes saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

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

  const incidentTypeLabels: Record<string, string> = {
    unauthorized_access: "Unauthorized Access/Employee Snooping",
    unauthorized_disclosure: "Unauthorized Disclosure of PHI",
    misdirected_fax: "Misdirected Fax",
    misdirected_email: "Misdirected Email",
    misdirected_mail: "Misdirected Mail/Records",
    theft_device: "Theft of Device (Laptop/Phone/USB)",
    theft_records: "Theft of Physical Records",
    loss_device: "Loss of Device",
    loss_records: "Loss of Physical Records",
    hacking: "Hacking/Cyberattack",
    phishing: "Phishing/Malware Attack",
    ransomware: "Ransomware",
    improper_disposal: "Improper Disposal of PHI",
    unattended_phi: "PHI Left Visible/Unattended",
    verbal_disclosure: "Verbal Disclosure in Public Area",
    social_media: "Social Media Disclosure",
    missing_baa: "Missing/Inadequate BAA",
    access_denial: "Denied Patient Access to Records",
    other: "Other",
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>Incident not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Incident Response</h2>
                <p className="text-slate-600 mt-1">Privacy Officer Management Console</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Incident Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <CardTitle>Incident Summary</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(incident.priority)}>
                      {incident.priority}
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Reporter</p>
                  <p className="font-medium">{incident.reporterName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{incident.reporterEmail || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Incident Date</p>
                  <p className="font-medium">{new Date(incident.incidentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Discovery Date</p>
                  <p className="font-medium">{new Date(incident.discoveryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type of Incident</p>
                  <p className="font-medium">{incidentTypeLabels[incident.breachType] || incident.breachType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{incident.location || "Not specified"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="font-medium">{incident.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Priority</CardTitle>
                <CardDescription>Update the current status and priority level</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="contained">Contained</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="reported_to_ocr">Reported to OCR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
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

            {/* Investigation & Response */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle>Investigation & Response</CardTitle>
                    <CardDescription>Document containment, corrective, and preventive actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="containmentActions">Containment Actions</Label>
                  <Textarea
                    id="containmentActions"
                    rows={3}
                    placeholder="What immediate steps were taken to contain the incident?"
                    value={formData.containmentActions}
                    onChange={(e) => handleChange("containmentActions", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="correctiveActions">Corrective Actions</Label>
                  <Textarea
                    id="correctiveActions"
                    rows={3}
                    placeholder="What actions were taken to fix the issue?"
                    value={formData.correctiveActions}
                    onChange={(e) => handleChange("correctiveActions", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="preventiveMeasures">Preventive Measures</Label>
                  <Textarea
                    id="preventiveMeasures"
                    rows={3}
                    placeholder="What measures will prevent this from happening again?"
                    value={formData.preventiveMeasures}
                    onChange={(e) => handleChange("preventiveMeasures", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* OCR Reporting */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle>OCR Reporting</CardTitle>
                    <CardDescription>Track reporting to the Office for Civil Rights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ocrReportRequired"
                    checked={formData.ocrReportRequired}
                    onCheckedChange={(checked) => handleChange("ocrReportRequired", checked)}
                  />
                  <Label htmlFor="ocrReportRequired">OCR Report Required (breach affecting 500+ individuals)</Label>
                </div>

                {formData.ocrReportRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="ocrReportDate">Date Reported to OCR</Label>
                      <Input
                        id="ocrReportDate"
                        type="date"
                        value={formData.ocrReportDate}
                        onChange={(e) => handleChange("ocrReportDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ocrConfirmationNumber">OCR Confirmation Number</Label>
                      <Input
                        id="ocrConfirmationNumber"
                        placeholder="Enter confirmation number"
                        value={formData.ocrConfirmationNumber}
                        onChange={(e) => handleChange("ocrConfirmationNumber", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle>Breach Notifications</CardTitle>
                    <CardDescription>Track required notifications per HIPAA Breach Notification Rule</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifiedIndividuals"
                    checked={formData.notifiedIndividuals}
                    onCheckedChange={(checked) => handleChange("notifiedIndividuals", checked)}
                  />
                  <Label htmlFor="notifiedIndividuals">Affected individuals notified (required within 60 days)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifiedHhs"
                    checked={formData.notifiedHhs}
                    onCheckedChange={(checked) => handleChange("notifiedHhs", checked)}
                  />
                  <Label htmlFor="notifiedHhs">HHS notified (required for breaches affecting 500+ individuals)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifiedMedia"
                    checked={formData.notifiedMedia}
                    onCheckedChange={(checked) => handleChange("notifiedMedia", checked)}
                  />
                  <Label htmlFor="notifiedMedia">Media notified (required for breaches affecting 500+ in a state)</Label>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
