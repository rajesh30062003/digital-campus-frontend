import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Users, GraduationCap, BookCopy, Building2, FileText, CalendarCheck,
  Briefcase, TrendingUp, ShieldAlert, Clock, Info
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

const COLORS = ["#238548", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
  });

  const { data: growthData } = useQuery({
    queryKey: ["student-growth"],
    queryFn: adminApi.studentGrowth,
  });

  const { data: deptData } = useQuery({
    queryKey: ["dept-stats"],
    queryFn: adminApi.departmentStats,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance-trend"],
    queryFn: adminApi.attendanceTrend,
  });

  const { data: auditLogsData, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => adminApi.auditLogs({ limit: "15" }),
  });

  const stats = statsData?.data;
  const growth = growthData?.data || [];
  const depts = deptData?.data || [];
  const attendance = attendanceData?.data || [];
  const auditLogs = auditLogsData?.data || auditLogsData?.docs || [];

  const kpis = [
    { label: "Total Students", value: stats?.totalStudents ?? "—", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Total Faculty", value: stats?.totalFaculty ?? "—", icon: GraduationCap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Courses", value: stats?.totalCourses ?? "—", icon: BookCopy, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
    { label: "Departments", value: stats?.totalDepartments ?? "—", icon: Building2, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Assignments", value: stats?.totalAssignments ?? "—", icon: FileText, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/30" },
    { label: "Attendance %", value: stats?.attendancePercentage ? `${stats.attendancePercentage}%` : "—", icon: CalendarCheck, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/30" },
    { label: "Placed Students", value: stats?.placed ?? "—", icon: Briefcase, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30" },
    { label: "Admins", value: stats?.totalAdmins ?? "—", icon: TrendingUp, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System overview and analytics</p>
      </div>

      {/* KPI Grid */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={stagger.item}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <h3 className="text-xl font-bold leading-tight">{kpi.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Student Growth (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#238548" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#238548" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="students" stroke="#238548" strokeWidth={2} fill="url(#grad)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Attendance Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendance} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Attendance"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Bar dataKey="percentage" fill="#238548" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Stats */}
      {depts.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={depts} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {depts.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={depts} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={40} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend />
                  <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="faculty" name="Faculty" fill="#238548" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Audit Logs */}
      <Card>
        <CardHeader className="pb-2 px-5 pt-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              Security Audit Trail
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live immutable log files showing client ERP actions, database mutations, and access records
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {loadingLogs ? (
            <div className="space-y-2 pt-2">
              {[1, 2, 3].map(n => <Skeleton key={n} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              <Info className="w-4 h-4 mx-auto mb-1 opacity-40" />
              No audit logs captured in this session yet.
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden mt-3 max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                    <th className="p-3">User & Identity</th>
                    <th className="p-3">Action logged</th>
                    <th className="p-3">Details / Target URL</th>
                    <th className="p-3">Origin IP / Agent</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{log.user?.name || "System/Public"}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{log.user?.email || "anonymous"}</div>
                        {log.user?.role && (
                          <span className="inline-block text-[9px] px-1.5 py-px bg-primary/10 text-primary font-bold rounded capitalize mt-0.5">
                            {log.user.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded font-semibold text-primary">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground break-all max-w-xs">
                        {log.details || "—"}
                      </td>
                      <td className="p-3 text-[10px] text-muted-foreground">
                        <div>IP: {log.ip || "127.0.0.1"}</div>
                        <div className="truncate max-w-[150px]" title={log.userAgent}>{log.userAgent || "Unknown Agent"}</div>
                      </td>
                      <td className="p-3 text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
