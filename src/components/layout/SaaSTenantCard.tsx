import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saasApi, IInstitutionConfig } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useInstitution } from "@/hooks/useInstitution";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Globe, Database, Users, ShieldAlert, CheckCircle2,
  AlertCircle, History, Sparkles, Loader2, ArrowUpRight, Check, CheckSquare
} from "lucide-react";

export function SaasTenantCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { config: instConfig, isUpdating } = useInstitution();
  
  const [subdomain, setSubdomain] = useState(instConfig?.subdomain || "");
  const [customDomain, setCustomDomain] = useState(instConfig?.domain || "");
  const [whiteLabel, setWhiteLabel] = useState(instConfig?.isWhiteLabeled || false);
  const [modulesTab, setModulesTab] = useState(false);

  // Fetch real-time analytics & logs
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ["tenant-analytics"],
    queryFn: saasApi.getAnalytics,
    refetchInterval: 10000 // Refetch every 10 seconds for dynamic live updates
  });

  const analytics = analyticsRes?.data;

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => saasApi.updateConfig(data),
    onSuccess: () => {
      toast({ title: "Configuration Updated", description: "Your workspace settings have been synchronized." });
      queryClient.invalidateQueries({ queryKey: ["tenant-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["institution-config"] });
    },
    onError: (err: any) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  });

  const processPaymentMutation = useMutation({
    mutationFn: (data: { amountPaid: number }) => saasApi.processPayment(data),
    onSuccess: (res) => {
      toast({ title: "Payment Successful", description: res.message });
      queryClient.invalidateQueries({ queryKey: ["tenant-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["institution-config"] });
    },
    onError: (err: any) => {
      toast({ title: "Transaction Failed", description: err.message, variant: "destructive" });
    }
  });

  const handleSaveDomainBranding = () => {
    updateConfigMutation.mutate({
      subdomain: subdomain.trim(),
      domain: customDomain.trim(),
      isWhiteLabeled: whiteLabel
    });
  };

  const handlePayInvoice = () => {
    processPaymentMutation.mutate({ amountPaid: analytics?.subscription?.monthlyPrice || 49 });
  };

  const handleUpgradePlan = (planId: string, price: number) => {
    // We update the tenant's plan
    updateConfigMutation.mutate({
      subscriptionPlan: planId,
    });
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const plansList = [
    { id: "Basic", name: "Basic Plan", price: 49, storage: "10 GB", users: 200, icon: Users },
    { id: "Professional", name: "Professional Plan", price: 149, storage: "50 GB", users: 1500, icon: Sparkles },
    { id: "Enterprise", name: "Enterprise Plan", price: 499, storage: "1 TB", users: "Unlimited", icon: ArrowUpRight }
  ];

  if (analyticsLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-slate-500">Loading live subscription engine stats...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SaaS Status & Dynamic Billing Summary */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-purple-900/60 text-purple-100 px-2 py-0.5 rounded-full">
                SaaS Subscription Active
              </span>
              <h2 className="text-2xl font-bold mt-1 tracking-tight">
                {analytics?.subscription?.plan} Tier
              </h2>
              <p className="text-purple-200 text-xs mt-0.5 flex items-center gap-1">
                Next Billing Date: {analytics?.subscription?.nextBillingDate ? new Date(analytics.subscription.nextBillingDate).toLocaleDateString() : "Pending"}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-right">
                <p className="text-[10px] text-purple-200 uppercase font-medium">Monthly Cost</p>
                <p className="text-lg font-bold">${analytics?.subscription?.monthlyPrice || 0}.00</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePayInvoice}
                disabled={processPaymentMutation.isPending}
                className="bg-white text-purple-800 hover:bg-slate-100 h-8"
              >
                {processPaymentMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                )}
                Pay Now
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Storage & User Quota Resource Meters */}
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* User Quota Bar */}
          <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Users className="h-4 w-4 text-purple-600" />
                Users Enrolled Quota
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {analytics?.usage?.userCount} / {analytics?.usage?.userQuota} ({analytics?.usage?.userPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (analytics?.usage?.userPercentage || 0) > 90 ? "bg-red-500" : "bg-purple-600"
                }`}
                style={{ width: `${Math.min(analytics?.usage?.userPercentage || 0, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * Limits campus scaling. Upgrade plans to admit more faculty and students.
            </p>
          </div>

          {/* Storage Quota Bar */}
          <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Database className="h-4 w-4 text-purple-600" />
                SaaS Cloud Storage Meter
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {formatBytes(analytics?.usage?.storageUsed)} / {formatBytes(analytics?.usage?.storageQuota)} ({analytics?.usage?.storagePercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (analytics?.usage?.storagePercentage || 0) > 90 ? "bg-red-500" : "bg-indigo-600"
                }`}
                style={{ width: `${Math.min(analytics?.usage?.storagePercentage || 0, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * Counts library manuscripts, course slides, clinical media uploads.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Domain Mapping, Branding & White-Label Panel */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" /> Domain & Branding Workspace
          </CardTitle>
          <CardDescription>
            Configure domain mappings, custom branding parameters, and Enterprise white-label properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <Label htmlFor="subdomain-map">Workspace Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain-map"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. mit"
                />
                <span className="bg-slate-50 border border-l-0 border-slate-200 px-2.5 py-2 rounded-r-md text-xs font-mono text-slate-400">
                  .campus.com
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-domain-map">Mapped Custom Domain</Label>
              <Input
                id="custom-domain-map"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
                placeholder="e.g. medical-college.edu"
              />
            </div>

          </div>

          <Separator />

          {/* White-Label Control */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-1.5">
                White-Label Support
                {analytics?.subscription?.plan !== "Enterprise" && (
                  <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                    Requires Enterprise
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                Completely strip "Digital Campus" credits, footers, and logos across all portals.
              </p>
            </div>
            <Switch
              checked={whiteLabel}
              disabled={analytics?.subscription?.plan !== "Enterprise"}
              onCheckedChange={(val) => setWhiteLabel(val)}
            />
          </div>

        </CardContent>
        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800 px-5 py-3 flex justify-end">
          <Button
            size="sm"
            onClick={handleSaveDomainBranding}
            disabled={updateConfigMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            {updateConfigMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Save SaaS Settings"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Plan Upgrading / Subscription Switcher */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Upgrade Subscription Tiers
          </CardTitle>
          <CardDescription>
            Dynamically upgrade or switch subscription plans instantly. Quotas and licensing modules are refitted at once.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plansList.map((p) => {
            const isCurrent = analytics?.subscription?.plan === p.id;
            return (
              <div
                key={p.id}
                className={`border rounded-xl p-4 flex flex-col justify-between ${
                  isCurrent ? "bg-purple-50/20 border-purple-600 ring-1 ring-purple-600" : "border-slate-200 dark:border-slate-800 bg-slate-50/50"
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{p.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1 mb-3">
                    <span className="text-xl font-bold">${p.price}</span>
                    <span className="text-[10px] text-slate-400">/mo</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <p>• {p.users} user capacity</p>
                    <p>• {p.storage} cloud space</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : "default"}
                  onClick={() => handleUpgradePlan(p.id, p.price)}
                  className={`w-full mt-4 text-xs h-8 ${isCurrent ? "border-purple-600 text-purple-600" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                  disabled={isCurrent || updateConfigMutation.isPending}
                >
                  {isCurrent ? <Check className="h-3.5 w-3.5 mr-1" /> : null}
                  {isCurrent ? "Current Plan" : `Upgrade`}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Real-time Institution Audit Logs */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" /> Security Audit Log & Compliance
          </CardTitle>
          <CardDescription>
            Real-time auditable tracking of system settings modifications, credential edits, and clinical updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[250px] scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Ip Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {analytics?.auditLogs?.length > 0 ? (
                    analytics.auditLogs.map((log: any, i: number) => (
                      <tr key={log._id || i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.userName || "System / Guest"}
                        </td>
                        <td className="p-2.5 capitalize whitespace-nowrap">{log.userRole || "—"}</td>
                        <td className="p-2.5 font-bold text-purple-600 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">{log.ipAddress || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                        No auditable records found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
