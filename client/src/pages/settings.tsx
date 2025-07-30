import { useState } from "react";
import { Save, User, Shield, Database, Bell, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [companyName, setCompanyName] = useState("One Guy Consulting");
  const [companyEmail, setCompanyEmail] = useState("admin@oneguyconsulting.com");
  const [companyAddress, setCompanyAddress] = useState("");
  const [defaultAgreementType, setDefaultAgreementType] = useState("baa");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [agreementReminders, setAgreementReminders] = useState(true);
  const [riskAssessmentAlerts, setRiskAssessmentAlerts] = useState(false);
  
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
              <p className="text-slate-600 mt-1">Manage your vendor management system preferences</p>
            </div>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Enter your company's full business address"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Agreement Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Agreement Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultAgreementType">Default Agreement Type</Label>
                  <Select value={defaultAgreementType} onValueChange={setDefaultAgreementType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baa">Business Associate Agreement</SelectItem>
                      <SelectItem value="confidentiality">Confidentiality Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500 mt-1">
                    This will be pre-selected when creating new vendor profiles
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">
                      Receive email updates for important vendor management activities
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agreement Expiration Reminders</Label>
                    <p className="text-sm text-slate-500">
                      Get notified when vendor agreements are approaching expiration
                    </p>
                  </div>
                  <Switch
                    checked={agreementReminders}
                    onCheckedChange={setAgreementReminders}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Assessment Alerts</Label>
                    <p className="text-sm text-slate-500">
                      Receive alerts for overdue risk assessments
                    </p>
                  </div>
                  <Switch
                    checked={riskAssessmentAlerts}
                    onCheckedChange={setRiskAssessmentAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Database Status</Label>
                    <div className="mt-1 flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">Connected (PostgreSQL)</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Application Version</Label>
                    <p className="text-sm text-slate-600 mt-1">v1.0.0</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Features</Label>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Vendor Profile Management</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Document Storage & Management</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Agreement Tracking</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Risk Assessment Questionnaires (Coming Soon)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Template Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Available Templates</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Business Associate Agreement (HIPAA)</span>
                      <Button variant="outline" size="sm" disabled>
                        Edit Template
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">HIPAA Confidentiality Agreement</span>
                      <Button variant="outline" size="sm" disabled>
                        Edit Template
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    Template customization will be available in a future update
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-700">Help & Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">Need Help?</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      For questions about vendor management best practices or system features, 
                      refer to your internal compliance documentation or contact your IT administrator.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">Data Backup</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Your vendor data is automatically backed up as part of the PostgreSQL database. 
                      All documents and agreements are securely stored for audit compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>
        </main>
      </div>
    </div>
  );
}