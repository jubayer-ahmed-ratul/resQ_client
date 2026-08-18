"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "#6B7280" }}>
          Sign in to your resqBuddy account
        </p>
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
          <span>Signed in successfully! Redirecting…</span>
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
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: "#374151" }}
            >
              Password
            </label>
            <Link
              href="#"
              className="text-xs font-medium"
              style={{ color: "#19C3B1" }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#19C3B1" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "#6B7280" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold" style={{ color: "#19C3B1" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
