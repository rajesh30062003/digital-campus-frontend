import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { timetableApi, getUser } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, User, BookOpen, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SLOT_COLORS = [
  "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
  "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
  "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
  "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300",
  "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300",
];

const todayIdx = () => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 0 : d - 1; // Mon=0 … Sat=5
};

export default function Timetable() {
  const user = getUser();
  const isFaculty = user?.role === "faculty";
  const [activeDay, setActiveDay] = useState(Math.min(todayIdx(), 5));

  // Students get their timetable; faculty get their assigned slots
  const { data, isLoading } = useQuery({
    queryKey: ["timetable", user?.role],
    queryFn: isFaculty ? timetableApi.faculty : timetableApi.my,
  });

  // Normalise data — student returns one timetable object; faculty returns array
  const rawSlots: any[] = [];
  if (!isLoading && data?.data) {
    if (isFaculty) {
      const timetables: any[] = data.data.timetables || [];
      timetables.forEach((tt: any) => rawSlots.push(...(tt.slots || [])));
    } else {
      const tt = data.data.timetable;
      if (tt) rawSlots.push(...(tt.slots || []));
    }
  }

  // Build schedule: day → sorted slots
  const schedule: Record<string, any[]> = {};
  DAYS.forEach((d) => (schedule[d] = []));
  rawSlots.forEach((slot: any) => {
    const day = DAYS[DAY_SHORT.indexOf(slot.day)];
    if (day) schedule[day].push(slot);
  });
  DAYS.forEach((d) => schedule[d].sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const todaySlots = schedule[DAYS[activeDay]] || [];

  // Assign consistent colour per course code
  const courseColorMap: Record<string, string> = {};
  let colorIdx = 0;
  rawSlots.forEach((s) => {
    const code = typeof s.course === "object" ? s.course?.code : s.course;
    if (code && !courseColorMap[code]) {
      courseColorMap[code] = SLOT_COLORS[colorIdx++ % SLOT_COLORS.length];
    }
  });

  const slotColor = (slot: any) => {
    const code = typeof slot.course === "object" ? slot.course?.code : slot.course;
    return courseColorMap[code] || SLOT_COLORS[0];
  };

  const totalSlots = rawSlots.length;
  const uniqueCourses = new Set(rawSlots.map((s) => (typeof s.course === "object" ? s.course?._id : s.course))).size;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Timetable</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isFaculty ? "Your assigned teaching schedule" : "Your weekly class schedule"}
        </p>
      </div>

      {/* Summary */}
      {!isLoading && totalSlots > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Weekly Classes", value: totalSlots, icon: CalendarDays, color: "text-blue-600" },
            { label: "Courses", value: uniqueCourses, icon: BookOpen, color: "text-purple-600" },
            { label: "Today's Classes", value: todaySlots.length, icon: Clock, color: "text-emerald-600" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <k.icon className={`h-5 w-5 shrink-0 ${k.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-xl font-bold">{k.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {DAY_SHORT.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              activeDay === i
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            } ${i === todayIdx() && activeDay !== i ? "ring-1 ring-primary ring-offset-1" : ""}`}
          >
            <span className="hidden sm:inline">{DAYS[i].slice(0, 3)}</span>
            <span className="sm:hidden">{day}</span>
            {schedule[DAYS[i]]?.length > 0 && (
              <span className={`ml-1.5 text-xs ${activeDay === i ? "opacity-80" : "text-muted-foreground"}`}>
                {schedule[DAYS[i]].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Slot list for selected day */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : totalSlots === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="font-semibold">No timetable found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isFaculty ? "You haven't been assigned to any courses yet." : "Your timetable hasn't been set up yet."}
                </p>
              </CardContent>
            </Card>
          ) : todaySlots.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="font-semibold">No classes on {DAYS[activeDay]}</p>
                <p className="text-sm text-muted-foreground mt-1">Enjoy your free day!</p>
              </CardContent>
            </Card>
          ) : (
            todaySlots.map((slot: any, i: number) => {
              const course = typeof slot.course === "object" ? slot.course : null;
              const faculty = typeof slot.faculty === "object" ? slot.faculty : null;
              const color = slotColor(slot);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className={`rounded-xl border p-4 ${color}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight">{course?.title || "—"}</p>
                        {course?.code && (
                          <span className="text-[10px] font-mono opacity-70 mt-0.5 block">{course.code}</span>
                        )}
                      </div>
                      {course?.credits && (
                        <Badge variant="outline" className="text-xs shrink-0 bg-black/10 dark:bg-white/10 border-0">
                          {course.credits} cr
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2.5 text-xs opacity-80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {slot.startTime} – {slot.endTime}
                      </span>
                      {faculty && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {faculty.name}
                        </span>
                      )}
                      {slot.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {slot.room}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Weekly overview grid */}
      {!isLoading && totalSlots > 0 && (
        <Card>
          <CardContent className="px-4 sm:px-5 py-4">
            <p className="text-sm font-semibold mb-3">Weekly Overview</p>
            <div className="grid grid-cols-6 gap-1.5">
              {DAY_SHORT.map((day, i) => {
                const daySlots = schedule[DAYS[i]] || [];
                return (
                  <div key={day} className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">{day}</p>
                    <div className="space-y-1">
                      {daySlots.length > 0
                        ? daySlots.map((s, j) => (
                            <div
                              key={j}
                              className={`h-2 rounded-sm ${slotColor(s).split(" ")[0]}`}
                              title={typeof s.course === "object" ? s.course?.title : ""}
                            />
                          ))
                        : <div className="h-2 rounded-sm bg-muted" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{daySlots.length}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
