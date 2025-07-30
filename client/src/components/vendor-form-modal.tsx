import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { vendorApi } from "@/lib/vendor-api";
import { insertVendorSchema } from "@shared/schema";
import type { Vendor, InsertVendor } from "@shared/schema";
import { z } from "zod";

const formSchema = insertVendorSchema.extend({
  agreementAction: z.enum(["new", "existing", "none"]).optional(),
  agreementFile: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VendorFormModalProps {
  vendor?: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorFormModal({ vendor, open, onOpenChange }: VendorFormModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: vendor ? {
      name: vendor.name,
      address: vendor.address,
      phone: vendor.phone,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      agreementType: vendor.agreementType || "",
      agreementStatus: vendor.agreementStatus,
      riskStatus: vendor.riskStatus,
    } : {
      name: "",
      address: "",
      phone: "",
      contactName: "",
      contactEmail: "",
      agreementType: "",
      agreementStatus: "pending",
      riskStatus: "not_started",
      agreementAction: "none",
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: vendorApi.createVendor,
    onSuccess: (newVendor) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Handle file upload if present
      if (uploadedFile && form.getValues("agreementAction") === "existing") {
        uploadDocument(newVendor.id);
      }
      
      // Handle e-signature if selected
      if (form.getValues("agreementAction") === "new") {
        sendAgreementMutation.mutate(newVendor.id);
      }
      
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVendor> }) =>
      vendorApi.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    },
  });

  const sendAgreementMutation = useMutation({
    mutationFn: vendorApi.sendAgreement,
    onSuccess: (data) => {
      toast({
        title: "Agreement Sent",
        description: `E-signature request sent to ${data.email} for ${data.vendor}`,
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

  const uploadDocument = async (vendorId: string) => {
    if (!uploadedFile) return;
    
    try {
      await vendorApi.uploadDocument(
        vendorId,
        uploadedFile,
        "Business Associate Agreement",
        "agreement"
      );
      toast({
        title: "Success", 
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    const { agreementAction, agreementFile, ...vendorData } = data;
    
    if (vendor) {
      updateVendorMutation.mutate({ id: vendor.id, data: vendorData });
    } else {
      createVendorMutation.mutate(vendorData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const agreementAction = form.watch("agreementAction");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add New Vendor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-700">Basic Information</h4>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter full business address"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-700">Primary Contact</h4>
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter primary contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@vendor.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Agreement Management */}
            {!vendor && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-slate-700">Agreement Management</h4>
                
                <FormField
                  control={form.control}
                  name="agreementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agreement type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baa">Business Associate Agreement</SelectItem>
                          <SelectItem value="confidentiality">Confidentiality Agreement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreementAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Action</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="new" />
                            <Label htmlFor="new" className="text-sm text-slate-700">
                              Send new agreement for e-signature
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="existing" id="existing" />
                            <Label htmlFor="existing" className="text-sm text-slate-700">
                              Upload existing signed agreement
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="none" />
                            <Label htmlFor="none" className="text-sm text-slate-700">
                              Skip agreement for now
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload Section */}
                {agreementAction === "existing" && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-slate-700">Document Upload</h4>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <div className="text-3xl text-slate-400 mb-2">📄</div>
                      <p className="text-sm text-slate-600 mb-2">
                        {uploadedFile ? uploadedFile.name : "Drag and drop your signed agreement here, or"}
                      </p>
                      <input
                        type="file"
                        id="agreementFile"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => document.getElementById('agreementFile')?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium p-0"
                      >
                        browse files
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
              >
                {vendor ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Vendor
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Vendor
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
