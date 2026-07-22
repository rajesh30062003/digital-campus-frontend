import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, getUser } from "@/lib/api";
import { InstitutionSettingsCard } from "@/components/layout/InstitutionSettingsCard";
import { SaasTenantCard } from "@/components/layout/SaaSTenantCard";
import { SuperAdminPanel } from "@/components/layout/SuperAdminPanel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import {
  Bell, Lock, Moon, Sun, Loader2, CheckCircle2,
  Shield, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ─── Password strength helper ─────────────────────────────────────────────────

function passwordStrength(pwd: string): { label: string; color: string; width: string } {
  if (pwd.length === 0) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Weak",   color: "bg-red-500",    width: "25%" };
  if (score === 2) return { label: "Fair",   color: "bg-amber-500",  width: "50%" };
  if (score === 3) return { label: "Good",   color: "bg-blue-500",   width: "75%" };
  return               { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

// ─── Change Password Section ───────────────────────────────────────────────────

function ChangePasswordCard() {
  const { toast } = useToast();

  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const strength = passwordStrength(newPwd);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!currentPwd)         e.current = "Current password is required";
    if (!newPwd)             e.new     = "New password is required";
    else if (newPwd.length < 6) e.new  = "New password must be at least 6 characters";
    if (!confirmPwd)         e.confirm = "Please confirm your new password";
    else if (newPwd !== confirmPwd) e.confirm = "Passwords do not match";
    if (currentPwd && newPwd && currentPwd === newPwd)
      e.new = "New password must be different from current password";
    return e;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const errs = validate();
      if (Object.keys(errs).length > 0) { setErrors(errs); throw new Error("Validation failed"); }
      setErrors({});
      await authApi.changePassword(currentPwd, newPwd);
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); setErrors({});
    },
    onError: (err: Error) => {
      if (err.message !== "Validation failed") {
        toast({ title: "Failed to change password", description: err.message, variant: "destructive" });
      }
    },
  });

  const pwdInput = (
    opts: {
      id: string;
      label: string;
      value: string;
      onChange: (v: string) => void;
      show: boolean;
      onToggle: () => void;
      placeholder?: string;
      error?: string;
      hint?: React.ReactNode;
    }
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={opts.id} className="text-sm font-medium">{opts.label}</Label>
      <div className="relative">
        <Input
          id={opts.id}
          type={opts.show ? "text" : "password"}
          value={opts.value}
          onChange={(e) => {
            opts.onChange(e.target.value);
            if (errors[opts.id]) setErrors((prev) => { const n = { ...prev }; delete n[opts.id]; return n; });
          }}
          placeholder={opts.placeholder || "••••••••"}
          className={`pr-10 ${opts.error ? "border-destructive" : ""}`}
          autoComplete={opts.id === "current" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={opts.onToggle}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={opts.show ? "Hide password" : "Show password"}
        >
          {opts.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {opts.error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" /> {opts.error}
        </p>
      )}
      {opts.hint}
    </div>
  );

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> Change Password
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Available for all users — admin, faculty and students.
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">

        {/* Current password */}
        {pwdInput({
          id: "current",
          label: "Current Password",
          value: currentPwd,
          onChange: setCurrentPwd,
          show: showCurrent,
          onToggle: () => setShowCurrent((v) => !v),
          error: errors.current,
        })}

        {/* New password + strength meter */}
        {pwdInput({
          id: "new",
          label: "New Password",
          value: newPwd,
          onChange: setNewPwd,
          show: showNew,
          onToggle: () => setShowNew((v) => !v),
          placeholder: "Min 6 characters",
          error: errors.new,
          hint: newPwd.length > 0 ? (
            <div className="space-y-1 mt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className={`text-xs font-medium ${
                strength.label === "Weak"   ? "text-red-500" :
                strength.label === "Fair"   ? "text-amber-500" :
                strength.label === "Good"   ? "text-blue-500" :
                "text-emerald-500"
              }`}>
                {strength.label} password
              </p>
            </div>
          ) : undefined,
        })}

        {/* Confirm password */}
        {pwdInput({
          id: "confirm",
          label: "Confirm New Password",
          value: confirmPwd,
          onChange: setConfirmPwd,
          show: showConfirm,
          onToggle: () => setShowConfirm((v) => !v),
          error: errors.confirm,
          hint: confirmPwd && !errors.confirm && confirmPwd === newPwd ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" /> Passwords match
            </p>
          ) : undefined,
        })}

        {/* Submit */}
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !currentPwd || !newPwd || !confirmPwd}
          className="gap-2 w-full sm:w-auto"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
          ) : (
            <><Lock className="w-4 h-4" /> Update Password</>
          )}
        </Button>

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Password updated successfully.
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tips: use at least 8 characters, mix uppercase, numbers and symbols for a strong password.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const user = getUser();

  const [notifEmail,        setNotifEmail]        = useState(true);
  const [notifAssignment,   setNotifAssignment]   = useState(true);
  const [notifAnnouncement, setNotifAnnouncement] = useState(true);

  const roleColor =
    user?.role === "superadmin" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" :
    user?.role === "admin"   ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
    user?.role === "faculty" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <div className={`space-y-5 ${(user?.role === "admin" || user?.role === "superadmin") ? "max-w-4xl" : "max-w-2xl"}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Settings Workspace</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account preferences, system security, and campus-wide specifications.
        </p>
      </div>

      {user?.role === "superadmin" && <SuperAdminPanel />}

      {user?.role === "admin" && (
        <>
          <SaasTenantCard />
          <InstitutionSettingsCard />
        </>
      )}

      {/* ── Appearance ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Notifications ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {[
            {
              label: "Email Notifications",
              desc:  "Receive important updates via email",
              state: notifEmail,
              set:   setNotifEmail,
            },
            {
              label: "Assignment Reminders",
              desc:  "Get reminded before assignment deadlines",
              state: notifAssignment,
              set:   setNotifAssignment,
            },
            {
              label: "Announcements",
              desc:  "New notices and important announcements",
              state: notifAnnouncement,
              set:   setNotifAnnouncement,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={item.state} onCheckedChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Change Password — available to ALL roles ─────────────────────────── */}
      <ChangePasswordCard />

      {/* ── Account Info ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
              <p className="font-medium">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Role</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor}`}>
                {user?.role}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="font-medium break-all">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Department</p>
              <p className="font-medium">{user?.department || "—"}</p>
            </div>
            {user?.role === "student" && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Student ID</p>
                  <p className="font-medium font-mono">{user?.studentId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Semester</p>
                  <p className="font-medium">{user?.semester ? `Semester ${user.semester}` : "—"}</p>
                </div>
              </>
            )}
            {user?.role === "faculty" && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Designation</p>
                <p className="font-medium">{(user as any)?.designation || "—"}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Log Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
            </div>
            <Button variant="destructive" size="sm" onClick={logout}>
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
