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

const roleQuickActions: Record<string, { label: string; href: string; Icon: React.ElementType; primary?: boolean }[]> = {
  ADMIN: [
    { label: "View All Incidents",  href: "/dashboard/incidents",   Icon: AlertTriangle },
    { label: "Manage Resources",    href: "/dashboard/resources",   Icon: Truck,        primary: true },
    { label: "Manage Hospitals",    href: "/dashboard/hospitals",   Icon: Building2 },
    { label: "View Assignments",    href: "/dashboard/assignments", Icon: ClipboardList },
  ],
  COORDINATOR: [
    { label: "View Incidents",      href: "/dashboard/incidents",   Icon: AlertTriangle, primary: true },
    { label: "View Resources",      href: "/dashboard/resources",   Icon: Truck },
    { label: "View Hospitals",      href: "/dashboard/hospitals",   Icon: Building2 },
    { label: "Manage Assignments",  href: "/dashboard/assignments", Icon: ClipboardList },
  ],
  OPERATOR: [
    { label: "My Assignments",      href: "/dashboard/assignments", Icon: ClipboardList, primary: true },
    { label: "View Resources",      href: "/dashboard/resources",   Icon: Truck },
    { label: "View Hospitals",      href: "/dashboard/hospitals",   Icon: Building2 },
  ],
  CITIZEN: [
    { label: "Report Emergency",    href: "/dashboard/incidents/new", Icon: Plus,  primary: true },
    { label: "My Reports",          href: "/dashboard/incidents",     Icon: Eye },
  ],
};

const roleDescription: Record<string, string> = {
  ADMIN:       "Full system control — manage users, resources, hospitals, and monitor all operations.",
  COORDINATOR: "Manage emergency incidents and operational assignments. Review, approve, and dispatch resources.",
  OPERATOR:    "Manage your assigned resources and hospitals. Update status and mark tasks as completed.",
  CITIZEN:     "Report emergency incidents and track the status of your own reports.",
};

const permissions = [
  { label: "Manage Users & Roles",          admin: true,  coord: false, op: false, cit: false },
  { label: "Create/Delete Resources",        admin: true,  coord: false, op: false, cit: false },
  { label: "Create/Delete Hospitals",        admin: true,  coord: false, op: false, cit: false },
  { label: "View All Resources & Hospitals", admin: true,  coord: true,  op: false, cit: false },
  { label: "Approve/Prioritize Incidents",   admin: true,  coord: true,  op: false, cit: false },
  { label: "Assign Resources to Incidents",  admin: true,  coord: true,  op: false, cit: false },
  { label: "Update Assigned Resource",       admin: true,  coord: false, op: true,  cit: false },
  { label: "Update Assigned Hospital",       admin: true,  coord: false, op: true,  cit: false },
  { label: "View Audit/Decision Logs",       admin: true,  coord: true,  op: false, cit: false },
  { label: "Report Own Incidents",           admin: true,  coord: false, op: false, cit: true  },
  { label: "Monitor System (all ops)",       admin: true,  coord: false, op: false, cit: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    const token  = localStorage.getItem("token");
    if (!token || !stored) { router.replace("/login"); return; }
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

  const allowed = (p: typeof permissions[number]) => {
    if (user.role === "ADMIN")       return p.admin;
    if (user.role === "COORDINATOR") return p.coord;
    if (user.role === "OPERATOR")    return p.op;
    return p.cit;
  };

  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {roleDescription[user.role]}
        </p>
      </div>

      {/* ── Two-column main layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

        {/* LEFT — user info card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>

          {/* Avatar + role */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ backgroundColor: "#0B1F33" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: "#0B1F33" }}>{user.name}</p>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ backgroundColor: badge.bg, color: badge.text }}>
                {roleLabel[user.role]}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-3 border-t pt-4" style={{ borderColor: "rgba(11,31,51,0.06)" }}>
            <InfoRow Icon={User}       label="Full Name" value={user.name} />
            <InfoRow Icon={Mail}       label="Email"     value={user.email} />
            <InfoRow Icon={ShieldCheck} label="Role"     value={roleLabel[user.role]} />
            <InfoRow Icon={Calendar}   label="User ID"   value={user.id} mono />
          </div>
        </div>

        {/* RIGHT — quick actions + permissions */}
        <div className="space-y-5 lg:sticky lg:top-6">

          {/* Quick actions */}
          {quickActions.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                Quick Actions
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickActions.map(({ label, href, Icon, primary }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 rounded-2xl border p-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      borderColor:     primary ? "rgba(25,195,177,0.3)" : "rgba(11,31,51,0.08)",
                      backgroundColor: primary ? "rgba(25,195,177,0.05)" : "#ffffff",
                      color:           primary ? "#19C3B1" : "#0B1F33",
                    }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: primary ? "rgba(25,195,177,0.12)" : "rgba(11,31,51,0.05)" }}>
                      <Icon className="h-4 w-4" style={{ color: primary ? "#19C3B1" : "#0B1F33" }} strokeWidth={1.8} />
                    </div>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Permission summary */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "rgba(11,31,51,0.08)" }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              Your Permissions
            </p>
            <div className="space-y-1.5">
              {permissions.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: "#374151" }}>{p.label}</span>
                  <span className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      backgroundColor: allowed(p) ? "rgba(25,195,177,0.1)" : "rgba(11,31,51,0.05)",
                      color:           allowed(p) ? "#19C3B1" : "#9CA3AF",
                    }}>
                    {allowed(p) ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ Icon, label, value, mono = false }:
  { Icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "rgba(11,31,51,0.05)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "#0B1F33" }} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
        <p className={`mt-0.5 truncate text-sm font-medium ${mono ? "font-mono" : ""}`} style={{ color: "#243447" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
