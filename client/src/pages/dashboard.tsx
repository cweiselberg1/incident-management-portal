import { useState } from "react";
import { Plus, Users, FileText, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { VendorTable } from "@/components/vendor-table";
import { VendorFormModal } from "@/components/vendor-form-modal";

export default function Dashboard() {
  const [showCreateVendor, setShowCreateVendor] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeItem="vendors" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Vendor Management</h2>
              <p className="text-slate-600 mt-1">Manage vendor profiles, agreements, and documentation</p>
            </div>
            <Button onClick={() => setShowCreateVendor(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <StatsCards />
          
          {/* Instructions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Key Definitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Key Definitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    Business Associate
                  </h4>
                  <p className="text-sm text-slate-600">
                    A person or organization you pay money to where the nature of the task includes 
                    an inherent disclosure of PHI. These folks need to sign a BAA (Business Associate Agreement).
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <Users className="mr-2 h-4 w-4 text-green-600" />
                    Regular Vendors
                  </h4>
                  <p className="text-sm text-slate-600">
                    Individuals (not companies) who you're not paying for tasks that carry inherent PHI disclosure, 
                    but inadvertent disclosure may occur. These people should sign a confidentiality agreement.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-purple-600" />
                    Business Associate Agreement
                  </h4>
                  <p className="text-sm text-slate-600">
                    Lays out requirements for legitimate business associate relationships. 
                    Federal requirement that must be in place BEFORE any PHI sharing occurs.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-amber-600" />
                    Confidentiality Agreement
                  </h4>
                  <p className="text-sm text-slate-600">
                    For 'Regular Vendors' to ensure that IF they are exposed to PHI, 
                    they will not disclose this information off your campus.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Use This Page */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  How to Use This Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">1. Build Vendor Profiles</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Click the <span className="font-medium text-blue-600">'+Add Vendor'</span> button 
                      in the upper-right to start.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-2 font-medium">Fill in these required fields:</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Vendor name and address</li>
                        <li>• Vendor phone number</li>
                        <li>• Contact person name and email</li>
                        <li>• Agreement type (BAA or Confidentiality)</li>
                        <li>• Agreement action:</li>
                        <li className="ml-4">- Send new agreement for e-signature</li>
                        <li className="ml-4">- Upload existing signed agreement</li>
                        <li className="ml-4">- Skip agreement for now</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">2. Execute Agreements</h4>
                    <p className="text-sm text-slate-600">
                      When you select "Send new agreement for e-signature", the agreement is 
                      automatically emailed to your contact person as soon as you hit 
                      <span className="font-medium text-blue-600"> Create Vendor</span>.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">3. Risk Analysis Questionnaire</h4>
                    <p className="text-sm text-slate-600">
                      Send HIPAA-required vendor risk analysis questionnaires directly from the 
                      <span className="font-medium text-blue-600"> Risk Analysis</span> section 
                      in the left sidebar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <VendorTable />
        </main>
      </div>

      <VendorFormModal
        open={showCreateVendor}
        onOpenChange={setShowCreateVendor}
      />
    </div>
  );
}
