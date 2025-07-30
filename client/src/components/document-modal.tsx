import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Send, Download, Eye, Trash2, FileText, Shield, File, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { vendorApi } from "@/lib/vendor-api";
import type { Vendor, Document } from "@shared/schema";

interface DocumentModalProps {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentModal({ vendor, open, onOpenChange }: DocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("other");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/vendors", vendor.id, "documents"],
    queryFn: () => vendorApi.getVendorDocuments(vendor.id),
    enabled: open,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, name, type }: { file: File; name: string; type: string }) =>
      vendorApi.uploadDocument(vendor.id, file, name, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor.id, "documents"] });
      setSelectedFile(null);
      setDocumentName("");
      setDocumentType("other");
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: vendorApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor.id, "documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const sendAgreementMutation = useMutation({
    mutationFn: () => vendorApi.sendAgreement(vendor.id),
    onSuccess: (data) => {
      toast({
        title: "Agreement Sent",
        description: `E-signature request sent to ${data.email}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send agreement",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentName.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and enter a document name",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate({
      file: selectedFile,
      name: documentName,
      type: documentType,
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "agreement":
        return <File className="text-red-600 h-5 w-5" />;
      case "risk_assessment":
        return <FileText className="text-blue-600 h-5 w-5" />;
      case "insurance":
        return <Shield className="text-purple-600 h-5 w-5" />;
      default:
        return <FileText className="text-slate-600 h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDocumentType = (type: string) => {
    switch (type) {
      case "agreement":
        return "Business Associate Agreement";
      case "risk_assessment":
        return "Vendor Risk Assessment";
      case "insurance":
        return "Insurance Certificate";
      default:
        return "Document";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Documents - {vendor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Actions */}
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-slate-700">Document Management</h4>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById('document-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Button onClick={() => sendAgreementMutation.mutate()}>
                <Send className="mr-2 h-4 w-4" />
                Send for Signature
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  {selectedFile ? selectedFile.name : "Choose File"}
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Name
                </label>
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Type
                </label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agreement">Agreement</SelectItem>
                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadDocumentMutation.isPending}
                className="w-full"
              >
                Upload Document
              </Button>
            )}
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-slate-700">Uploaded Documents</h5>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg mr-4"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-40 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 bg-slate-200 rounded w-16"></div>
                        <div className="h-8 bg-slate-200 rounded w-8"></div>
                        <div className="h-8 bg-slate-200 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium">No documents uploaded</p>
                <p className="mt-1">Upload your first document to get started</p>
              </div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-slate-100 rounded-lg mr-4">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-900">
                          {document.name || formatDocumentType(document.type)}
                        </h5>
                        <p className="text-xs text-slate-500">
                          Uploaded on {new Date(document.uploadedAt || "").toLocaleDateString()} 
                          {document.fileSize && ` • ${document.fileSize}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(document.status)}
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Risk Assessment Questionnaire Section */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-slate-900">Vendor Risk Analysis Questionnaire</h5>
                <p className="text-xs text-slate-500 mt-1">Security posture assessment for vendor evaluation</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Create New
                </Button>
                <Button size="sm" disabled>
                  Send Questionnaire
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-600">
              <Info className="mr-1 h-3 w-3" />
              Coming soon: Full questionnaire management system with custom security assessment forms
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
