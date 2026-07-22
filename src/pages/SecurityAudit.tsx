import React, { useState, useEffect } from "react";
import {
  Shield, Key, Lock, Users, Database, FileSpreadsheet, Activity,
  CheckCircle2, AlertTriangle, RefreshCw, Cpu, Download, Upload,
  Laptop, Smartphone, Trash2, Eye, ShieldAlert, Check, X, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SecuritySummary {
  totalUsers: number;
  twoFactorUsers: number;
  twoFactorAdoptionRate: string;
  totalAuditLogs: number;
  permissionMatrix: Record<string, string[]>;
  recentAuditLogs: Array<{
    _id: string;
    userName: string;
    userRole: string;
    action: string;
    ipAddress?: string;
    createdAt: string;
  }>;
  securityPolicies: {
    jwtRefreshTokenRotation: string;
    passwordPolicyMinLength: number;
    passwordComplexityRules: string[];
    accountLockoutThreshold: string;
    helmetCspMode: string;
    dataAtRestEncryption: string;
    rateLimitingWindow: string;
  };
}

interface ActiveSession {
  sessionId: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  lastActive: string;
}

export default function SecurityAudit() {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  // 2FA state
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [otpUrl, setOtpUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  // Backup / Restore state
  const [backupPayload, setBackupPayload] = useState<any>(null);
  const [restoreCiphertext, setRestoreCiphertext] = useState("");
  const [restoreIv, setRestoreIv] = useState("");
  const [restoreTag, setRestoreTag] = useState("");
  const [restoring, setRestoring] = useState(false);

  // Fetch security audit summary & active sessions
  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [sumRes, sessRes] = await Promise.all([
        fetch("/api/security/summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/auth/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
      }
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData.data || []);
      }
    } catch (err) {
      toast.error("Failed to load security audit metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [token]);

  // Handle 2FA Secret Generation
  const handleGenerate2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorSecret(data.secret);
        setOtpUrl(data.otpauthUrl);
        toast.success("2FA Setup Key Generated! Enter the 6-digit code below to confirm.");
      } else {
        toast.error(data.message || "Failed to generate 2FA key");
      }
    } catch {
      toast.error("Network error generating 2FA key");
    }
  };

  // Handle 2FA Verification
  const handleVerify2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit TOTP authentication code.");
      return;
    }
    setVerifying2FA(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: totpCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Two-Factor Authentication successfully enabled!");
        setTwoFactorSecret(null);
        setTotpCode("");
        fetchSecurityData();
      } else {
        toast.error(data.message || "Invalid 2FA code");
      }
    } catch {
      toast.error("Verification error");
    } finally {
      setVerifying2FA(false);
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/auth/sessions/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Session revoked successfully");
        fetchSecurityData();
      }
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  // Generate Encrypted DB Backup
  const handleCreateBackup = async () => {
    try {
      const res = await fetch("/api/security/backup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setBackupPayload(data);
        toast.success("Encrypted AES-256-GCM Disaster Recovery Backup Generated!");
      } else {
        toast.error(data.message || "Backup creation failed");
      }
    } catch {
      toast.error("Backup trigger failed");
    }
  };

  // Restore DB Backup
  const handleRestoreBackup = async () => {
    if (!restoreCiphertext || !restoreIv || !restoreTag) {
      toast.error("Please provide ciphertext, IV, and auth tag for restore.");
      return;
    }
    setRestoring(true);
    try {
      const res = await fetch("/api/security/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ciphertext: restoreCiphertext,
          iv: restoreIv,
          tag: restoreTag,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchSecurityData();
      } else {
        toast.error(data.message || "Restore failed");
      }
    } catch {
      toast.error("Disaster recovery restore failed");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Enterprise Security Audit & Hardening</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold ml-2">
              ZERO TRUST ACTIVE
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitored OWASP Top 10 defenses, RBAC permission matrix, 2FA MFA enforcement, AES-256-GCM data encryption & disaster recovery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSecurityData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Audit
          </Button>
        </div>
      </div>

      {/* Security Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">2FA Adoption Rate</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary?.twoFactorAdoptionRate || "0%"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{summary?.twoFactorUsers || 0} / {summary?.totalUsers || 0} accounts protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Encryption Standard</CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              AES-256-GCM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Scrypt key derivation + Auth Tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Account Lockout Policy</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              5 Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">15 min automatic threshold lock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Audit Logs Recorded</CardDescription>
            <CardTitle className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {summary?.totalAuditLogs || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Immutable security event history</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Audit Tabs */}
      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="matrix" className="rounded-lg">Permission Matrix</TabsTrigger>
          <TabsTrigger value="twofactor" className="rounded-lg">2FA / MFA Setup</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg">Active Sessions</TabsTrigger>
          <TabsTrigger value="disaster" className="rounded-lg">Disaster Recovery</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg">Audit Logs</TabsTrigger>
        </TabsList>

        {/* 1. PERMISSION MATRIX */}
        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>Role-Based Access Control (RBAC) Permission Matrix</CardTitle>
              </div>
              <CardDescription>
                Zero Trust fine-grained permission assignments per institutional role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 font-semibold">Permission Token</th>
                      <th className="py-3 px-4 font-semibold text-center">Student</th>
                      <th className="py-3 px-4 font-semibold text-center">Faculty</th>
                      <th className="py-3 px-4 font-semibold text-center">Admin</th>
                      <th className="py-3 px-4 font-semibold text-center">Superadmin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "view_own_marks",
                      "enter_marks",
                      "view_courses",
                      "manage_courses",
                      "submit_assignments",
                      "manage_assignments",
                      "request_certificates",
                      "approve_certificates",
                      "view_timetable",
                      "manage_timetable",
                      "manage_users",
                      "manage_departments",
                      "view_audit_logs",
                      "manage_workflows",
                      "run_backups",
                      "manage_security",
                    ].map((perm) => (
                      <tr key={perm} className="border-b hover:bg-muted/20">
                        <td className="py-2.5 px-4 font-mono text-xs">{perm}</td>
                        {["student", "faculty", "admin", "superadmin"].map((r) => {
                          const has = summary?.permissionMatrix?.[r]?.includes(perm) || r === "superadmin";
                          return (
                            <td key={r} className="py-2.5 px-4 text-center">
                              {has ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                  <Check className="h-3 w-3 mr-1" /> Allowed
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground/40 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 2FA / MFA SETUP */}
        <TabsContent value="twofactor" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Two-Factor Authentication (2FA / TOTP)</CardTitle>
              </div>
              <CardDescription>
                Enforce TOTP multi-factor authentication for high-security actions and logins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-xl bg-card flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    Status: {user?.twoFactorEnabled ? (
                      <span className="text-emerald-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Enabled</span>
                    ) : (
                      <span className="text-amber-600 flex items-center"><AlertTriangle className="h-4 w-4 mr-1" /> Disabled</span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Protect your account against credential stuffing and brute-force attacks with time-based dynamic OTP codes.
                  </p>
                </div>
                {!user?.twoFactorEnabled && (
                  <Button onClick={handleGenerate2FA}>
                    <Key className="h-4 w-4 mr-2" /> Setup 2FA Now
                  </Button>
                )}
              </div>

              {twoFactorSecret && (
                <div className="p-6 border rounded-xl bg-muted/30 space-y-4">
                  <h4 className="font-semibold text-sm">Step 1: Scan or Enter Secret Key</h4>
                  <div className="p-3 bg-background border rounded-lg font-mono text-center text-lg tracking-wider">
                    {twoFactorSecret}
                  </div>
                  {otpUrl && (
                    <p className="text-xs text-muted-foreground">
                      OTP URI: <span className="font-mono">{otpUrl}</span>
                    </p>
                  )}

                  <h4 className="font-semibold text-sm pt-2">Step 2: Enter 6-Digit Code from Authenticator App</h4>
                  <div className="flex gap-3 max-w-md">
                    <Input
                      placeholder="e.g. 123456"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      className="font-mono text-center tracking-widest text-lg"
                    />
                    <Button onClick={handleVerify2FA} disabled={verifying2FA}>
                      {verifying2FA ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ACTIVE SESSIONS */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Active User Sessions
                  </CardTitle>
                  <CardDescription>
                    Monitor and revoke connected browser sessions across devices.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRevokeSession("all_others")}>
                  Revoke All Other Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No active session metadata logged.</p>
                ) : (
                  sessions.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        {s.userAgent?.toLowerCase().includes("mobile") ? (
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Laptop className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{s.userAgent || "Browser Session"}</p>
                          <p className="text-xs text-muted-foreground">
                            IP: {s.ip || "127.0.0.1"} • Created: {new Date(s.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleRevokeSession(s.sessionId)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Revoke
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. DISASTER RECOVERY & BACKUPS */}
        <TabsContent value="disaster" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Encrypted Backup & Disaster Recovery</CardTitle>
              </div>
              <CardDescription>
                Create and restore AES-256-GCM encrypted snapshots of all MongoDB collections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between p-4 border rounded-xl bg-muted/20">
                <div>
                  <h4 className="font-semibold text-sm">Automated Disaster Recovery Readiness</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Snapshots include authentication credentials, grades, workflow states, and medical records encrypted at rest.
                  </p>
                </div>
                <Button onClick={handleCreateBackup}>
                  <Download className="h-4 w-4 mr-2" /> Generate Encrypted Backup
                </Button>
              </div>

              {backupPayload && (
                <div className="p-4 border rounded-xl bg-slate-900 text-slate-100 space-y-2 font-mono text-xs overflow-x-auto">
                  <p className="text-emerald-400 font-bold">✅ Encrypted Payload Generated ({backupPayload.backupTimestamp}):</p>
                  <p>IV: {backupPayload.encryptedBackup?.iv}</p>
                  <p>Tag: {backupPayload.encryptedBackup?.tag}</p>
                  <p className="truncate">Ciphertext: {backupPayload.encryptedBackup?.ciphertext}</p>
                </div>
              )}

              {/* Restore Section */}
              <div className="p-6 border rounded-xl bg-card space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Restore Snapshot / Emergency Recovery
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs">Encrypted Ciphertext (Hex)</Label>
                    <Input
                      placeholder="Paste ciphertext hex string..."
                      value={restoreCiphertext}
                      onChange={(e) => setRestoreCiphertext(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Initialization Vector (IV)</Label>
                    <Input
                      placeholder="12-byte IV hex string..."
                      value={restoreIv}
                      onChange={(e) => setRestoreIv(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Auth Tag (GCM Tag)</Label>
                    <Input
                      placeholder="Auth tag hex string..."
                      value={restoreTag}
                      onChange={(e) => setRestoreTag(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <Button variant="destructive" onClick={handleRestoreBackup} disabled={restoring}>
                  {restoring ? "Restoring Database..." : "Perform Disaster Recovery Restore"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. AUDIT LOGS */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <CardTitle>System Audit Event Trail</CardTitle>
              </div>
              <CardDescription>
                Tamper-evident log of authentication attempts, privilege usage, and data modifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                      <th className="py-2.5 px-4 font-semibold">User</th>
                      <th className="py-2.5 px-4 font-semibold">Role</th>
                      <th className="py-2.5 px-4 font-semibold">Security Action</th>
                      <th className="py-2.5 px-4 font-semibold">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.recentAuditLogs?.map((log) => (
                      <tr key={log._id} className="border-b hover:bg-muted/20">
                        <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-medium">{log.userName || "System"}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="capitalize text-xs">
                            {log.userRole || "guest"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-primary">{log.action}</td>
                        <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{log.ipAddress || "127.0.0.1"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
