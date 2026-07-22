import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timetableApi, courseApi, userApi, departmentApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, MapPin, User as UserIcon, BookOpen, Edit } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_COLORS: Record<string, string> = {
  Mon: "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Tue: "bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Wed: "bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Thu: "bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Fri: "bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  Sat: "bg-cyan-100 border-cyan-200 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

interface SlotForm { day: string; startTime: string; endTime: string; room: string; course: string; faculty: string; }
const emptySlot = (): SlotForm => ({ day: "Mon", startTime: "09:00", endTime: "10:00", room: "", course: "", faculty: "" });

function TimetableForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) {
  const [meta, setMeta] = useState({ department: initial?.department || "", semester: initial?.semester || 1, session: initial?.session || "2025-26" });
  const [slots, setSlots] = useState<SlotForm[]>(initial?.slots?.map((s: any) => ({
    day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room,
    course: typeof s.course === "object" ? s.course._id : s.course,
    faculty: typeof s.faculty === "object" ? s.faculty._id : s.faculty,
  })) || [emptySlot()]);

  const { data: courseData } = useQuery({ queryKey: ["courses-list"], queryFn: () => courseApi.getAll({ limit: "200" }) });
  const { data: facultyData } = useQuery({ queryKey: ["faculty-list"], queryFn: () => userApi.getAll({ role: "faculty", limit: "100" }) });
  const { data: deptData } = useQuery({ queryKey: ["departments"], queryFn: departmentApi.getAll });

  const courses = courseData?.data?.courses || [];
  const faculty = facultyData?.data || [];
  const departments = deptData?.data?.departments || [];

  const updateSlot = (i: number, k: keyof SlotForm, v: string) =>
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

  const removeSlot = (i: number) => setSlots((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-3 gap-3 sticky top-0 bg-background pt-1 pb-2 z-10">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Select value={meta.department} onValueChange={(v) => setMeta((m) => ({ ...m, department: v }))}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{departments.map((d: any) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Semester</label>
          <Select value={String(meta.semester)} onValueChange={(v) => setMeta((m) => ({ ...m, semester: Number(v) }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Session</label>
          <Input value={meta.session} onChange={(e) => setMeta((m) => ({ ...m, session: e.target.value }))} placeholder="2025-26" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Slots ({slots.length})</span>
          <Button size="sm" variant="outline" onClick={() => setSlots((prev) => [...prev, emptySlot()])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot
          </Button>
        </div>
        {slots.map((slot, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Badge className={DAY_COLORS[slot.day]}>{slot.day}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeSlot(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={slot.day} onValueChange={(v) => updateSlot(i, "day", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-8 text-xs" type="time" value={slot.startTime} onChange={(e) => updateSlot(i, "startTime", e.target.value)} />
              <Input className="h-8 text-xs" type="time" value={slot.endTime} onChange={(e) => updateSlot(i, "endTime", e.target.value)} />
              <Input className="h-8 text-xs" placeholder="Room" value={slot.room} onChange={(e) => updateSlot(i, "room", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={slot.course} onValueChange={(v) => updateSlot(i, "course", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Course" /></SelectTrigger>
                <SelectContent>{courses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.code} – {c.title}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={slot.faculty} onValueChange={(v) => updateSlot(i, "faculty", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Faculty" /></SelectTrigger>
                <SelectContent>{faculty.map((f: any) => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <DialogFooter className="sticky bottom-0 bg-background pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave({ ...meta, slots })} disabled={!meta.department}>
          {initial ? "Update Timetable" : "Create Timetable"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminTimetable() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; timetable?: any }>({ open: false });

  const { data, isLoading } = useQuery({ queryKey: ["timetables"], queryFn: timetableApi.getAll });
  const timetables = data?.data?.timetables || [];

  const createMutation = useMutation({
    mutationFn: timetableApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetables"] }); setModal({ open: false }); toast({ title: "Timetable created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => timetableApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetables"] }); setModal({ open: false }); toast({ title: "Timetable updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: timetableApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetables"] }); toast({ title: "Timetable deleted" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Timetable Management</h1>
          <p className="text-sm text-muted-foreground">{timetables.length} active timetables</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus className="h-4 w-4 mr-1" /> Create Timetable
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : timetables.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No timetables created yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {timetables.map((tt: any) => (
            <Card key={tt._id}>
              <CardHeader className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{tt.department} — Semester {tt.semester}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Session: {tt.session} · {tt.slots?.length ?? 0} slots</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal({ open: true, timetable: tt })}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(tt._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-6 gap-2 min-w-[600px]">
                    {DAYS.map((day) => {
                      const daySlots = (tt.slots || []).filter((s: any) => s.day === day);
                      return (
                        <div key={day} className="space-y-1.5">
                          <div className={`text-xs font-semibold px-2 py-1 rounded-md text-center ${DAY_COLORS[day]}`}>{day}</div>
                          {daySlots.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-3">—</div>
                          ) : (
                            daySlots.map((s: any, i: number) => (
                              <div key={i} className="border rounded-lg p-2 bg-card text-xs space-y-1">
                                <div className="font-medium truncate">{typeof s.course === "object" ? s.course?.code : "—"}</div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />{s.startTime}–{s.endTime}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{s.room || "TBD"}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground truncate">
                                  <UserIcon className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{typeof s.faculty === "object" ? s.faculty?.name : "—"}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ open: false })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{modal.timetable ? "Edit Timetable" : "Create Timetable"}</DialogTitle></DialogHeader>
          <TimetableForm
            initial={modal.timetable}
            onSave={(data) => modal.timetable ? updateMutation.mutate({ id: modal.timetable._id, data }) : createMutation.mutate(data)}
            onClose={() => setModal({ open: false })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
