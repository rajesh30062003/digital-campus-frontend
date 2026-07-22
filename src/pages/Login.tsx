import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInstitution } from "@/hooks/useInstitution";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const { config } = useInstitution();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const primaryStyle = config?.primaryColor ? { backgroundColor: config.primaryColor } : {};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-primary to-neutral-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 bg-card/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl text-white">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden p-2">
              {config?.logo ? (
                <img src={config.logo} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <GraduationCap className="h-10 w-10 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-center truncate w-full">{config?.name || "Digital Campus"}</h1>
            <p className="text-white/70 text-center mt-2">Sign in to your {config?.institutionType || "academic"} portal</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              className="w-full h-12 bg-white text-emerald-900 hover:bg-white/90 text-lg font-semibold mt-4"
              disabled={loading}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Access Portal"}
            </Button>
          </form>

          <p className="text-center text-white/50 text-xs mt-6">
            Don't have an account? Contact your institution admin.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
