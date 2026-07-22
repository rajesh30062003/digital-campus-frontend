import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, assignmentApi, type IAssignment } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud, Clock, CheckCircle, Star, FileText, AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400",
  submitted: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
  graded: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const FILTERS = ["All", "Pending", "Submitted", "Graded"];

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function Assignments() {
  const [filter, setFilter] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Fetch enrolled courses first
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => courseApi.myCourses(),
  });

  const courses = coursesData?.data?.courses || [];

  // Fetch assignments for all enrolled courses
  const { data: allAssignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["assignments", courses.map((c: any) => c._id)],
    queryFn: async () => {
      if (courses.length === 0) return [];
      const results = await Promise.all(
        courses.map((c: any) =>
          assignmentApi.byCourse(c._id)
            .then((r: any) => (r.data?.assignments || []).map((a: any) => ({ ...a, courseId: c._id })))
            .catch(() => [])
        )
      );
      return results.flat();
    },
    enabled: courses.length > 0,
  });

  const assignments: IAssignment[] = allAssignments || [];

  // Determine submission status for each assignment
  const enriched = assignments.map((a) => {
    const mySubmission = a.submissions?.[0];
    const status = mySubmission
      ? (mySubmission.grade != null || mySubmission.marks != null) ? "graded" : "submitted"
      : "pending";
    return { ...a, myStatus: status, mySubmission };
  });

  const filtered = enriched.filter((a) =>
    filter === "All" || a.myStatus === filter.toLowerCase()
  );

  const counts = {
    All: enriched.length,
    Pending: enriched.filter((a) => a.myStatus === "pending").length,
    Submitted: enriched.filter((a) => a.myStatus === "submitted").length,
    Graded: enriched.filter((a) => a.myStatus === "graded").length,
  };

  const handleSubmit = async (id: string, courseId: string) => {
    setSubmittingId(id);
    try {
      await assignmentApi.submit(courseId, id, { content: "Submitted via portal" });
      toast({ title: "Assignment submitted!", description: "Your submission has been recorded." });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    } catch (err: unknown) {
      toast({ title: "Submission failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmittingId(null);
    }
  };

  const isLoading = loadingCourses || loadingAssignments;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Assignments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? "Loading…" : `${assignments.length} assignments across ${courses.length} courses`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {f}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-primary-foreground/20" : "bg-muted"}`}>
              {counts[f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No assignments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Assignments will appear here when posted by faculty</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No {filter.toLowerCase()} assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => {
            const days = daysUntil(a.dueDate || "");
            const isOverdue = days < 0 && a.myStatus === "pending";
            const courseName =
              typeof a.course === "object" ? a.course?.title : "Course";
            const courseCode =
              typeof a.course === "object" ? a.course?.code : "";

            return (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={`flex flex-col h-full ${isOverdue ? "border-red-200 dark:border-red-800" : ""}`}>
                  <CardContent className="p-4 sm:p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-tight line-clamp-2">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{courseName} · {courseCode}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 capitalize ${STATUS_STYLE[a.myStatus]}`}>
                        {a.myStatus}
                      </Badge>
                    </div>

                    {a.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : days <= 2 ? "text-amber-500" : ""}`}>
                        <Clock className="w-3 h-3" />
                        {isOverdue
                          ? `Overdue by ${Math.abs(days)}d`
                          : days === 0
                          ? "Due today"
                          : `${days}d left`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {(a as any).maxMarks || (a as any).totalMarks} marks
                      </span>
                    </div>

                    {a.myStatus === "graded" && a.mySubmission && (
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-xs">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Score: {(a.mySubmission as any).marks ?? (a.mySubmission as any).grade} / {(a as any).maxMarks || (a as any).totalMarks}
                        </p>
                        {a.mySubmission.feedback && (
                          <p className="text-muted-foreground mt-1">{a.mySubmission.feedback}</p>
                        )}
                      </div>
                    )}

                    {a.myStatus === "pending" && !isOverdue && (
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleSubmit(a._id, typeof a.course === "object" ? (a.course as any)?._id : a.courseId)}
                        disabled={submittingId === a._id}
                      >
                        {submittingId === a._id ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Submitting…</>
                        ) : (
                          <><UploadCloud className="w-3 h-3" /> Submit</>
                        )}
                      </Button>
                    )}
                    {a.myStatus === "submitted" && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Submitted — awaiting grade
                      </div>
                    )}
                    {isOverdue && (
                      <div className="flex items-center gap-1.5 text-xs text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" /> Deadline passed
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
