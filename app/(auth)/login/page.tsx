"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: implement login logic
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
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
          style={{ backgroundColor: "#19C3B1" }}
        >
          Sign in
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
