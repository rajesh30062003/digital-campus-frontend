import { useQuery } from "@tanstack/react-query";
import { marksApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, TrendingUp, Award, GraduationCap } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";

const GRADE_COLORS: Record<string, string> = {
  O:   "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  "A+": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  A:   "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  "B+": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  B:   "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  C:   "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
  F:   "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
};
const BAR_COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#14b8a6"];

export default function Marks() {
  const { data, isLoading } = useQuery({ queryKey: ["my-marks"], queryFn: marksApi.myMarks });

  const semesters: any[] = data?.data?.semesters || [];
  const cgpa: number = data?.data?.cgpa || 0;

  const sgpaChartData = semesters.map((s) => ({ sem: `S${s.semester}`, sgpa: s.sgpa }));

  const totalSubjects = semesters.reduce((acc, s) => acc + s.marks.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Marks & Results</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Semester-wise published results</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "CGPA", value: isLoading ? "—" : cgpa || "—", icon: GraduationCap, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Subjects", value: isLoading ? "—" : totalSubjects, icon: BookOpen, color: "text-blue-600 dark:text-blue-400" },
          { label: "Semesters", value: isLoading ? "—" : semesters.length, icon: Award, color: "text-purple-600 dark:text-purple-400" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <k.icon className={`h-5 w-5 shrink-0 ${k.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                {isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="text-xl font-bold">{k.value}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SGPA Chart */}
      {sgpaChartData.length > 0 && (
        <Card>
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-base">SGPA Progression</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sgpaChartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sem" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="sgpa" stroke="#238548" strokeWidth={2} dot={{ r: 4, fill: "#238548" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Semester-wise tables */}
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : semesters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No published results yet. Check back after exams.
          </CardContent>
        </Card>
      ) : (
        semesters.map((sem) => (
          <Card key={`${sem.semester}_${sem.session}`}>
            <CardHeader className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Semester {sem.semester} — {sem.session}</CardTitle>
                <Badge variant="secondary" className="text-sm font-bold">SGPA: {sem.sgpa}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 font-medium">Subject</th>
                      <th className="text-left py-2 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-right py-2 font-medium">Marks</th>
                      <th className="text-right py-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.marks.map((m: any) => (
                      <tr key={m._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5">
                          <div>
                            <p className="font-medium">{typeof m.course === "object" ? m.course?.title : "—"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{typeof m.course === "object" ? m.course?.code : ""}</p>
                          </div>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs capitalize">{m.exam?.type}</Badge>
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground">
                          {m.marksObtained} / {m.exam?.totalMarks}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge variant="outline" className={`text-xs ${GRADE_COLORS[m.grade] || ""}`}>{m.grade}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
