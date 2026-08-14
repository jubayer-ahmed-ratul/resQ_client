"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: implement signup logic
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A3550]"
          style={{ backgroundColor: "#0B1F33" }}
        >
          Create account
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
