import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { vendorApi } from "@/lib/vendor-api";

export default function Agreements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: vendorApi.getVendors,
  });

  // Filter vendors that have agreements
  const agreementData = vendors.filter(vendor => 
    vendor.agreementType && 
    (vendor.agreementStatus === 'signed' || vendor.agreementStatus === 'pending')
  );

  const filteredAgreements = agreementData.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vendor.agreementStatus === statusFilter;
    const matchesType = typeFilter === "all" || vendor.agreementType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Signed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending Signature</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAgreementType = (type: string) => {
    switch (type) {
      case "baa":
        return "Business Associate Agreement";
      case "confidentiality":
        return "Confidentiality Agreement";
      default:
        return type;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getInitialsColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-green-100 text-green-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600",
    ];
    return colors[name.length % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Agreement Management</h2>
              <p className="text-slate-600 mt-1">View and manage all vendor agreements</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{agreementData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Signed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {agreementData.filter(v => v.agreementStatus === 'signed').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {agreementData.filter(v => v.agreementStatus === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Filter Agreements</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search agreements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="baa">Business Associate</SelectItem>
                      <SelectItem value="confidentiality">Confidentiality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agreements List */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Agreement Directory</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Agreement Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAgreements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-slate-500">
                            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                            {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
                              <div>
                                <p className="text-lg font-medium">No agreements match your filters</p>
                                <p className="mt-1">Try adjusting your search or filter criteria</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-lg font-medium">No agreements found</p>
                                <p className="mt-1">Agreements will appear here when vendors are created with agreement types</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAgreements.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getInitialsColor(vendor.name)}`}>
                                <span className="font-medium text-sm">
                                  {getInitials(vendor.name)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{vendor.name}</div>
                                <div className="text-sm text-slate-500">{vendor.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{getAgreementType(vendor.agreementType || "")}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(vendor.agreementStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{vendor.contactName}</div>
                            <div className="text-sm text-slate-500">{vendor.contactEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                disabled
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                disabled
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">How Agreement Management Works</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• <strong>Create agreements:</strong> When adding vendors, select either Business Associate Agreement or Confidentiality Agreement</p>
                    <p>• <strong>Send for signature:</strong> Use "Send for Signature" to simulate e-signature workflow</p>
                    <p>• <strong>Upload existing documents:</strong> If you have signed agreements, upload them through each vendor's document management section</p>
                    <p>• <strong>Track status:</strong> Monitor agreement statuses (pending, signed, expired) across all vendors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}