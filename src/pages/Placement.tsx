import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placementApi, getUser } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Calendar, Briefcase, TrendingUp, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
};

const TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "internship": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "part-time": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function ApplyModal({ job, onClose }: { job: any; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");

  const applyMutation = useMutation({
    mutationFn: () => placementApi.apply(job._id, { coverLetter }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-applications", "jobs"] }); toast({ title: "Applied successfully!" }); onClose(); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/40 rounded-lg space-y-1">
        <h3 className="font-semibold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.company?.name} · {job.location}</p>
        <div className="flex gap-2 flex-wrap mt-2">
          <Badge className={`text-xs ${TYPE_COLORS[job.jobType] || ""}`}>{job.jobType}</Badge>
          <Badge variant="outline" className="text-xs">📦 {job.package}</Badge>
          {job.minimumCGPA && <Badge variant="outline" className="text-xs">Min CGPA: {job.minimumCGPA}</Badge>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Cover Letter (Optional)</label>
        <textarea
          className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Briefly explain why you're a good fit for this role…"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
          {applyMutation.isPending ? "Applying…" : "Submit Application"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function Placement() {
  const user = getUser();
  const [tab, setTab] = useState<"jobs" | "applied">("jobs");
  const [jobType, setJobType] = useState("all");
  const [applyModal, setApplyModal] = useState<{ open: boolean; job?: any }>({ open: false });

  const { data: jobsData, isLoading: loadingJobs } = useQuery({
    queryKey: ["jobs", jobType],
    queryFn: () => placementApi.getJobs(jobType !== "all" ? { jobType, status: "open" } : { status: "open" }),
  });
  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: placementApi.myApplications,
    enabled: tab === "applied",
  });
  const { data: statsData } = useQuery({ queryKey: ["placement-stats"], queryFn: placementApi.stats });

  const jobs = jobsData?.data?.jobs || [];
  const myApplications = appsData?.data?.applications || [];
  const stats = statsData?.data;

  const appliedJobIds = new Set(myApplications.map((a: any) =>
    typeof a.job === "object" ? a.job._id : a.job
  ));

  const appStatusColor: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    shortlisted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    interviewed: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    selected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Placement Portal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Job opportunities and campus recruitment</p>
      </div>

      {/* Stats */}
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
        {(["jobs", "applied"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "jobs" ? "Open Jobs" : "My Applications"}
          </button>
        ))}
      </div>

      {tab === "jobs" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {["all", "full-time", "internship", "part-time"].map((t) => (
              <Button key={t} size="sm" variant={jobType === t ? "default" : "outline"} className="h-7 text-xs capitalize" onClick={() => setJobType(t)}>
                {t === "all" ? "All Types" : t}
              </Button>
            ))}
          </div>
          {loadingJobs ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : jobs.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No open jobs at the moment.</CardContent></Card>
          ) : (
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-3">
              {jobs.map((job: any) => {
                const alreadyApplied = appliedJobIds.has(job._id);
                const deadline = new Date(job.lastDateToApply);
                const isExpired = deadline < new Date();
                return (
                  <motion.div key={job._id} variants={stagger.item}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                            {job.company?.name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.company?.name}</p>
                              </div>
                              {alreadyApplied ? (
                                <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Applied
                                </Badge>
                              ) : (
                                <Button size="sm" className="h-8 text-xs shrink-0" disabled={isExpired}
                                  onClick={() => setApplyModal({ open: true, job })}>
                                  {isExpired ? "Expired" : "Apply Now"}
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.package}</span>
                              <span className={`flex items-center gap-1 ${isExpired ? "text-destructive" : ""}`}>
                                <Calendar className="h-3 w-3" />Due: {deadline.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge className={`text-xs border ${TYPE_COLORS[job.jobType] || ""}`}>{job.jobType}</Badge>
                              {job.minimumCGPA && <Badge variant="outline" className="text-xs">Min CGPA: {job.minimumCGPA}</Badge>}
                              {job.eligibleBranches?.slice(0, 2).map((b: string) => (
                                <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {tab === "applied" && (
        <>
          {loadingApps ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : myApplications.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">You haven't applied to any jobs yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app: any) => {
                const job = typeof app.job === "object" ? app.job : null;
                const company = job?.company;
                return (
                  <Card key={app._id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                          {company?.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-semibold text-sm">{job?.title || "—"}</h3>
                              <p className="text-xs text-muted-foreground">{company?.name} · {job?.location}</p>
                            </div>
                            <Badge className={`text-xs ${appStatusColor[app.status] || ""}`}>{app.status}</Badge>
                          </div>
                          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                            {app.interviewDate && <span className="text-primary">Interview: {new Date(app.interviewDate).toLocaleDateString()}</span>}
                          </div>
                          {app.feedback && (
                            <p className="mt-1.5 text-xs text-muted-foreground italic">"{app.feedback}"</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={applyModal.open} onOpenChange={(o) => !o && setApplyModal({ open: false })}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Apply for {applyModal.job?.title}</DialogTitle></DialogHeader>
          {applyModal.job && <ApplyModal job={applyModal.job} onClose={() => setApplyModal({ open: false })} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
