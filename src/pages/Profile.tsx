import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, courseApi, getUser, type IUser } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, BookOpen, GraduationCap, Calendar, Edit3, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cachedUser = getUser();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.me(),
  });

  const user: IUser = data?.data?.user || cachedUser!;

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const { data: coursesData } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => courseApi.myCourses(),
  });
  const courses = coursesData?.data?.courses || [];

  const mutation = useMutation({
    mutationFn: (body: Partial<IUser>) => authApi.updateMe(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      toast({ title: "Profile updated!" });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({ phone, bio });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Student Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your academic and personal info</p>
        </div>
        <Button
          size="sm"
          variant={editing ? "default" : "outline"}
          className="gap-2 shrink-0"
          onClick={() => {
            if (editing) handleSave();
            else setEditing(true);
          }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : editing ? (
            <><Save className="w-4 h-4" /> Save</>
          ) : (
            <><Edit3 className="w-4 h-4" /> Edit Profile</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Avatar card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary/20">
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
            )}
            {isLoading ? (
              <div className="mt-4 space-y-2 w-full"><Skeleton className="h-5 w-3/4 mx-auto" /><Skeleton className="h-4 w-1/2 mx-auto" /></div>
            ) : (
              <>
                <h3 className="text-lg font-bold mt-4">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.studentId || user?.email}</p>
                <Badge className="mt-3" variant="secondary" >
                  {user?.department || "—"} · Sem {user?.semester || "—"}
                </Badge>
              </>
            )}
            <Separator className="my-4" />
            <div className="w-full grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">{courses.length}</p>
                <p className="text-[10px] text-muted-foreground">Courses</p>
              </div>
              <div>
                <p className="text-lg font-bold">{courses.reduce((s: number, c: any) => s + (c.credits || 0), 0)}</p>
                <p className="text-[10px] text-muted-foreground">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-3">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Full Name</Label>
                    <Input value={user?.name || ""} disabled className="bg-muted/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-muted/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!editing}
                      placeholder="Enter phone number"
                      className={!editing ? "bg-muted/30" : ""}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Role</Label>
                    <Input value={user?.role || ""} disabled className="bg-muted/30 capitalize" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!editing}
                    placeholder="Tell us about yourself…"
                    rows={3}
                    className={`w-full text-sm rounded-md border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                      !editing ? "bg-muted/30 cursor-not-allowed" : "bg-background"
                    }`}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No courses enrolled</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((c: any) => (
                <div key={c._id} className="p-3 rounded-xl border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{c.credits} cr</Badge>
                  </div>
                  {typeof c.faculty === "object" && c.faculty?.name && (
                    <p className="text-xs text-muted-foreground mt-2">{c.faculty.name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
