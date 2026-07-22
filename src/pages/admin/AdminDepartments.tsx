import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi, userApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2, Users, GraduationCap, BookCopy } from "lucide-react";

function DeptForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: initial?.name || "", code: initial?.code || "", description: initial?.description || "", hod: initial?.hod?._id || "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const { data: facultyData } = useQuery({ queryKey: ["faculty-list"], queryFn: () => userApi.getAll({ role: "faculty", limit: "100" }) });
  const faculty = facultyData?.data || [];

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Department Name *</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Computer Science" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Code *</label>
          <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="CSE" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description..." />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Head of Department (HOD)</label>
        <Select value={form.hod} onValueChange={(v) => set("hod", v)}>
          <SelectTrigger><SelectValue placeholder="Select HOD" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {faculty.map((f: any) => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name || !form.code}>{initial ? "Update" : "Create Department"}</Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminDepartments() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; dept?: any }>({ open: false });

  const { data, isLoading } = useQuery({ queryKey: ["departments"], queryFn: departmentApi.getAll });
  const departments = data?.data?.departments || [];

  const createMutation = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); setModal({ open: false }); toast({ title: "Department created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); setModal({ open: false }); toast({ title: "Department updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast({ title: "Department removed" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Department Management</h1>
          <p className="text-sm text-muted-foreground">{departments.length} departments</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus className="h-4 w-4 mr-1" /> Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <Card key={dept._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <Badge variant="secondary" className="text-xs">{dept.code}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal({ open: true, dept })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(dept._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {dept.description && <p className="text-xs text-muted-foreground line-clamp-2">{dept.description}</p>}

                <div className="grid grid-cols-3 gap-2 pt-1 border-t">
                  <div className="flex flex-col items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold">{dept.totalStudents ?? 0}</span>
                    <span className="text-[10px] text-muted-foreground">Students</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold">{dept.totalFaculty ?? 0}</span>
                    <span className="text-[10px] text-muted-foreground">Faculty</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BookCopy className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-bold">{dept.totalCourses ?? 0}</span>
                    <span className="text-[10px] text-muted-foreground">Courses</span>
                  </div>
                </div>

                {dept.hod && (
                  <p className="text-xs text-muted-foreground">
                    HOD: <span className="font-medium text-foreground">{dept.hod.name}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ open: false })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{modal.dept ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
          <DeptForm
            initial={modal.dept}
            onSave={(data) => modal.dept ? updateMutation.mutate({ id: modal.dept._id, data }) : createMutation.mutate(data)}
            onClose={() => setModal({ open: false })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
