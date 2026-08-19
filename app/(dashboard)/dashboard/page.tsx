"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, ShieldCheck, Calendar,
  AlertTriangle, Truck, Building2, ClipboardList,
  Plus, Eye,
} from "lucide-react";
import {
  getStoredUser,
  roleBadgeColor,
  roleLabel,
  type AuthUser,
} from "@/lib/auth";

// ── Role-specific quick actions ────────────────────────────
const roleQuickActions: Record<string, { label: string; href: string; Icon: React.ElementType; primary?: boolean }[]> = {
  ADMIN: [
    { label: "View All Incidents",   href: "/dashboard/incidents",    Icon: AlertTriangle },
    { label: "Manage Resources",     href: "/dashboard/resources",    Icon: Truck,         primary: true },
    { label: "Manage Hospitals",     href: "/dashboard/hospitals",    Icon: Building2 },
    { label: "View Assignments",     href: "/dashboard/assignments",  Icon: ClipboardList },
  ],
  COORDINATOR: [
    { label: "View Incidents",       href: "/dashboard/incidents",    Icon: AlertTriangle, primary: true },
    { label: "View Resources",       href: "/dashboard/resources",    Icon: Truck },
    { label: "View Hospitals",       href: "/dashboard/hospitals",    Icon: Building2 },
    { label: "Manage Assignments",   href: "/dashboard/assignments",  Icon: ClipboardList },
  ],
  OPERATOR: [
    { label: "My Assignments",       href: "/dashboard/assignments",  Icon: ClipboardList, primary: true },
    { label: "View Resources",       href: "/dashboard/resources",    Icon: Truck },
    { label: "View Hospitals",       href: "/dashboard/hospitals",    Icon: Building2 },
  ],
  CITIZEN: [
    { label: "Report Emergency",     href: "/dashboard/incidents/new", Icon: Plus,         primary: true },
    { label: "My Reports",           href: "/dashboard/incidents",     Icon: Eye },
  ],
};

// ── Role descriptions ──────────────────────────────────────
const roleDescription: Record<string, string> = {
  ADMIN:       "You have full system control. Manage users, resources, hospitals, and monitor all operations.",
  COORDINATOR: "You manage emergency incidents and operational assignments. Review, approve, and dispatch resources.",
  OPERATOR:    "You manage your assigned resources and hospitals. Update status and mark tasks as completed.",
  CITIZEN:     "You can report emergency incidents and track the status of your own reports.",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    const token  = localStorage.getItem("token");
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
      </div>
    );
  }

  const badge        = roleBadgeColor[user.role];
  const quickActions = roleQuickActions[user.role] ?? [];
  const description  = roleDescription[user.role] ?? "";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Welcome heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {description}
        </p>
      </div>

      {/* User info card */}
      <div
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: "rgba(11,31,51,0.08)" }}
      >
        {/* Avatar + role */}
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
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {roleLabel[user.role]}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div
          className="space-y-4 border-t pt-5"
          style={{ borderColor: "rgba(11,31,51,0.06)" }}
        >
          <InfoRow Icon={User}       label="Full Name" value={user.name} />
          <InfoRow Icon={Mail}       label="Email"     value={user.email} />
          <InfoRow Icon={ShieldCheck} label="Role"     value={roleLabel[user.role]} />
          <InfoRow Icon={Calendar}   label="User ID"   value={user.id} mono />
        </div>
      </div>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map(({ label, href, Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: primary ? "rgba(25,195,177,0.3)" : "rgba(11,31,51,0.08)",
                  backgroundColor: primary ? "rgba(25,195,177,0.05)" : "#ffffff",
                  color: primary ? "#19C3B1" : "#0B1F33",
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: primary ? "rgba(25,195,177,0.12)" : "rgba(11,31,51,0.05)",
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: primary ? "#19C3B1" : "#0B1F33" }}
                    strokeWidth={1.8}
                  />
                </div>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Permission summary */}
      <div
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: "rgba(11,31,51,0.08)" }}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
          Your Permissions
        </h2>
        <PermissionSummary role={user.role} />
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
        <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
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

function PermissionSummary({ role }: { role: string }) {
  const permissions: { label: string; allowed: boolean }[] = [
    { label: "Manage Users & Roles",            allowed: role === "ADMIN" },
    { label: "Create/Delete Resources",          allowed: role === "ADMIN" },
    { label: "Create/Delete Hospitals",          allowed: role === "ADMIN" },
    { label: "View All Resources & Hospitals",   allowed: role === "ADMIN" || role === "COORDINATOR" },
    { label: "Approve/Prioritize Incidents",     allowed: role === "ADMIN" || role === "COORDINATOR" },
    { label: "Assign Resources to Incidents",    allowed: role === "ADMIN" || role === "COORDINATOR" },
    { label: "Update Assigned Resource",         allowed: role === "ADMIN" || role === "OPERATOR" },
    { label: "Update Assigned Hospital",         allowed: role === "ADMIN" || role === "OPERATOR" },
    { label: "View Audit/Decision Logs",         allowed: role === "ADMIN" || role === "COORDINATOR" },
    { label: "Report & Manage Own Incidents",    allowed: role === "CITIZEN" || role === "ADMIN" },
    { label: "Monitor System (all operations)",  allowed: role === "ADMIN" },
  ];

  return (
    <div className="space-y-2">
      {permissions.map(({ label, allowed }) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span style={{ color: "#374151" }}>{label}</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: allowed ? "rgba(25,195,177,0.1)" : "rgba(11,31,51,0.05)",
              color: allowed ? "#19C3B1" : "#9CA3AF",
            }}
          >
            {allowed ? "✓ Allowed" : "✗ Restricted"}
          </span>
        </div>
      ))}
    </div>
  );
}
