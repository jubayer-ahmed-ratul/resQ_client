"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, ShieldCheck, Calendar } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(stored) as UserInfo);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Welcome heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          Here&apos;s your account overview.
        </p>
      </div>

      {/* User info card */}
      <div
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: "rgba(11,31,51,0.08)" }}
      >
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: "#0B1F33" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: "#0B1F33" }}>
              {user.name}
            </p>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: "rgba(25,195,177,0.12)", color: "#19C3B1" }}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div
          className="space-y-4 border-t pt-5"
          style={{ borderColor: "rgba(11,31,51,0.06)" }}
        >
          <InfoRow Icon={User} label="Full Name" value={user.name} />
          <InfoRow Icon={Mail} label="Email" value={user.email} />
          <InfoRow Icon={ShieldCheck} label="Role" value={user.role} />
          <InfoRow Icon={Calendar} label="User ID" value={user.id} mono />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  mono = false,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "rgba(11,31,51,0.05)" }}
      >
        <Icon className="h-4 w-4" style={{ color: "#0B1F33" }} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-medium ${mono ? "font-mono" : ""}`}
          style={{ color: "#243447" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
