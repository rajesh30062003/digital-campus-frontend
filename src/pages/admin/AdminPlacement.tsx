import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placementApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Briefcase, Users, TrendingUp, ChevronRight, Check, X } from "lucide-react";

const INDUSTRIES = ["Technology", "Finance", "Manufacturing", "Healthcare", "Education", "Consulting", "E-Commerce", "Telecom", "Automotive", "Other"];
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Information Technology", "All"];

function CompanyForm({ onSave, onClose }: { onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", industry: "", location: "", website: "", contactEmail: "", description: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Company Name *</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Google India" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Industry</label>
          <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Location *</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Bangalore, India" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Website</label>
          <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://google.com" /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Contact Email</label>
        <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="campus@google.com" /></div>
      <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Description</label>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description…" /></div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name || !form.location}>Add Company</Button>
      </DialogFooter>
    </div>
  );
}

function JobForm({ companies, onSave, onClose }: { companies: any[]; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    company: "", title: "", description: "", package: "", jobType: "full-time",
    location: "", lastDateToApply: "", interviewDate: "", minimumCGPA: "",
    eligibleBranches: [] as string[], requirements: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleBranch = (b: string) => setForm((f) => ({
    ...f, eligibleBranches: f.eligibleBranches.includes(b)
      ? f.eligibleBranches.filter((x) => x !== b)
      : [...f.eligibleBranches, b],
  }));

  return (
    <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Company *</label>
          <Select value={form.company} onValueChange={(v) => set("company", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{companies.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Job Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Software Engineer" /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Description *</label>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Job description…" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Package *</label>
          <Input value={form.package} onChange={(e) => set("package", e.target.value)} placeholder="₹18 LPA" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Job Type</label>
          <Select value={form.jobType} onValueChange={(v) => set("jobType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="full-time">Full Time</SelectItem><SelectItem value="internship">Internship</SelectItem><SelectItem value="part-time">Part Time</SelectItem></SelectContent>
          </Select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Location *</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Hyderabad" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Min CGPA</label>
          <Input type="number" step="0.1" value={form.minimumCGPA} onChange={(e) => set("minimumCGPA", e.target.value)} placeholder="6.0" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Application Deadline *</label>
          <Input type="date" value={form.lastDateToApply} onChange={(e) => set("lastDateToApply", e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Interview Date</label>
          <Input type="date" value={form.interviewDate} onChange={(e) => set("interviewDate", e.target.value)} /></div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Eligible Branches</label>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.slice(0, -1).map((b) => (
            <button key={b} onClick={() => toggleBranch(b)} className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${form.eligibleBranches.includes(b) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <DialogFooter className="sticky bottom-0 bg-background pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave({ ...form, requirements: form.requirements.split("\n").filter(Boolean), minimumCGPA: Number(form.minimumCGPA) || undefined })} disabled={!form.company || !form.title || !form.lastDateToApply}>
          Post Job
        </Button>
      </DialogFooter>
    </div>
  );
}

function ApplicationsModal({ job, onClose }: { job: any; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["job-apps", job._id], queryFn: () => placementApi.jobApplications(job._id) });
  const apps = data?.data?.applications || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => placementApi.updateApplicationStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-apps"] }); toast({ title: "Status updated" }); },
  });

  const statusColor: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700",
    shortlisted: "bg-purple-100 text-purple-700",
    interviewed: "bg-amber-100 text-amber-700",
    selected: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
      <p className="text-sm text-muted-foreground">{apps.length} applications for <strong>{job.title}</strong></p>
      {apps.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p> : apps.map((app: any) => (
        <div key={app._id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{app.student?.name}</p>
            <p className="text-xs text-muted-foreground">{app.student?.department} · {app.student?.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-xs ${statusColor[app.status] || ""}`}>{app.status}</Badge>
            {app.status === "applied" && (
              <>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title="Shortlist" onClick={() => updateMutation.mutate({ id: app._id, status: "shortlisted" })}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Reject" onClick={() => updateMutation.mutate({ id: app._id, status: "rejected" })}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {app.status === "shortlisted" && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateMutation.mutate({ id: app._id, status: "selected" })}>Select</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPlacement() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"jobs" | "companies">("jobs");
  const [companyModal, setCompanyModal] = useState(false);
  const [jobModal, setJobModal] = useState(false);
  const [appsModal, setAppsModal] = useState<{ open: boolean; job?: any }>({ open: false });

  const { data: jobsData, isLoading: loadingJobs } = useQuery({ queryKey: ["admin-jobs"], queryFn: () => placementApi.getJobs({ limit: "50" }) });
  const { data: companiesData, isLoading: loadingCompanies } = useQuery({ queryKey: ["companies"], queryFn: placementApi.getCompanies });
  const { data: statsData } = useQuery({ queryKey: ["placement-stats"], queryFn: placementApi.stats });

  const jobs = jobsData?.data?.jobs || [];
  const companies = companiesData?.data?.companies || [];
  const stats = statsData?.data;

  const createCompanyMutation = useMutation({
    mutationFn: placementApi.createCompany,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); setCompanyModal(false); toast({ title: "Company added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const createJobMutation = useMutation({
    mutationFn: placementApi.createJob,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); setJobModal(false); toast({ title: "Job posted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => placementApi.updateJob(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast({ title: "Job updated" }); },
  });

  const jobStatusColor: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Placement Management</h1>
          <p className="text-sm text-muted-foreground">Companies, jobs & applications</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setCompanyModal(true)}>
            <Building2 className="h-4 w-4 mr-1" /> Add Company
          </Button>
          <Button size="sm" onClick={() => setJobModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Post Job
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Companies", value: stats.totalCompanies, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Open Jobs", value: stats.openJobs, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Applications", value: stats.totalApplications, icon: Users, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Placed", value: stats.placed, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-b">
        {(["jobs", "companies"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "jobs" && (
        <div className="space-y-3">
          {loadingJobs ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) :
          jobs.length === 0 ? <Card><CardContent className="p-12 text-center text-muted-foreground">No jobs posted yet.</CardContent></Card> :
          jobs.map((job: any) => (
            <Card key={job._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                    {job.company?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{job.title}</h3>
                        <p className="text-xs text-muted-foreground">{job.company?.name} · {job.location} · {job.package}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs ${jobStatusColor[job.status]}`}>{job.status}</Badge>
                        {job.status === "open" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateJobMutation.mutate({ id: job._id, data: { status: "closed" } })}>
                            Close
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAppsModal({ open: true, job })}>
                          <Users className="h-3.5 w-3.5 mr-1" /> Applications
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">{job.jobType}</Badge>
                      <span className="text-xs text-muted-foreground">Deadline: {new Date(job.lastDateToApply).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "companies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingCompanies ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />) :
          companies.map((c: any) => (
            <Card key={c._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry} · {c.location}</p>
                  {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{c.website}</a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={companyModal} onOpenChange={setCompanyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
          <CompanyForm onSave={createCompanyMutation.mutate} onClose={() => setCompanyModal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={jobModal} onOpenChange={setJobModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader>
          <JobForm companies={companies} onSave={createJobMutation.mutate} onClose={() => setJobModal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={appsModal.open} onOpenChange={(o) => !o && setAppsModal({ open: false })}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Job Applications</DialogTitle></DialogHeader>
          {appsModal.job && <ApplicationsModal job={appsModal.job} onClose={() => setAppsModal({ open: false })} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
