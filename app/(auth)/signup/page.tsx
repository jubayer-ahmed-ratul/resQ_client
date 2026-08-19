"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { getStoredUser, roleLabel, type UserRole } from "@/lib/auth";
import { CheckCircle2, Info } from "lucide-react";

export default function SignupPage() {
  const router   = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = getStoredUser();
    if (token && stored) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Public signup always creates a CITIZEN account.
      // Admin must use the Users management page to create other roles.
      const res = await authApi.register({ name, email, password, role: "CITIZEN" });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
      style={{ borderColor: "rgba(11,31,51,0.08)" }}
    >
      <div className="mb-7 text-center">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#0B1F33" }}
        >
          Create an account
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "#6B7280" }}>
          Join resqBuddy and respond faster
        </p>
      </div>

      {/* Role note */}
      <div
        className="mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
        style={{
          backgroundColor: "rgba(25,195,177,0.04)",
          borderColor: "rgba(25,195,177,0.2)",
          color: "#374151",
        }}
      >
        <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#19C3B1" }} />
        <span>
          Public registration creates a <strong>Citizen</strong> account.
          Operators and Coordinators are created by an Admin.
        </span>
      </div>

      {/* Success message */}
      {success && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(25,195,177,0.06)",
            borderColor: "rgba(25,195,177,0.25)",
            color: "#0B1F33",
          }}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          <span>Account created successfully! Redirecting…</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="mb-5 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(230,57,70,0.06)",
            borderColor: "rgba(230,57,70,0.2)",
            color: "#E63946",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          />
        </div>

        {/* Role display — always CITIZEN for public signup */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Role
          </label>
          <div
            className="flex items-center gap-2 w-full rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "rgba(11,31,51,0.1)", color: "#6B7280", backgroundColor: "rgba(11,31,51,0.02)" }}
          >
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ backgroundColor: "rgba(25,195,177,0.12)", color: "#19C3B1" }}
            >
              {roleLabel["CITIZEN"]}
            </span>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              (assigned automatically for public signup)
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A3550] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0B1F33" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "#6B7280" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "#19C3B1" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
