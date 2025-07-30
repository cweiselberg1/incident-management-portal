import { BarChart3, FileText, AlertTriangle, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";

export default function RiskAnalysis() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Risk Analysis</h2>
              <p className="text-slate-600 mt-1">Vendor security posture assessments and risk management</p>
            </div>
            <Button disabled>
              <FileText className="mr-2 h-4 w-4" />
              Create Questionnaire
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Total Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <p className="text-xs text-slate-500">No assessments yet</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">0</div>
                  <p className="text-xs text-slate-500">Low risk vendors</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <p className="text-xs text-slate-500">Being assessed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    High Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-slate-500">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Section */}
            <Card className="border-2 border-dashed border-slate-300">
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-slate-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900">Risk Assessment System</h3>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                      The vendor risk analysis questionnaire system is currently under development. 
                      This will allow you to create custom security assessments, send them to vendors, 
                      and track their security posture over time.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
                    <h4 className="text-sm font-medium text-blue-900 mb-4">Planned Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Custom Questionnaires</p>
                            <p className="text-xs text-blue-700">Build tailored security assessment forms</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Automated Distribution</p>
                            <p className="text-xs text-blue-700">Send questionnaires via email with tracking</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Risk Scoring</p>
                            <p className="text-xs text-blue-700">Automatic risk level calculation</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Compliance Templates</p>
                            <p className="text-xs text-blue-700">Pre-built HIPAA, SOC 2, and ISO assessments</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Progress Tracking</p>
                            <p className="text-xs text-blue-700">Monitor completion status and follow-ups</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Reporting & Analytics</p>
                            <p className="text-xs text-blue-700">Generate risk assessment reports</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Coming Soon
                    </Badge>
                    <span className="text-sm text-slate-500">Expected in next update</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temporary Access Note */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Current Risk Assessment Process</h4>
                    <p className="text-sm text-slate-600">
                      While the automated risk assessment system is being developed, you can track vendor risk status 
                      manually through the vendor management dashboard. Use the "Risk Status" field when creating or 
                      editing vendor profiles to mark their current assessment state.
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