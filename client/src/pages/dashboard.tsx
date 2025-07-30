import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
