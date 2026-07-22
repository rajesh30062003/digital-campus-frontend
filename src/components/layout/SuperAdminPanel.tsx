import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saasApi, IInstitutionConfig } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ShieldAlert, School, Landmark, CheckSquare, Sparkles, AlertCircle,
  Database, Users, Loader2, DollarSign, Calendar, Edit2, Trash2, Key, HelpCircle
} from "lucide-react";

export function SuperAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [selectedTenant, setSelectedTenant] = useState<IInstitutionConfig | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editUserQuota, setEditUserQuota] = useState(0);
  const [editStorageQuota, setEditStorageQuota] = useState(0);
  const [editLicensedModules, setEditLicensedModules] = useState<string[]>([]);

  // Fetch all institutions registered on the SaaS grid
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["super-institutions"],
    queryFn: saasApi.superGetInstitutions,
  });

  const institutions: IInstitutionConfig[] = response?.data || [];

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; body: Partial<IInstitutionConfig> }) =>
      saasApi.superUpdateInstitution(data.id, data.body),
    onSuccess: () => {
      toast({ title: "SaaS Parameters Saved", description: "Institution quotas and licensing refitted on the SaaS cluster." });
      setSelectedTenant(null);
      queryClient.invalidateQueries({ queryKey: ["super-institutions"] });
    },
    onError: (err: any) => {
      toast({ title: "Action Failed", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => saasApi.superDeleteInstitution(id),
    onSuccess: () => {
      toast({ title: "Institution Decommissioned", description: "The tenant profile and administrative accounts have been archived." });
      queryClient.invalidateQueries({ queryKey: ["super-institutions"] });
    },
    onError: (err: any) => {
      toast({ title: "Decommissioning Failed", description: err.message, variant: "destructive" });
    }
  });

  const handleEditClick = (tenant: IInstitutionConfig) => {
    setSelectedTenant(tenant);
    setEditPlan(tenant.subscriptionPlan || "Trial");
    setEditUserQuota(tenant.userQuota || 50);
    setEditStorageQuota(tenant.storageQuota || 1024 * 1024 * 1024);
    setEditLicensedModules(tenant.licensedModules || []);
  };

  const handleSaveQuotas = () => {
    if (!selectedTenant?._id) return;
    updateMutation.mutate({
      id: selectedTenant._id,
      body: {
        subscriptionPlan: editPlan as any,
        userQuota: Number(editUserQuota),
        storageQuota: Number(editStorageQuota),
        licensedModules: editLicensedModules
      }
    });
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm("Are you sure you want to decommission this entire institution? This archives all medical files, rosters, and revokes login access for all users under this tenant.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModuleToggle = (mod: string) => {
    if (editLicensedModules.includes(mod)) {
      setEditLicensedModules(editLicensedModules.filter((m) => m !== mod));
    } else {
      setEditLicensedModules([...editLicensedModules, mod]);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // SaaS General Statistics
  const totalRevenue = institutions.reduce((acc, curr) => acc + (curr.monthlyPrice || 0), 0);
  const totalUsersAcrossTenants = institutions.reduce((acc, curr) => acc + (curr.userCount || 0), 0);
  const totalStorageAcrossTenants = institutions.reduce((acc, curr) => acc + (curr.storageUsed || 0), 0);

  // Complete modules catalog
  const modulesCatalog = [
    "admissions", "academics", "departments", "courses", "attendance", "timetable",
    "examination", "results", "fees", "library", "hostel", "transport", "hr",
    "research", "placement", "parents", "alumni", "inventory", "hospital",
    "clinical-postings", "laboratory", "pharmacy", "ai-assistant"
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-slate-500">Connecting to SaaS administration grid...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SaaS Admin Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <Card className="border border-purple-200 dark:border-purple-950 bg-purple-50/20 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-purple-600 font-bold tracking-wider uppercase">SaaS Monthly MRR</p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">${totalRevenue}.00</p>
            </div>
            <div className="h-10 w-10 bg-purple-600/10 rounded-lg flex items-center justify-center text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase font-sans">Active Institutions</p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{institutions.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
              <School className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase font-sans">Combined Storage</p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{formatBytes(totalStorageAcrossTenants)}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-600">
              <Database className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase font-sans">SaaS Grid Users</p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{totalUsersAcrossTenants}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-600/10 rounded-lg flex items-center justify-center text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Primary Workspace Institutions Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Institutions List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4 text-purple-600" /> Multi-Tenant Institutions
              </CardTitle>
              <CardDescription>
                Overview of active tenants, subscription status, and live capacity parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {institutions.length > 0 ? (
                  institutions.map((inst) => {
                    const planColor =
                      inst.subscriptionPlan === "Enterprise"
                        ? "bg-emerald-100 text-emerald-800"
                        : inst.subscriptionPlan === "Professional"
                        ? "bg-blue-100 text-blue-800"
                        : inst.subscriptionPlan === "Basic"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-800";
                    return (
                      <div key={inst._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{inst.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${planColor}`}>
                              {inst.subscriptionPlan}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                            <span>Subdomain: {inst.subdomain || "—"}</span>
                            <span>Mapped Custom Domain: {inst.domain || "—"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-4">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3 text-purple-500" /> {inst.userCount || 0}/{inst.userQuota} users</span>
                            <span className="flex items-center gap-1"><Database className="h-3 w-3 text-purple-500" /> {formatBytes(inst.storageUsed || 0)}/{formatBytes(inst.storageQuota || 0)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(inst)}
                            className="h-8 text-xs flex items-center gap-1 border-purple-200 hover:border-purple-300 hover:text-purple-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTenant(inst._id as string)}
                            className="h-8 text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Decommission
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center text-slate-400">
                    No institutions onboarded to the SaaS cluster yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Inline Quotas and Module License Editor */}
        <div className="space-y-4">
          {selectedTenant ? (
            <Card className="border border-purple-200 dark:border-purple-900 shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  SaaS Controller: {selectedTenant.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  Govern billing presets, physical cloud capacities, and granular licensing switches.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                {/* Plan Override Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="super-plan">System Subscription Plan</Label>
                  <select
                    id="super-plan"
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs ring-offset-white focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Trial">Trial</option>
                    <option value="Basic">Basic</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* User Limit Override */}
                <div className="space-y-1.5">
                  <Label htmlFor="super-user-quota">Enrolled User Quota</Label>
                  <Input
                    id="super-user-quota"
                    type="number"
                    value={editUserQuota}
                    onChange={(e) => setEditUserQuota(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Storage Override */}
                <div className="space-y-1.5">
                  <Label htmlFor="super-storage-quota">Storage Quota (in Bytes)</Label>
                  <Input
                    id="super-storage-quota"
                    type="number"
                    value={editStorageQuota}
                    onChange={(e) => setEditStorageQuota(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 font-mono">
                    = {formatBytes(editStorageQuota)} capacity limit
                  </p>
                </div>

                <Separator />

                {/* Granular Module Licensing Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-purple-600" />
                    Licensed Modules ({editLicensedModules.length})
                  </Label>
                  <p className="text-[10px] text-slate-400">
                    Control which features this tenant is allowed to enable or purchase.
                  </p>
                  <div className="border border-slate-100 dark:border-slate-800 rounded-md p-2 max-h-[160px] overflow-y-auto space-y-1.5 text-xs">
                    {modulesCatalog.map((mod) => {
                      const isChecked = editLicensedModules.includes(mod);
                      return (
                        <label key={mod} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleModuleToggle(mod)}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                          />
                          <span className="capitalize font-mono text-[11px]">{mod.replace("-", " ")}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-purple-50/50 dark:bg-purple-950/15 border-t border-purple-100 p-4 flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTenant(null)}
                  className="h-8 text-xs text-slate-600 border-purple-200"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveQuotas}
                  disabled={updateMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs shadow-md"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Quotas"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <Edit2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-700 text-sm">Tenant Editor</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Select an institution from the registry to adjust pricing tiers, custom byte storage capacities, and modular licenses.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
