import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Information Technology"];
const DESIGNATIONS = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "HOD"];

function FacultyForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    phone: initial?.phone || "",
    department: initial?.department || "",
    designation: initial?.designation || "",
    qualification: initial?.qualification || "",
    experience: initial?.experience || "",
    role: "faculty",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Jane Smith" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Email *</label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="faculty@college.edu" />
      </div>
      {!initial && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Password *</label>
          <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 chars" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Select value={form.department} onValueChange={(v) => set("department", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Designation</label>
          <Select value={form.designation} onValueChange={(v) => set("designation", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Qualification</label>
          <Input value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="Ph.D, M.Tech…" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Experience (years)</label>
          <Input type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="5" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name || !form.email}>{initial ? "Update" : "Create Faculty"}</Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminFaculty() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; faculty?: any }>({ open: false });

  const params: Record<string, string> = { role: "faculty", page: String(page), limit: "15" };
  if (search) params.search = search;
  if (dept !== "all") params.department = dept;

  const { data, isLoading } = useQuery({ queryKey: ["admin-faculty", params], queryFn: () => userApi.getAll(params) });

  const createMutation = useMutation({
    mutationFn: (d: any) =>
      fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api"}/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: JSON.stringify({ ...d, role: "faculty" }),
      }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.message || "Failed"); return data; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faculty"] });
      setModal({ open: false });
      toast({ title: "Faculty created successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faculty"] }); setModal({ open: false }); toast({ title: "Faculty updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faculty"] }); toast({ title: "Faculty deactivated" }); },
  });

  const faculty = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Faculty Management</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} total faculty members</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus className="h-4 w-4 mr-1" /> Add Faculty
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search faculty..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Faculty</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Designation</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><Skeleton className="h-9 w-48" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                  : faculty.map((f: any) => (
                    <tr key={f._id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                              {f.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{f.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{f.department || "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{f.designation || "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={f.isActive ? "default" : "destructive"}>{f.isActive ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal({ open: true, faculty: f })}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(f._id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{modal.faculty ? "Edit Faculty" : "Add New Faculty"}</DialogTitle></DialogHeader>
          <FacultyForm
            initial={modal.faculty}
            onSave={(data) => modal.faculty ? updateMutation.mutate({ id: modal.faculty._id, data }) : createMutation.mutate(data)}
            onClose={() => setModal({ open: false })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
