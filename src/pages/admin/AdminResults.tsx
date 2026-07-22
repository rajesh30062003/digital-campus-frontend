import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marksApi, courseApi, userApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, BookOpen, Users, CheckCircle2, Eye, ClipboardEdit } from "lucide-react";

const GRADE_COLORS: Record<string, string> = {
  O: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "A+": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  A: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "B+": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  B: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  C: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  F: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

function ExamForm({ onSave, onClose }: { onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", type: "internal", course: "", department: "", semester: 1,
    session: "2025-26", date: "", totalMarks: 100, passingMarks: 40,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const { data: courseData } = useQuery({ queryKey: ["courses-list"], queryFn: () => courseApi.getAll({ limit: "200" }) });
  const courses = courseData?.data?.courses || [];

  const selectedCourse = courses.find((c: any) => c._id === form.course);
  if (selectedCourse && form.department !== selectedCourse.department) {
    setForm((f) => ({ ...f, department: selectedCourse.department, semester: selectedCourse.semester }));
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Exam Title *</label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Mid-Term Exam" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["internal", "semester", "practical", "viva"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Course *</label>
          <Select value={form.course} onValueChange={(v) => set("course", v)}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>{courses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.code} – {c.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Session</label>
          <Input value={form.session} onChange={(e) => set("session", e.target.value)} placeholder="2025-26" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Total Marks</label>
          <Input type="number" value={form.totalMarks} onChange={(e) => set("totalMarks", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Passing Marks</label>
          <Input type="number" value={form.passingMarks} onChange={(e) => set("passingMarks", Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.title || !form.course}>Create Exam</Button>
      </DialogFooter>
    </div>
  );
}

function MarksEntryModal({ exam, onClose }: { exam: any; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [marksMap, setMarksMap] = useState<Record<string, { marks: string; remarks: string }>>({});

  const courseId = typeof exam.course === "object" ? exam.course._id : exam.course;
  const { data: courseDetail } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => courseId ? courseApi.getById(courseId) : null,
    enabled: !!courseId,
  });
  const { data: existingMarks } = useQuery({
    queryKey: ["exam-marks", exam._id],
    queryFn: () => marksApi.getMarksByExam(exam._id),
  });

  const students = courseDetail?.data?.course?.enrolledStudents || [];
  const existingMap: Record<string, any> = {};
  (existingMarks?.data?.marks || []).forEach((m: any) => {
    existingMap[m.student._id] = m;
  });

  const setMark = (studentId: string, key: "marks" | "remarks", value: string) => {
    setMarksMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [key]: value } }));
  };

  const getVal = (studentId: string, key: "marks" | "remarks") => {
    if (marksMap[studentId]?.[key] !== undefined) return marksMap[studentId][key];
    if (existingMap[studentId]) return key === "marks" ? String(existingMap[studentId].marksObtained) : existingMap[studentId].remarks || "";
    return "";
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = students.map((s: any) => ({
        student: s._id,
        marksObtained: Number(getVal(s._id, "marks")) || 0,
        remarks: getVal(s._id, "remarks"),
      }));
      return marksApi.enterMarks(exam._id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exam-marks"] }); toast({ title: "Marks saved" }); onClose(); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
        <div>
          <p className="font-medium text-sm">{exam.title}</p>
          <p className="text-xs text-muted-foreground">{typeof exam.course === "object" ? exam.course?.title : ""} · Total: {exam.totalMarks}</p>
        </div>
      </div>
      {students.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No enrolled students found.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {students.map((s: any) => (
            <div key={s._id} className="flex items-center gap-3 border rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.studentId || s.email}</p>
              </div>
              {existingMap[s._id] && (
                <Badge className={`text-xs ${GRADE_COLORS[existingMap[s._id].grade] || ""}`}>{existingMap[s._id].grade}</Badge>
              )}
              <Input
                type="number"
                className="w-20 h-8 text-sm"
                placeholder="Marks"
                max={exam.totalMarks}
                min={0}
                value={getVal(s._id, "marks")}
                onChange={(e) => setMark(s._id, "marks", e.target.value)}
              />
              <Input
                className="w-32 h-8 text-sm"
                placeholder="Remarks"
                value={getVal(s._id, "remarks")}
                onChange={(e) => setMark(s._id, "remarks", e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving…" : "Save Marks"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminResults() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [marksModal, setMarksModal] = useState<{ open: boolean; exam?: any }>({ open: false });
  const [filter, setFilter] = useState("all");

  const params: Record<string, string> = {};
  if (filter !== "all") params.type = filter;

  const { data, isLoading } = useQuery({ queryKey: ["exams", params], queryFn: () => marksApi.getExams(params) });
  const exams = data?.data?.exams || [];

  const createMutation = useMutation({
    mutationFn: marksApi.createExam,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); setCreateModal(false); toast({ title: "Exam created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: marksApi.publishExam,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); toast({ title: "Results published" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Results & Marks</h1>
          <p className="text-sm text-muted-foreground">{exams.length} exams</p>
        </div>
        <Button size="sm" onClick={() => setCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Exam
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "internal", "semester", "practical", "viva"].map((t) => (
          <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} className="capitalize" onClick={() => setFilter(t)}>
            {t === "all" ? "All Types" : t}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : exams.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No exams found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam: any) => (
            <Card key={exam._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{exam.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{exam.type}</Badge>
                        {exam.isPublished && <Badge variant="default" className="text-xs bg-emerald-600">Published</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {typeof exam.course === "object" ? `${exam.course?.code} – ${exam.course?.title}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString()} · Total: {exam.totalMarks} · Pass: {exam.passingMarks}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setMarksModal({ open: true, exam })}>
                      <ClipboardEdit className="h-3.5 w-3.5 mr-1" /> Enter Marks
                    </Button>
                    {!exam.isPublished && (
                      <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => publishMutation.mutate(exam._id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Publish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
          <ExamForm onSave={createMutation.mutate} onClose={() => setCreateModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Marks Entry Modal */}
      <Dialog open={marksModal.open} onOpenChange={(o) => !o && setMarksModal({ open: false })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Enter Marks — {marksModal.exam?.title}</DialogTitle></DialogHeader>
          {marksModal.exam && <MarksEntryModal exam={marksModal.exam} onClose={() => setMarksModal({ open: false })} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
