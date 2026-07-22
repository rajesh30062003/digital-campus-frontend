import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi, userApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, BookOpen, ArrowLeftRight, AlertCircle, BookMarked } from "lucide-react";

const CATEGORIES = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Engineering", "Literature", "History", "Reference", "Fiction", "Other"];

function BookForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || "", author: initial?.author || "", isbn: initial?.isbn || "",
    publisher: initial?.publisher || "", year: initial?.year || new Date().getFullYear(),
    edition: initial?.edition || "", category: initial?.category || "",
    totalCopies: initial?.totalCopies || 1, location: initial?.location || "", description: initial?.description || "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Book Title *</label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Introduction to Algorithms" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Author *</label>
          <Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Cormen et al." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">ISBN *</label>
          <Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} placeholder="978-0262046305" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Publisher</label>
          <Input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} placeholder="MIT Press" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Year</label>
          <Input type="number" value={form.year} onChange={(e) => set("year", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Copies</label>
          <Input type="number" min="1" value={form.totalCopies} onChange={(e) => set("totalCopies", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Location/Shelf</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="A-12" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.title || !form.author || !form.isbn}>{initial ? "Update" : "Add Book"}</Button>
      </DialogFooter>
    </div>
  );
}

function IssueForm({ onSave, onClose }: { onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ bookId: "", studentId: "", dueDays: 14 });
  const [bookSearch, setBookSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const { data: bookData } = useQuery({
    queryKey: ["books-search", bookSearch],
    queryFn: () => libraryApi.getBooks({ search: bookSearch, limit: "20" }),
    enabled: bookSearch.length > 1,
  });
  const { data: studentData } = useQuery({
    queryKey: ["students-search", studentSearch],
    queryFn: () => userApi.getAll({ role: "student", search: studentSearch, limit: "20" }),
    enabled: studentSearch.length > 1,
  });

  const books = bookData?.data?.books || [];
  const students = studentData?.data || [];

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Select Book *</label>
        <Select value={form.bookId} onValueChange={(v) => setForm((f) => ({ ...f, bookId: v }))}>
          <SelectTrigger><SelectValue placeholder="Search & select book" /></SelectTrigger>
          <SelectContent>
            <div className="p-2"><Input placeholder="Type to search…" value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} className="h-8 text-sm" /></div>
            {books.map((b: any) => (
              <SelectItem key={b._id} value={b._id} disabled={b.availableCopies === 0}>
                {b.title} ({b.availableCopies}/{b.totalCopies} available)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Select Student *</label>
        <Select value={form.studentId} onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}>
          <SelectTrigger><SelectValue placeholder="Search & select student" /></SelectTrigger>
          <SelectContent>
            <div className="p-2"><Input placeholder="Type to search…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="h-8 text-sm" /></div>
            {students.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name} ({s.studentId || s.email})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Due in (days)</label>
        <Select value={String(form.dueDays)} onValueChange={(v) => setForm((f) => ({ ...f, dueDays: Number(v) }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[7, 14, 21, 30].map((d) => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.bookId || !form.studentId}>Issue Book</Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminLibrary() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"books" | "issues">("books");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [bookModal, setBookModal] = useState<{ open: boolean; book?: any }>({ open: false });
  const [issueModal, setIssueModal] = useState(false);

  const bookParams: Record<string, string> = { page: String(page), limit: "15" };
  if (search) bookParams.search = search;
  if (category !== "all") bookParams.category = category;

  const { data: booksData, isLoading: loadingBooks } = useQuery({
    queryKey: ["admin-books", bookParams], queryFn: () => libraryApi.getBooks(bookParams),
  });
  const { data: issuesData, isLoading: loadingIssues } = useQuery({
    queryKey: ["admin-issues"], queryFn: () => libraryApi.allIssues(),
  });
  const { data: statsData } = useQuery({ queryKey: ["library-stats"], queryFn: libraryApi.stats });

  const books = booksData?.data?.books || [];
  const pagination = booksData?.pagination;
  const issues = issuesData?.data?.issues || [];
  const stats = statsData?.data;

  const createBookMutation = useMutation({
    mutationFn: libraryApi.createBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-books"] }); setBookModal({ open: false }); toast({ title: "Book added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => libraryApi.updateBook(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-books"] }); setBookModal({ open: false }); toast({ title: "Book updated" }); },
  });
  const deleteBookMutation = useMutation({
    mutationFn: libraryApi.deleteBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-books"] }); toast({ title: "Book removed" }); },
  });
  const issueMutation = useMutation({
    mutationFn: libraryApi.issueBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-books", "admin-issues", "library-stats"] }); setIssueModal(false); toast({ title: "Book issued" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const returnMutation = useMutation({
    mutationFn: libraryApi.returnBook,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-issues", "admin-books", "library-stats"] });
      const fine = data?.data?.issue?.fine;
      toast({ title: "Book returned", description: fine > 0 ? `Fine: ₹${fine}` : undefined });
    },
  });

  const statusColor: Record<string, string> = {
    issued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    returned: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Library Management</h1>
          <p className="text-sm text-muted-foreground">Books, issues & returns</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIssueModal(true)}>
            <ArrowLeftRight className="h-4 w-4 mr-1" /> Issue Book
          </Button>
          <Button size="sm" onClick={() => setBookModal({ open: true })}>
            <Plus className="h-4 w-4 mr-1" /> Add Book
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Issued", value: stats.issuedCount, icon: BookMarked, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Overdue", value: stats.overdueCount, icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Pending Fines", value: `₹${stats.pendingFines}`, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["books", "issues"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "books" && (
        <>
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search books…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Book</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Author</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Copies</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBooks
                      ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b"><td className="px-4 py-3" colSpan={5}><Skeleton className="h-8 w-full" /></td></tr>
                      ))
                      : books.map((b: any) => (
                        <tr key={b._id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{b.title}</p>
                                <p className="text-xs text-muted-foreground font-mono">{b.isbn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{b.author}</td>
                          <td className="px-4 py-3 hidden lg:table-cell"><Badge variant="outline" className="text-xs">{b.category}</Badge></td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={b.availableCopies === 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                              {b.availableCopies}/{b.totalCopies}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setBookModal({ open: true, book: b })}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteBookMutation.mutate(b._id)}>
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
        </>
      )}

      {tab === "issues" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Book</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Due Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Fine</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingIssues
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-8" /></td></tr>
                    ))
                    : issues.map((issue: any) => (
                      <tr key={issue._id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium truncate max-w-[180px]">
                          {typeof issue.book === "object" ? issue.book?.title : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {typeof issue.student === "object" ? issue.student?.name : "—"}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${statusColor[issue.status] || ""}`}>{issue.status}</Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                          {issue.fine > 0 ? <span className="text-red-600 font-medium">₹{issue.fine}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {issue.status !== "returned" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => returnMutation.mutate(issue._id)}>
                              Return
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book modal */}
      <Dialog open={bookModal.open} onOpenChange={(o) => !o && setBookModal({ open: false })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bookModal.book ? "Edit Book" : "Add Book"}</DialogTitle></DialogHeader>
          <BookForm
            initial={bookModal.book}
            onSave={(data) => bookModal.book ? updateBookMutation.mutate({ id: bookModal.book._id, data }) : createBookMutation.mutate(data)}
            onClose={() => setBookModal({ open: false })}
          />
        </DialogContent>
      </Dialog>

      {/* Issue modal */}
      <Dialog open={issueModal} onOpenChange={setIssueModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Issue Book to Student</DialogTitle></DialogHeader>
          <IssueForm onSave={issueMutation.mutate} onClose={() => setIssueModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
