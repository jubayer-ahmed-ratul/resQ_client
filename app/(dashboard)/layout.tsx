"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Zap,
  LayoutDashboard,
  AlertTriangle,
  Truck,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  Users,
  UserCircle,
  FileText,
} from "lucide-react";
import {
  type AuthUser,
  type UserRole,
  getNavPermissions,
  getStoredUser,
  roleBadgeColor,
  roleLabel,
} from "@/lib/auth";

const ALL_NAV = [
  { label: "Dashboard",   href: "/dashboard",                  Icon: LayoutDashboard, key: "dashboard"   },
  { label: "Incidents",   href: "/dashboard/incidents",        Icon: AlertTriangle,   key: "incidents"   },
  { label: "Resources",   href: "/dashboard/resources",        Icon: Truck,           key: "resources"   },
  { label: "Hospitals",   href: "/dashboard/hospitals",        Icon: Building2,       key: "hospitals"   },
  { label: "Assignments", href: "/dashboard/assignments",      Icon: ClipboardList,   key: "assignments" },
  { label: "Users",       href: "/dashboard/users",            Icon: Users,           key: "users"       },
  { label: "Audit Logs",  href: "/dashboard/audit-logs",       Icon: FileText,        key: "audit-logs"  },
  { label: "My Profile",  href: "/dashboard/profile",          Icon: UserCircle,      key: "profile"     },
] as const;

function getVisibleNav(role: UserRole) {
  const perms = getNavPermissions(role);
  return ALL_NAV.filter((item) => {
    if (item.key === "dashboard")   return true;
    if (item.key === "incidents")   return perms.showIncidents;
    if (item.key === "resources")   return perms.showResources;
    if (item.key === "hospitals")   return perms.showHospitals;
    if (item.key === "assignments") return perms.showAssignments;
    if (item.key === "users")       return role === "ADMIN";
    if (item.key === "audit-logs")  return role === "ADMIN" || role === "COORDINATOR";
    if (item.key === "profile")     return true; // all roles
    return false;
  });
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUser(stored);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = user ? getVisibleNav(user.role) : [];
  const badge    = user ? roleBadgeColor[user.role] : null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F5F7FA" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0B1F33" }}
      >
        {/* Logo */}
        <div
          className="flex h-16 items-center gap-3 px-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="relative">
              <Shield className="w-4 h-4 text-white" strokeWidth={2} />
              <Zap
                className="w-2 h-2 absolute -bottom-0.5 -right-0.5"
                style={{ color: "#19C3B1" }}
                strokeWidth={2.5}
              />
            </div>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            resq<span style={{ color: "#19C3B1" }}>Buddy</span>
          </span>
          {/* Close btn — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info pill */}
        {user && badge && (
          <div
            className="mx-3 mt-3 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white leading-tight">
                  {user.name}
                </p>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-tight mt-0.5"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {roleLabel[user.role]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map(({ label, href, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#19C3B1]/15 text-[#19C3B1]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="p-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header
          className="flex h-16 shrink-0 items-center justify-between border-b px-5"
          style={{ backgroundColor: "#ffffff", borderColor: "rgba(11,31,51,0.08)" }}
        >
          {/* Hamburger — mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" style={{ color: "#0B1F33" }} />
          </button>

          <span className="hidden lg:block text-sm font-medium" style={{ color: "#6B7280" }}>
            resqBuddy Dashboard
          </span>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" style={{ color: "#6B7280" }} />
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: "#E63946" }}
              />
            </button>

            {/* Role badge (topbar, desktop) */}
            {user && badge && (
              <span
                className="hidden sm:inline-block rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {roleLabel[user.role]}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
