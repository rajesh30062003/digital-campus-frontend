import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, attendanceApi, type ICourse } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, XCircle, Minus, Heart, BookOpen, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  present: { label: "P", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  late: { label: "L", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  absent: { label: "A", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700", icon: <XCircle className="w-3 h-3" /> },
  holiday: { label: "H", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700", icon: <Minus className="w-3 h-3" /> },
  medical: { label: "M", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700", icon: <Heart className="w-3 h-3" /> },
};

function CourseAttendanceCard({ course }: { course: ICourse; key?: any }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", course._id],
    queryFn: () => attendanceApi.my(course._id),
    enabled: !!course._id,
  });

  const stats = data?.data?.stats;
  const records = data?.data?.records || [];
  const pct = stats?.percentage ?? 0;
  const isLow = pct < 75;

  return (
    <Card className={isLow ? "border-red-200 dark:border-red-800" : ""}>
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm sm:text-base font-semibold truncate">{course.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{course.code} · {course.credits} credits</p>
          </div>
          <Badge
            variant="outline"
            className={`text-sm font-bold shrink-0 ${
              isLow
                ? "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                : pct >= 90
                ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
            }`}
          >
            {isLoading ? "…" : `${pct}%`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-3">
        {isLoading ? (
          <Skeleton className="h-2 w-full" />
        ) : (
          <>
            <Progress value={pct} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{stats?.present ?? 0} / {stats?.total ?? 0} classes attended</span>
              {isLow ? (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                  <TrendingDown className="w-3 h-3" /> Below 75%
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Good
                </span>
              )}
            </div>

            {records.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Hide" : "Show"} date-wise ({records.length} entries)
              </button>
            )}

            <AnimatePresence>
              {expanded && records.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                    {records.map((r: { date: string; status: string }, idx: number) => {
                      const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                      return (
                        <div
                          key={idx}
                          title={`${r.date} — ${r.status}`}
                          className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-[10px] font-bold cursor-default ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Attendance() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => courseApi.myCourses(),
  });

  const courses = data?.data?.courses || [];
    return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? "Loading…" : `${courses.length} courses`}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.color} font-medium capitalize`}>
            {cfg.icon} {key}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No courses enrolled</p>
            <p className="text-sm text-muted-foreground mt-1">Enroll in courses to track attendance</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course: any) => (
            <CourseAttendanceCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
