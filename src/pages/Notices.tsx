import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementApi, type IAnnouncement } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Bell, ChevronRight, Pin } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "academic", "exam", "event", "holiday", "general"];

const PRIORITY_STYLE: Record<string, string> = {
  academic: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
  exam: "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400",
  event: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
  holiday: "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400",
  general: "bg-muted text-muted-foreground border-border",
};

export default function Notices() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["announcements", category],
    queryFn: () =>
      announcementApi.list(
        category !== "All" ? { category, limit: "50" } : { limit: "50" }
      ),
  });

  const announcements: IAnnouncement[] = (data as any)?.data?.announcements || [];

  const filtered = announcements.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Notice Board</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? "Loading…" : `${announcements.length} notices`}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notices…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all shrink-0 capitalize ${
              category === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="font-semibold">No notices found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notice, i) => (
            <motion.div
              key={notice._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="hover:border-primary/40 transition-all cursor-pointer group">
                <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base leading-tight flex-1 min-w-0">
                        {notice.isPinned && (
                          <Pin className="inline w-3 h-3 mr-1 text-amber-500" />
                        )}
                        {notice.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 capitalize ${
                          PRIORITY_STYLE[notice.category || "general"] ?? PRIORITY_STYLE.general
                        }`}
                      >
                        {notice.category}
                      </Badge>
                    </div>
                    {notice.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                      {notice.author?.name && (
                        <span className="text-muted-foreground">by {notice.author.name}</span>
                      )}
                      {(notice.views ?? 0) > 0 && (
                        <span>{notice.views} views</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
