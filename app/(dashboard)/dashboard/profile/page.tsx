"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, getToken } from "@/lib/api";
import { getStoredUser, roleBadgeColor, roleLabel, type AuthUser } from "@/lib/auth";
import { User, Mail, Lock, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token || !stored) { router.replace("/login"); return; }
    setUser(stored);
    setForm((p) => ({ ...p, name: stored.name, email: stored.email }));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setError("");
    setSuccess(false);

    if (form.password && form.password !== form.confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    const body: { name?: string; email?: string; password?: string } = {};
    if (form.name  !== user?.name)  body.name  = form.name;
    if (form.email !== user?.email) body.email = form.email;
    if (form.password)              body.password = form.password;

    if (Object.keys(body).length === 0) {
      setError("No changes to save.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.updateMe(body, token);
      // Persist updated user to localStorage
      const updated = { ...user, ...res.data } as AuthUser;
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSuccess(true);
      setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
    </div>
  );

  const badge = roleBadgeColor[user.role];
  const inputClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20";
  const inputStyle = { borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" };
  const labelClass = "mb-1.5 block text-sm font-medium";
  const labelStyle = { color: "#374151" };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>My Profile</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>Update your name, email, or password</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: "rgba(11,31,51,0.08)" }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
          style={{ backgroundColor: "#0B1F33" }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color: "#0B1F33" }}>{user.name}</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>{user.email}</p>
          <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: badge.bg, color: badge.text }}>
            {roleLabel[user.role]}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          Profile updated successfully!
        </div>
      )}
      {(error || pwError) && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error || pwError}
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm space-y-5"
        style={{ borderColor: "rgba(11,31,51,0.08)" }}>

        <div>
          <label className={labelClass} style={labelStyle}>
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</span>
          </label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</span>
          </label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={inputClass} style={inputStyle} />
        </div>

        {/* Role — read-only */}
        <div>
          <label className={labelClass} style={labelStyle}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Role</span>
          </label>
          <div className="flex items-center gap-2 w-full rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "rgba(11,31,51,0.08)", backgroundColor: "rgba(11,31,51,0.02)", color: "#6B7280" }}>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ backgroundColor: badge.bg, color: badge.text }}>
              {roleLabel[user.role]}
            </span>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>(cannot be changed here)</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-4" style={{ borderColor: "rgba(11,31,51,0.06)" }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
            Change Password (leave blank to keep current)
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={labelStyle}>
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> New Password</span>
              </label>
              <input type="password" minLength={6} value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters"
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Confirm Password</span>
              </label>
              <input type="password" value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
            style={{ backgroundColor: "#19C3B1" }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
