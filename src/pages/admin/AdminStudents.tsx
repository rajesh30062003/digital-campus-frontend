import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Loader2,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Information Technology",
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  department: string;
  semester: number;
  studentId: string;
}

const defaultForm = (): StudentFormData => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  department: "",
  semester: 1,
  studentId: "",
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: StudentFormData, isEdit: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address";
  if (!isEdit) {
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
  }
  if (!form.department) errors.department = "Department is required";
  if (!form.studentId.trim()) errors.studentId = "Student ID is required";
  return errors;
}

// ─── Add/Edit Student Form ────────────────────────────────────────────────────

function StudentForm({
  initial,
  onSave,
  onClose,
  isPending,
}: {
  initial?: any;
  onSave: (data: any) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const isEdit = !!initial;

  const [form, setForm] = useState<StudentFormData>({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    confirmPassword: "",
    phone: initial?.phone || "",
    department: initial?.department || "",
    semester: initial?.semester || 1,
    studentId: initial?.studentId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k: keyof StudentFormData, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error on change
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = () => {
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const payload: Record<string, any> = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      department: form.department,
      semester: form.semester,
      studentId: form.studentId.trim() || undefined,
      role: "student",
    };
    if (!isEdit) payload.password = form.password;
    onSave(payload);
  };

  const field = (
    key: keyof StudentFormData,
    label: string,
    placeholder: string,
    type = "text",
    required = false
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={form[key] as string}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className={errors[key] ? "border-destructive" : ""}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Name + Student ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field("name", "Full Name", "e.g. John Doe", "text", true)}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Student ID <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.studentId}
            onChange={(e) => set("studentId", e.target.value)}
            placeholder="e.g. STU2024001"
            className={errors.studentId ? "border-destructive" : ""}
          />
          {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="student@college.edu"
          disabled={isEdit}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        {isEdit && (
          <p className="text-xs text-muted-foreground">Email cannot be changed after creation.</p>
        )}
      </div>

      {/* Password — only for new students */}
      {!isEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min 6 characters"
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      )}

      {/* Department + Semester */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Department <span className="text-destructive">*</span>
          </Label>
          <Select value={form.department} onValueChange={(v) => set("department", v)}>
            <SelectTrigger className={errors.department ? "border-destructive" : ""}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Current Semester</Label>
          <Select
            value={String(form.semester)}
            onValueChange={(v) => set("semester", Number(v))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Phone */}
      {field("phone", "Phone Number", "e.g. +91 9876543210")}

      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending} className="gap-2 min-w-32">
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {isEdit ? "Saving…" : "Creating…"}</>
          ) : (
            isEdit ? "Save Changes" : "Create Student"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteConfirmDialog({
  student,
  open,
  onConfirm,
  onClose,
  isPending,
}: {
  student: any;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Deactivate Student
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">{student?.name}</span>?
            They will no longer be able to log in. This can be reversed later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminStudents() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch]     = useState("");
  const [dept, setDept]         = useState("all");
  const [semester, setSemester] = useState("all");
  const [page, setPage]         = useState(1);

  const [addModal, setAddModal]       = useState(false);
  const [editModal, setEditModal]     = useState<{ open: boolean; student?: any }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; student?: any }>({ open: false });

  // ── Query ──────────────────────────────────────────────────────────────────
  const params: Record<string, string> = { role: "student", page: String(page), limit: "15" };
  if (search)           params.search     = search;
  if (dept !== "all")   params.department = dept;
  if (semester !== "all") params.semester = semester;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", params],
    queryFn: () => userApi.getAll(params),
  });

  const students   = data?.data || [];
  const pagination = data?.pagination;

  // ── Create ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/auth/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ ...payload, role: "student" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to create student");
      return body;
    },
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      setAddModal(false);
      toast({
        title: "Student created",
        description: `${vars.name} has been added successfully.`,
      });
    },
    onError: (e: any) =>
      toast({ title: "Creation failed", description: e.message, variant: "destructive" }),
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      setEditModal({ open: false });
      toast({ title: "Student updated", description: "Changes saved successfully." });
    },
    onError: (e: any) =>
      toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  // ── Delete (soft) ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      setDeleteModal({ open: false });
      toast({ title: "Student deactivated", description: "The account has been deactivated." });
    },
    onError: (e: any) =>
      toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // ── Restore (reactivate) ──────────────────────────────────────────────────
  const restoreMutation = useMutation({
    mutationFn: (id: string) => userApi.updateUser(id, { isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: "Student reactivated" });
    },
  });

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ["Name", "Email", "Student ID", "Department", "Semester", "Phone", "Status"],
      ...students.map((s: any) => [
        s.name,
        s.email,
        s.studentId || "",
        s.department || "",
        s.semester || "",
        s.phone || "",
        s.isActive ? "Active" : "Inactive",
      ]),
    ];
    const csv  = rows.map((r) => r.map((v: any) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Student Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${pagination?.total ?? students.length} total students`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={students.length === 0}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Search by name, email or student ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={(v) => { setSemester(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Student ID</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Semester</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><Skeleton className="h-9 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                  : students.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No students found</p>
                        {(search || dept !== "all" || semester !== "all") && (
                          <button
                            className="text-xs text-primary mt-1 hover:underline"
                            onClick={() => { setSearch(""); setDept("all"); setSemester("all"); }}
                          >
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                  : students.map((s: any) => (
                    <tr
                      key={s._id}
                      className={`border-b transition-colors ${
                        s.isActive ? "hover:bg-muted/20" : "bg-muted/5 opacity-60 hover:bg-muted/20"
                      }`}
                    >
                      {/* Name + email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {s.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {s.studentId || "—"}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        {s.department || "—"}
                      </td>

                      {/* Semester */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {s.semester ? (
                          <Badge variant="secondary">Sem {s.semester}</Badge>
                        ) : "—"}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {s.phone || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={s.isActive ? "default" : "destructive"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Edit student"
                            onClick={() => setEditModal({ open: true, student: s })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {s.isActive ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Deactivate student"
                              onClick={() => setDeleteModal({ open: true, student: s })}
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              title="Reactivate student"
                              onClick={() => restoreMutation.mutate(s._id)}
                              disabled={restoreMutation.isPending}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Page {page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
      <Dialog open={addModal} onOpenChange={(o) => { if (!o) setAddModal(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Student
            </DialogTitle>
            <DialogDescription>
              Only admins can create student accounts. The student will be able to log in
              immediately using the credentials you set here.
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            onSave={(payload) => createMutation.mutate(payload)}
            onClose={() => setAddModal(false)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Student Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={editModal.open}
        onOpenChange={(o) => { if (!o) setEditModal({ open: false }); }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Student
            </DialogTitle>
            <DialogDescription>
              Update the student&apos;s information. Email cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {editModal.student && (
            <StudentForm
              initial={editModal.student}
              onSave={(payload) =>
                updateMutation.mutate({ id: editModal.student._id, data: payload })
              }
              onClose={() => setEditModal({ open: false })}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <DeleteConfirmDialog
        student={deleteModal.student}
        open={deleteModal.open}
        onConfirm={() => deleteMutation.mutate(deleteModal.student?._id)}
        onClose={() => setDeleteModal({ open: false })}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
