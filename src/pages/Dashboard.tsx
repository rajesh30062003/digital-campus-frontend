import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, BookOpen, GraduationCap, TrendingUp, Bell, Clock, AlertTriangle, ChevronRight, Calendar, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { courseApi, announcementApi, assignmentApi, eventApi, getUser } from "@/lib/api";
import { useInstitution } from "@/hooks/useInstitution";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const cgpaData = [
  { sem: "Sem 1", cgpa: 7.8 }, { sem: "Sem 2", cgpa: 8.0 },
  { sem: "Sem 3", cgpa: 8.2 }, { sem: "Sem 4", cgpa: 8.5 },
  { sem: "Sem 5", cgpa: 8.6 }, { sem: "Sem 6", cgpa: 8.7 },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

export default function Dashboard() {
  const user = getUser();
  const { config, institutionType } = useInstitution();

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => courseApi.myCourses(),
  });

  const { data: announcementsData, isLoading: loadingAnn } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementApi.list({ limit: "5" }),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-upcoming"],
    queryFn: () => eventApi.list({ upcoming: "true", limit: "4" }),
  });

  const courses = coursesData?.data?.courses || [];
  const announcements = (announcementsData as any)?.data?.announcements || [];
  const events = (eventsData as any)?.data?.events || [];

  const radarData = courses.slice(0, 6).map((c: any, i: number) => ({
    subject: c.code,
    attendance: 70 + Math.floor(Math.random() * 25 + i),
  }));

  const kpis = [
    { label: "Enrolled Courses", value: courses.length || "—", sub: "This semester", icon: GraduationCap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Credits", value: courses.reduce((s: number, c: any) => s + (c.credits || 0), 0) || "—", sub: "Total registered", icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Notices", value: announcements.length || "—", sub: "Active notices", icon: Bell, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
    { label: "Events", value: events.length || "—", sub: "Upcoming", icon: Activity, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          Good morning, {user?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user?.department || "General Department"} · {config?.academicStructure === "Year" ? `Year ${Math.ceil((user?.semester || 1) / 2)}` : `Semester ${user?.semester || "—"}`} · {user?.role?.toUpperCase()} Portal
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={stagger.item}>
            <Card className="h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  {loadingCourses ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl sm:text-2xl font-bold leading-tight">{kpi.value}</h3>
                  )}
                  <p className="text-[10px] text-muted-foreground hidden sm:block">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">CGPA Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cgpaData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#238548" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#238548" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sem" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[7, 10]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="cgpa" stroke="#238548" strokeWidth={2} fill="url(#cgpaGrad)" dot={{ r: 3, fill: "#238548" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-3">
            {loadingCourses ? (
              <div className="space-y-2 p-4">{[1,2,3].map(i => <Skeleton key={i} className="h-5 w-full" />)}</div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                <BookOpen className="h-8 w-8 mb-2 opacity-30" />
                <p>No courses enrolled</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData.length ? radarData : [{ subject: "—", attendance: 0 }]} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar name="Courses" dataKey="attendance" stroke="#238548" fill="#238548" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Events */}
        <Card>
          <CardHeader className="pb-2 px-5 pt-5 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Link href="/notices">
              <span className="text-xs text-primary flex items-center gap-0.5 cursor-pointer hover:underline">View all <ChevronRight className="w-3 h-3" /></span>
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              (events as { _id: string; title: string; startDate: string; category: string; registeredParticipants: unknown[] }[]).map((ev) => (
                <div key={ev._id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary font-bold shrink-0 text-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(ev.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{ev.category}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="pb-2 px-5 pt-5 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Notices</CardTitle>
            <Link href="/notices">
              <span className="text-xs text-primary flex items-center gap-0.5 cursor-pointer hover:underline">View all <ChevronRight className="w-3 h-3" /></span>
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {loadingAnn ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No announcements</p>
            ) : (
              (announcements as { _id: string; title: string; createdAt: string; category?: string; isPinned?: boolean }[]).slice(0, 4).map((n) => (
                <div key={n._id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {n.isPinned && (
                    <Badge variant="default" className="text-xs shrink-0">Pinned</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Courses list */}
      <Card>
        <CardHeader className="pb-2 px-5 pt-5 flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Courses</CardTitle>
          <Link href="/attendance">
            <span className="text-xs text-primary flex items-center gap-0.5 cursor-pointer hover:underline">Attendance <ChevronRight className="w-3 h-3" /></span>
          </Link>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {loadingCourses ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground text-sm gap-2">
              <BookOpen className="h-10 w-10 opacity-30" />
              <p>No courses enrolled yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((c: any) => (
                <div key={c._id} className="p-3 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{c.credits} cr</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {typeof c.faculty === 'object' ? c.faculty?.name : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
