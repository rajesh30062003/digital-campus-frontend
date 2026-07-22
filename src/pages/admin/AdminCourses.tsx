import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, userApi, departmentApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Pencil, Trash2, Users, BookCopy } from "lucide-react";

function CourseForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    code: initial?.code || "",
    description: initial?.description || "",
    department: initial?.department || "",
    semester: initial?.semester || 1,
    credits: initial?.credits || 3,
    faculty: typeof initial?.faculty === "object" ? initial?.faculty?._id : initial?.faculty || "",
    maxEnrollment: initial?.maxEnrollment || 60,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const { data: facultyData } = useQuery({ queryKey: ["faculty-list"], queryFn: () => userApi.getAll({ role: "faculty", limit: "100" }) });
  const { data: deptData } = useQuery({ queryKey: ["departments"], queryFn: departmentApi.getAll });
  const faculty = facultyData?.data || [];
  const departments = deptData?.data?.departments || [];

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Course Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Data Structures" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Course Code *</label>
          <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="CS301" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief course description…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Select value={form.department} onValueChange={(v) => set("department", v)}>
            <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
            <SelectContent>{departments.map((d: any) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Faculty *</label>
          <Select value={form.faculty} onValueChange={(v) => set("faculty", v)}>
            <SelectTrigger><SelectValue placeholder="Assign faculty" /></SelectTrigger>
            <SelectContent>{faculty.map((f: any) => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Semester</label>
          <Select value={String(form.semester)} onValueChange={(v) => set("semester", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Credits</label>
          <Select value={String(form.credits)} onValueChange={(v) => set("credits", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6].map((c) => <SelectItem key={c} value={String(c)}>{c} credits</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Max Students</label>
          <Input type="number" value={form.maxEnrollment} onChange={(e) => set("maxEnrollment", Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.title || !form.code}>{initial ? "Update Course" : "Create Course"}</Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminCourses() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [semester, setSemester] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; course?: any }>({ open: false });

  const params: Record<string, string> = { page: String(page), limit: "15" };
  if (search) params.search = search;
  if (dept !== "all") params.department = dept;
  if (semester !== "all") params.semester = semester;
  if (user?.role === "faculty") params.faculty = user.id;

  const { data, isLoading } = useQuery({ queryKey: ["admin-courses", params], queryFn: () => courseApi.getAll(params) });
  const { data: deptData } = useQuery({ queryKey: ["departments"], queryFn: departmentApi.getAll });
  const courses = data?.data?.courses || [];
  const pagination = data?.pagination;
  const departments = deptData?.data?.departments || [];

  const createMutation = useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-courses"] }); setModal({ open: false }); toast({ title: "Course created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => courseApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-courses"] }); setModal({ open: false }); toast({ title: "Course updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-courses"] }); toast({ title: "Course deleted" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{user?.role === "faculty" ? "My Courses" : "Course Management"}</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} courses</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search courses…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d: any) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={(v) => { setSemester(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Semesters" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Faculty</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Semester</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Credits</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Students</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><Skeleton className="h-9 w-48" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                  : courses.map((c: any) => (
                    <tr key={c._id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <BookCopy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{c.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {typeof c.faculty === "object" ? c.faculty?.name : "—"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="secondary">Sem {c.semester}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.credits} cr</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{c.enrolledStudents?.length ?? 0}/{c.maxEnrollment}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal({ open: true, course: c })}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(c._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">Page {page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ open: false })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{modal.course ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <CourseForm
            initial={modal.course}
            onSave={(data) => modal.course ? updateMutation.mutate({ id: modal.course._id, data }) : createMutation.mutate(data)}
            onClose={() => setModal({ open: false })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
