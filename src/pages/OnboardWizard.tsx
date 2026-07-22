import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { saasApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  School, Check, Shield, Globe, Landmark, LayoutGrid, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, CreditCard, Sparkles, Database, Users
} from "lucide-react";

export default function OnboardWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [institutionType, setInstitutionType] = useState("Medical College");
  const [plan, setPlan] = useState<"Trial" | "Basic" | "Professional" | "Enterprise">("Trial");
  
  // Admin credentials
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const stepsCount = 4;

  const mutation = useMutation({
    mutationFn: async () => {
      return saasApi.register({
        name,
        subdomain,
        institutionType,
        adminName,
        adminEmail,
        adminPassword,
        plan
      });
    },
    onSuccess: (res) => {
      toast({
        title: "Welcome to Digital Campus SaaS!",
        description: "Your institution has been successfully provisioned on our cloud grid.",
      });
      // Save credentials & active tenant
      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("activeInstitutionId", res.data.tenant._id);
      
      // Redirect to settings / main page
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    },
    onError: (err: any) => {
      toast({
        title: "Onboarding Failed",
        description: err.message || "Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  });

  const nextStep = () => {
    if (step === 1 && (!name || !institutionType)) {
      toast({ title: "Validation Error", description: "Institution name and type are required", variant: "destructive" });
      return;
    }
    if (step === 2 && !subdomain) {
      toast({ title: "Validation Error", description: "Workspace subdomain is required", variant: "destructive" });
      return;
    }
    if (step === 3 && (!adminName || !adminEmail || !adminPassword)) {
      toast({ title: "Validation Error", description: "Admin details are required", variant: "destructive" });
      return;
    }
    if (step < stepsCount) {
      setStep(step + 1);
    } else {
      mutation.mutate();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Plans helper definitions
  const plansData = [
    {
      id: "Trial",
      name: "Trial Plan",
      price: "$0",
      period: "14 Days",
      users: "20 Users max",
      storage: "1 GB cloud storage",
      modules: "5 Core modules",
      color: "border-slate-200 dark:border-slate-800",
      badge: "Sandbox"
    },
    {
      id: "Basic",
      name: "Basic Plan",
      price: "$49",
      period: "per month",
      users: "200 Users max",
      storage: "10 GB cloud storage",
      modules: "11 Standard modules",
      color: "border-purple-200 dark:border-purple-900",
      badge: "Popular"
    },
    {
      id: "Professional",
      name: "Professional",
      price: "$149",
      period: "per month",
      users: "1,500 Users max",
      storage: "50 GB cloud storage",
      modules: "19 Advanced modules",
      color: "border-indigo-300 dark:border-indigo-900",
      badge: "Enterprise Lite"
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      price: "$499",
      period: "per month",
      users: "Unlimited Users",
      storage: "1 TB dedicated storage",
      modules: "23 Modules + AI Assistant",
      color: "border-emerald-300 dark:border-emerald-900",
      badge: "White-Label & AI"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Branding Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-3 text-white">
          <School className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Digital Campus SaaS Cloud
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Enterprise Multi-Tenant Institutional Operating System
        </p>
      </div>

      <div className="w-full max-w-4xl">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between px-4 mb-6">
          {[
            { idx: 1, label: "Institution Profile", icon: Landmark },
            { idx: 2, label: "Workspace Address", icon: Globe },
            { idx: 3, label: "System Administrator", icon: Shield },
            { idx: 4, label: "Subscription Tier", icon: CreditCard },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.idx;
            const isActive = step === s.idx;
            return (
              <div key={s.idx} className="flex flex-col items-center flex-1 relative">
                {s.idx > 1 && (
                  <div
                    className={`absolute right-[50%] left-[-50%] top-5 h-[2px] -z-10 transition-colors duration-300 ${
                      isCompleted ? "bg-purple-600" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-purple-600 border-purple-600 text-white"
                      : isActive
                      ? "border-purple-600 bg-white dark:bg-slate-900 text-purple-600 shadow-md scale-110"
                      : "border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[10px] md:text-xs font-medium mt-2 text-center hidden md:block ${
                    isActive ? "text-purple-600" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Core Wizard Panel */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-6 md:p-10">
                
                {/* Step 1: Profile */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Landmark className="text-purple-600 h-5 w-5" />
                        Configure Institutional Identity
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Define basic metadata and classification parameters for your university.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="inst-name">Institution Name</Label>
                        <Input
                          id="inst-name"
                          placeholder="e.g. Stanford Medical University"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inst-type">Institution Type</Label>
                        <select
                          id="inst-type"
                          value={institutionType}
                          onChange={(e) => setInstitutionType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="Medical College">Medical College</option>
                          <option value="Nursing Institute">Nursing Institute</option>
                          <option value="Dental College">Dental College</option>
                          <option value="Engineering College">Engineering College</option>
                          <option value="General University">General University</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Subdomain */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Globe className="text-purple-600 h-5 w-5" />
                        Workspace Domain Mapping
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Secure a unique host identifier for isolated tenant data storage.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="subdomain">Workspace Subdomain</Label>
                      <div className="flex items-center">
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-md text-sm text-slate-500 select-none">
                          https://
                        </span>
                        <Input
                          id="subdomain"
                          placeholder="mit"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="rounded-none rounded-r-md"
                        />
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-md text-sm text-slate-500 select-none hidden sm:inline">
                          .digitalcampus.com
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        * Allowed: lowercase letters, numbers, and hyphens only. Highly isolated database namespace.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Admin User */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Shield className="text-purple-600 h-5 w-5" />
                        Primary System Administrator
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Create the super user account representing the Institution Admin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Administrator Name</Label>
                        <Input
                          id="admin-name"
                          placeholder="Dr. Alexander Vance"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Official Admin Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="vance@university.edu"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin-pass">Secure Admin Password</Label>
                        <Input
                          id="admin-pass"
                          type="password"
                          placeholder="Minimum 6 complex characters"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Subscription Tier */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles className="text-purple-600 h-5 w-5" />
                        Select SaaS Subscription Plan
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Choose a dynamic subscription plan that scales with your institutional capacity.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {plansData.map((p) => {
                        const isSelected = plan === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setPlan(p.id as any)}
                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                              isSelected
                                ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-600"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                                  {p.badge}
                                </span>
                                {isSelected && (
                                  <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                {p.name}
                              </h3>
                              <div className="flex items-baseline gap-1 mt-2 mb-4">
                                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  {p.price}
                                </span>
                                <span className="text-xs text-slate-400">
                                  /{p.period.includes("month") ? "mo" : "trial"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                <span>{p.users}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Database className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                <span>{p.storage}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <LayoutGrid className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                <span>{p.modules}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </CardContent>

              <CardFooter className="bg-slate-50 dark:bg-slate-900/30 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1 || mutation.isPending}
                  className="flex items-center gap-1.5 text-xs text-slate-600"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={mutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 text-xs shadow-md"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Provisioning Campus...
                    </>
                  ) : step === stepsCount ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Complete Registration
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
