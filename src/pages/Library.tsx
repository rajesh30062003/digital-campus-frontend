import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Clock, AlertCircle, BookMarked, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Computer Science", "Mathematics", "Physics", "Chemistry", "Engineering", "Literature", "History", "Reference", "Fiction", "Other"];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
};

export default function Library() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"browse" | "issued">("browse");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "12" };
  if (search) params.search = search;
  if (category !== "All") params.category = category;

  const { data: booksData, isLoading: loadingBooks } = useQuery({
    queryKey: ["library-books", params],
    queryFn: () => libraryApi.getBooks(params),
  });

  const { data: myIssuesData, isLoading: loadingIssues } = useQuery({
    queryKey: ["my-issues"],
    queryFn: libraryApi.myIssues,
    enabled: tab === "issued",
  });

  const books = booksData?.data?.books || [];
  const pagination = booksData?.pagination;
  const myIssues = myIssuesData?.data?.issues || [];

  const statusColor: Record<string, string> = {
    issued: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    returned: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    overdue: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Library</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse books and track your issued books</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["browse", "issued"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "browse" ? "Browse Books" : "My Issued Books"}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <>
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by title, author or ISBN…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button key={c} size="sm" variant={category === c ? "default" : "outline"}
                className="h-7 text-xs" onClick={() => { setCategory(c); setPage(1); }}>{c}</Button>
            ))}
          </div>

          {loadingBooks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : books.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No books found.</CardContent></Card>
          ) : (
            <>
              <motion.div variants={stagger.container} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book: any) => (
                  <motion.div key={book._id} variants={stagger.item}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{book.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                          {book.availableCopies > 0 ? (
                            <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {book.availableCopies} available
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                              Not available
                            </Badge>
                          )}
                        </div>
                        {book.location && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Shelf:</span> {book.location}
                          </p>
                        )}
                        {book.isbn && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">ISBN: {book.isbn}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "issued" && (
        <>
          {loadingIssues ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : myIssues.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-2">
                <BookMarked className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">You have no issued books.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myIssues.map((issue: any) => (
                <Card key={issue._id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-sm">{typeof issue.book === "object" ? issue.book?.title : "—"}</h3>
                            <p className="text-xs text-muted-foreground">{typeof issue.book === "object" ? issue.book?.author : ""}</p>
                          </div>
                          <Badge className={`text-xs border ${statusColor[issue.status] || ""}`}>{issue.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Issued: {new Date(issue.issueDate).toLocaleDateString()}
                          </span>
                          <span className={`flex items-center gap-1 ${issue.status === "overdue" ? "text-destructive font-medium" : ""}`}>
                            <AlertCircle className="h-3 w-3" />
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                          {issue.returnDate && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Returned: {new Date(issue.returnDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {issue.fine > 0 && (
                          <p className="mt-1.5 text-xs text-destructive font-medium">
                            Fine: ₹{issue.fine} {issue.finePaid ? "(Paid)" : "(Pending)"}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
