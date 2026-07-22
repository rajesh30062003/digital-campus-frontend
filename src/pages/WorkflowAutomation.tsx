import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, CheckCircle2, XCircle, Clock, ShieldCheck, FileKey, BellRing, Mail,
  MessageSquare, Smartphone, Filter, Plus, Search, RefreshCw, UserCheck,
  GraduationCap, Building2, DollarSign, FileText, Award, Calendar, Box, BookOpen,
  Briefcase, Compass, Users, CreditCard, Bus, Home, Stethoscope, Layers, Lock,
  Eye, History, AlertCircle, ArrowRight, Shield, BadgeCheck, Sparkles, Send
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// 16 Domain definitions
const WORKFLOW_DOMAINS = [
  { id: "all", label: "All 16 Workflows", icon: Layers, color: "text-primary" },
  { id: "admissions", label: "Admissions", icon: UserCheck, color: "text-blue-500" },
  { id: "attendance", label: "Attendance", icon: Calendar, color: "text-indigo-500" },
  { id: "fee_reminders", label: "Fee Reminders", icon: DollarSign, color: "text-emerald-500" },
  { id: "result_publication", label: "Result Publication", icon: Award, color: "text-amber-500" },
  { id: "certificate_generation", label: "Certificate Gen", icon: FileText, color: "text-purple-500" },
  { id: "leave_approval", label: "Leave Approval", icon: Clock, color: "text-teal-500" },
  { id: "notifications", label: "Notifications", icon: BellRing, color: "text-rose-500" },
  { id: "inventory", label: "Inventory", icon: Box, color: "text-orange-500" },
  { id: "library", label: "Library", icon: BookOpen, color: "text-cyan-500" },
  { id: "placement", label: "Placement", icon: Briefcase, color: "text-blue-600" },
  { id: "research", label: "Research", icon: Compass, color: "text-violet-500" },
  { id: "hr", label: "HR & Staff", icon: Users, color: "text-pink-500" },
  { id: "payroll", label: "Payroll", icon: CreditCard, color: "text-emerald-600" },
  { id: "transport", label: "Transport", icon: Bus, color: "text-amber-600" },
  { id: "hostel", label: "Hostel", icon: Home, color: "text-red-500" },
  { id: "hospital", label: "Hospital", icon: Stethoscope, color: "text-rose-600" },
];

export default function WorkflowAutomation() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // Review & Sign states
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newWorkflowDialogOpen, setNewWorkflowDialogOpen] = useState(false);

  // Trigger form state
  const [newDomain, setNewDomain] = useState("admissions");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPayloadJson, setNewPayloadJson] = useState(JSON.stringify({ applicantName: "Jane Doe", department: "Computer Science", gpa: 3.9 }, null, 2));

  // Fetch Workflows & Rules
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/workflows?workflowType=${selectedDomain}&status=${statusFilter}&search=${searchQuery}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setWorkflows(json.data || []);
      }
    } catch (err: any) {
      toast({ title: "Error fetching workflows", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/workflows/rules", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setRules(json.data || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchRules();
  }, [selectedDomain, statusFilter]);

  // Seed default demo workflows
  const handleSeed = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/workflows/seed", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setWorkflows(json.data);
        toast({ title: "Institution Workflows Seeded", description: json.message });
      }
    } catch (err: any) {
      toast({ title: "Seeding error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Trigger New Workflow
  const handleTriggerNew = async () => {
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(newPayloadJson);
      } catch (e) {
        toast({ title: "Invalid JSON", description: "Please check your payload JSON formatting", variant: "destructive" });
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/workflows/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workflowType: newDomain,
          title: newTitle || `${newDomain.toUpperCase()} Workflow Request`,
          description: newDescription,
          payload: parsedPayload
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Workflow Triggered Successfully", description: `Initiated "${json.data.title}"` });
        setNewWorkflowDialogOpen(false);
        fetchWorkflows();
      }
    } catch (err: any) {
      toast({ title: "Trigger failed", description: err.message, variant: "destructive" });
    }
  };

  // Approve or Reject Step
  const handleReviewStep = async (action: "approve" | "reject") => {
    if (!selectedWorkflow) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workflows/${selectedWorkflow._id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, comments: reviewComment })
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: action === "approve" ? "Step Approved & Signed" : "Step Rejected",
          description: `Updated state for "${json.data.title}"`
        });
        setSelectedWorkflow(json.data);
        setReviewComment("");
        setReviewDialogOpen(false);
        fetchWorkflows();
      }
    } catch (err: any) {
      toast({ title: "Review failed", description: err.message, variant: "destructive" });
    }
  };

  // Sign Document
  const handleSignDocument = async (wfId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workflows/${wfId}/sign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Cryptographic Seal Applied",
          description: "Digital Signature generated and saved with timestamp."
        });
        fetchWorkflows();
      }
    } catch (err: any) {
      toast({ title: "Signing error", description: err.message, variant: "destructive" });
    }
  };

  // Metrics calculation
  const totalWorkflows = workflows.length;
  const pendingApprovals = workflows.filter(w => w.status === "pending" || w.status === "in_review").length;
  const completedWorkflows = workflows.filter(w => w.status === "approved" || w.status === "completed").length;
  const signedDocuments = workflows.filter(w => w.digitalSignature?.isSigned).length;
  const totalNotifications = workflows.reduce((acc, w) => acc + (w.notifications?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Top Banner */}
      <div className="relative p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-sm overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary">
                16 Institutional Workflows Active
              </Badge>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Institutional Workflow Automation</h1>
            <p className="text-muted-foreground text-xs max-w-3xl mt-1">
              End-to-end automated orchestration across Admissions, Attendance, Fee Reminders, Result Publication, Certificate Generation, Leave Approvals, Library, Placement, Research, HR, Payroll, Transport, Hostel, and Hospital.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSeed} variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset & Seed All 16 Workflows
            </Button>
            <Button onClick={() => setNewWorkflowDialogOpen(true)} size="sm" className="text-xs font-bold gap-1.5">
              <Plus className="h-4 w-4" />
              Trigger Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] font-bold uppercase">Total Executed</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black">{totalWorkflows}</p>
          <span className="text-[10px] text-muted-foreground">Across all 16 modules</span>
        </Card>
        <Card className="p-4 border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] font-bold uppercase">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingApprovals}</p>
          <span className="text-[10px] text-muted-foreground">Approval chain active</span>
        </Card>
        <Card className="p-4 border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] font-bold uppercase">Completed & Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500">{completedWorkflows}</p>
          <span className="text-[10px] text-muted-foreground">Finalized sign-offs</span>
        </Card>
        <Card className="p-4 border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] font-bold uppercase">Digital Signatures</span>
            <BadgeCheck className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-500">{signedDocuments}</p>
          <span className="text-[10px] text-muted-foreground">HMAC-SHA256 verified</span>
        </Card>
        <Card className="p-4 border bg-card col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[10px] font-bold uppercase font-sans">Notifications Sent</span>
            <BellRing className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500">{totalNotifications}</p>
          <span className="text-[10px] text-muted-foreground">Email • SMS • Push</span>
        </Card>
      </div>

      {/* Domain Selection Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {WORKFLOW_DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const active = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-card border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-primary-foreground" : domain.color}`} />
              <span>{domain.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 border rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWorkflows()}
            placeholder="Search by title, requester, keywords..."
            className="text-xs h-8 w-full sm:w-64"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-medium text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchWorkflows} size="sm" variant="ghost" className="h-8 px-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="instances" className="w-full">
        <TabsList className="bg-card border p-1 rounded-2xl w-full justify-start h-auto flex-wrap">
          <TabsTrigger value="instances" className="text-xs font-bold gap-1.5 py-2">
            <Layers className="h-3.5 w-3.5" />
            Active Workflow Instances
          </TabsTrigger>
          <TabsTrigger value="signatures" className="text-xs font-bold gap-1.5 py-2">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
            Digital Signatures & Seals
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-bold gap-1.5 py-2">
            <BellRing className="h-3.5 w-3.5 text-rose-500" />
            Multi-Channel Dispatch
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs font-bold gap-1.5 py-2">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            Automated Trigger Rules
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: WORKFLOW INSTANCES & APPROVAL CHAINS */}
        <TabsContent value="instances" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => {
              const currentRole = wf.approvalChain?.[wf.currentStep - 1]?.roleRequired || "Completed";
              const isApproved = wf.status === "approved" || wf.status === "completed";
              const isRejected = wf.status === "rejected";

              return (
                <Card key={wf._id} className="border hover:border-primary/50 transition-all flex flex-col justify-between">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30">
                        {wf.workflowType?.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={`text-[10px] font-bold capitalize ${
                          isApproved
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : isRejected
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {wf.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold mt-2 leading-tight">{wf.title}</CardTitle>
                    <CardDescription className="text-[11px] line-clamp-2 mt-1">{wf.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 text-xs space-y-3">
                    {/* Requester & Step Progress */}
                    <div className="bg-muted/30 p-2.5 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requester:</span>
                        <span className="font-semibold text-foreground">{wf.requesterName} ({wf.requesterRole})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approval Step:</span>
                        <span className="font-bold text-primary font-mono">
                          Step {wf.currentStep} of {wf.approvalChain?.length || 1} ({currentRole})
                        </span>
                      </div>
                    </div>

                    {/* Step Chain Avatars */}
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        Approval Chain Progress
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {wf.approvalChain?.map((step: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold font-mono border whitespace-nowrap ${
                              step.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : step.status === "rejected"
                                ? "bg-red-500/10 text-red-600 border-red-500/30"
                                : "bg-card text-muted-foreground border-border"
                            }`}
                          >
                            {step.status === "approved" ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : step.status === "rejected" ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500" />
                            )}
                            <span>{step.roleRequired}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Digital Signature Badge */}
                    {wf.digitalSignature?.isSigned && (
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-mono bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                        <BadgeCheck className="h-4 w-4 shrink-0 text-purple-600" />
                        <span className="truncate">Digital Seal: {wf.digitalSignature.signatureHash}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedWorkflow(wf);
                        setReviewDialogOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View & Review
                    </Button>
                    {!wf.digitalSignature?.isSigned && isApproved && (
                      <Button
                        onClick={() => handleSignDocument(wf._id)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Seal
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: DIGITAL SIGNATURE ENGINE */}
        <TabsContent value="signatures" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                HMAC-SHA256 Digital Signature & Document Seal Register
              </CardTitle>
              <CardDescription className="text-xs">
                All approved institutional documents (transcripts, offer letters, payroll vouchers, clinical reports) are cryptographically signed with tamper-proof hashing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y border rounded-xl overflow-hidden text-xs">
                {workflows
                  .filter((w) => w.digitalSignature?.isSigned)
                  .map((wf) => (
                    <div key={wf._id} className="p-4 bg-card hover:bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-purple-600 border-purple-300">
                            {wf.workflowType}
                          </Badge>
                          <h4 className="font-bold text-sm">{wf.title}</h4>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          Signed By: <span className="font-semibold text-foreground">{wf.digitalSignature?.signerName}</span> ({wf.digitalSignature?.signerRole}) on {new Date(wf.digitalSignature?.signedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="font-mono text-[10px] space-y-1 bg-purple-500/5 p-2.5 rounded-lg border border-purple-500/20 max-w-md">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Document Hash:</span>
                          <span className="text-foreground truncate">{wf.digitalSignature?.documentHash}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">HMAC Seal:</span>
                          <span className="text-purple-600 font-bold truncate">{wf.digitalSignature?.signatureHash}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: MULTI-CHANNEL NOTIFICATION DISPATCH */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BellRing className="h-5 w-5 text-rose-500" />
                Multi-Channel Notification Gateway (Email • SMS • Push)
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tracking of notifications dispatched automatically by institution workflow triggers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows.flatMap((w) =>
                  (w.notifications || []).map((notif: any, idx: number) => (
                    <div key={`${w._id}-${idx}`} className="p-3 border rounded-xl bg-card flex items-start gap-3 text-xs">
                      <div className="p-2 rounded-lg bg-muted shrink-0">
                        {notif.channel === "email" ? (
                          <Mail className="h-4 w-4 text-blue-500" />
                        ) : notif.channel === "sms" ? (
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold">
                              {notif.channel}
                            </Badge>
                            <span className="font-bold text-foreground truncate">{notif.subject}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(notif.dispatchedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{notif.message}</p>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Recipient: <span className="text-foreground">{notif.recipient}</span> • Workflow: {w.title}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: AUTOMATED TRIGGER RULES */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <Card key={rule._id} className="border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary">
                      {rule.workflowType}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                      Trigger Enabled
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold mt-2">{rule.name}</CardTitle>
                  <CardDescription className="text-[11px]">{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs space-y-2">
                  <div className="p-2 bg-muted/40 rounded-lg text-[11px] space-y-1 font-mono">
                    <div>
                      <span className="text-muted-foreground">Event Hook:</span>{" "}
                      <span className="text-primary font-bold">{rule.triggerEvent}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approval Chain Roles:</span>{" "}
                      <span className="text-foreground">{rule.approvalRoles?.join(" ➔ ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Notification Channels:</span>{" "}
                      <span className="text-foreground">{rule.notificationChannels?.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* REVIEW & APPROVAL DIALOG */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Review Workflow & Approve Step
            </DialogTitle>
            <DialogDescription className="text-xs">
              Examine request details, approval steps, and audit logs.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkflow && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-muted/30 rounded-xl space-y-2 border">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground text-sm">{selectedWorkflow.title}</span>
                  <Badge variant="outline" className="uppercase font-bold text-primary">
                    {selectedWorkflow.workflowType}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">{selectedWorkflow.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-muted-foreground">Requester:</span>{" "}
                    <span className="font-semibold">{selectedWorkflow.requesterName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className="font-bold capitalize">{selectedWorkflow.status}</span>
                  </div>
                </div>
              </div>

              {/* Payload Parameters */}
              <div>
                <h4 className="font-bold mb-1 text-foreground">Payload Data Parameters:</h4>
                <pre className="bg-card p-3 rounded-xl border text-[10px] font-mono overflow-x-auto text-muted-foreground">
                  {JSON.stringify(selectedWorkflow.payload, null, 2)}
                </pre>
              </div>

              {/* Approval Steps Detail */}
              <div>
                <h4 className="font-bold mb-2 text-foreground">Approval Chain Progression:</h4>
                <div className="space-y-2">
                  {selectedWorkflow.approvalChain?.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
                        step.status === "approved"
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : step.status === "rejected"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono">
                          Step {step.stepIndex}: {step.roleRequired}
                        </span>
                        <Badge
                          className={`text-[9px] uppercase font-bold ${
                            step.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-600"
                              : step.status === "rejected"
                              ? "bg-red-500/20 text-red-600"
                              : "bg-amber-500/20 text-amber-600"
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </div>
                      {step.approverName && (
                        <p className="text-[11px] text-muted-foreground">
                          Reviewed by <span className="font-semibold text-foreground">{step.approverName}</span> — Comments: "{step.comments}"
                        </p>
                      )}
                      {step.digitalSignature?.signatureHash && (
                        <div className="font-mono text-[9px] text-purple-600">
                          Step Digital Signature: {step.digitalSignature.signatureHash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              {selectedWorkflow.status !== "completed" && selectedWorkflow.status !== "rejected" && selectedWorkflow.status !== "approved" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-[11px] font-bold">Review Comments / Notes</Label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Enter approval rationale or rejection reason..."
                    className="text-xs min-h-[60px]"
                  />
                </div>
              )}

              {/* Audit Log Trail */}
              <div>
                <h4 className="font-bold mb-1 text-foreground">Workflow Audit Trail:</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border rounded-xl p-2.5 bg-muted/10 font-mono text-[10px]">
                  {selectedWorkflow.auditTrail?.map((a: any, aIdx: number) => (
                    <div key={aIdx} className="border-b pb-1 last:border-none">
                      <span className="text-primary font-bold">[{new Date(a.timestamp).toLocaleTimeString()}]</span>{" "}
                      <span className="text-foreground">{a.actorName} ({a.actorRole}):</span> {a.details}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedWorkflow?.status !== "completed" && selectedWorkflow?.status !== "rejected" && selectedWorkflow?.status !== "approved" && (
              <>
                <Button onClick={() => handleReviewStep("reject")} variant="destructive" size="sm" className="text-xs font-semibold">
                  Reject Step
                </Button>
                <Button onClick={() => handleReviewStep("approve")} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                  Approve & Digitally Sign Step
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW WORKFLOW DIALOG */}
      <Dialog open={newWorkflowDialogOpen} onOpenChange={setNewWorkflowDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Trigger Custom Institution Workflow
            </DialogTitle>
            <DialogDescription className="text-xs">
              Initiate a new multi-approval workflow across any of the 16 institutional domains.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Select Domain</Label>
              <Select value={newDomain} onValueChange={setNewDomain}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORKFLOW_DOMAINS.filter((d) => d.id !== "all").map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Workflow Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Leave clearance request for Dr. Smith"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Description / Purpose</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe reason or background..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Payload Data (JSON)</Label>
              <Textarea
                value={newPayloadJson}
                onChange={(e) => setNewPayloadJson(e.target.value)}
                className="font-mono text-[11px] min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleTriggerNew} size="sm" className="w-full text-xs font-bold">
              Dispatch Workflow Execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
