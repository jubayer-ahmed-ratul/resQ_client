"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { incidentApi, getToken, type Incident } from "@/lib/api";
import {
  canCreateIncident,
  canViewAllIncidents,
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Plus, AlertTriangle, Clock, Users, ChevronRight, ArrowUpDown } from "lucide-react";

const severityColor: Record<Incident["severity"], string> = {
  LOW:      "bg-emerald-100 text-emerald-700",
  MEDIUM:   "bg-yellow-100 text-yellow-700",
  HIGH:     "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const statusColor: Record<Incident["status"], string> = {
  PENDING:    "bg-slate-100 text-slate-600",
  VALIDATED:  "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  ASSIGNED:   "bg-indigo-100 text-indigo-700",
  DISPATCHED: "bg-cyan-100 text-cyan-700",
  RESOLVED:   "bg-emerald-100 text-emerald-700",
  CANCELLED:  "bg-gray-100 text-gray-500",
};

function PriorityBadge({ score }: { score: number | null }) {
  if (score === null)
    return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">⚪ N/A</span>;
  const { emoji, color } =
    score >= 75 ? { emoji: "🔴", color: "bg-red-100 text-red-700" } :
    score >= 50 ? { emoji: "🟠", color: "bg-orange-100 text-orange-700" } :
    score >= 25 ? { emoji: "🟡", color: "bg-yellow-100 text-yellow-700" } :
                  { emoji: "🟢", color: "bg-emerald-100 text-emerald-700" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${color}`}>
      {emoji} {score.toFixed(0)}
    </span>
  );
}

export default function IncidentsPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser]                     = useState<AuthUser | null>(null);
  const [statusFilter, setStatusFilter]     = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [sortBy, setSortBy]                 = useState<"time" | "priority">("time");

  // Auth guard
  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token || !stored) { router.replace("/login"); return; }
    setUser(stored);
  }, [router]);

  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["incidents", statusFilter, severityFilter, sortBy],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (statusFilter)   params.status   = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      if (sortBy === "priority") params.sort = "priority";
      return incidentApi.list(token!, params).then((r) => r.data.data);
    },
    enabled: !!token && !!user,
  });

  const incidents = data ?? [];

  const isCitizenView  = user?.role === "CITIZEN";
  const isOperatorView = user?.role === "OPERATOR";

  const pageTitle = isCitizenView ? "My Reports" : isOperatorView ? "Assigned Incidents" : "Incidents";
  const pageSubtitle = isCitizenView
    ? "Track your emergency reports"
    : isOperatorView
    ? "View incidents assigned to your resources"
    : "Manage and track emergency incidents";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>{pageTitle}</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>{pageSubtitle}</p>
        </div>
        {user && canCreateIncident(user.role) && (
          <Link
            href="/dashboard/incidents/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
            style={{ backgroundColor: "#19C3B1" }}
          >
            <Plus className="h-4 w-4" />
            {isCitizenView ? "Report Emergency" : "New Incident"}
          </Link>
        )}
      </div>

      {/* Filters */}
      {user && canViewAllIncidents(user.role) && (
        <div className="flex flex-wrap items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
            <option value="">All Status</option>
            {["PENDING","VALIDATED","PROCESSING","ASSIGNED","DISPATCHED","RESOLVED","CANCELLED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
            <option value="">All Severity</option>
            {["LOW","MEDIUM","HIGH","CRITICAL"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-1 rounded-xl border p-1"
            style={{ borderColor: "rgba(11,31,51,0.12)" }}>
            <button onClick={() => setSortBy("time")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortBy === "time" ? "bg-[#0B1F33] text-white" : "text-slate-500 hover:text-[#0B1F33]"
              }`}>
              <Clock className="h-3.5 w-3.5" /> By Time
            </button>
            <button onClick={() => setSortBy("priority")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortBy === "priority" ? "bg-[#0B1F33] text-white" : "text-slate-500 hover:text-[#0B1F33]"
              }`}>
              <ArrowUpDown className="h-3.5 w-3.5" /> By Priority
            </button>
          </div>
        </div>
      )}

      {/* Role notices */}
      {isCitizenView && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.2)", color: "#0B1F33" }}>
          You can only view your own emergency reports.
        </div>
      )}
      {isOperatorView && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.2)", color: "#0B1F33" }}>
          Showing incidents assigned to your resources only.
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={1} />
      ) : isError ? (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error instanceof Error ? error.message : "Data load করা যায়নি। Refresh করো।"}
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}>
          <AlertTriangle className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>
            {isCitizenView ? "No reports found" : "No incidents found"}
          </p>
          {user && canCreateIncident(user.role) && (
            <Link href="/dashboard/incidents/new" className="text-sm font-semibold" style={{ color: "#19C3B1" }}>
              {isCitizenView ? "Report your first emergency" : "Create your first incident"}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/dashboard/incidents/${incident.id}`}
              className="flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "rgba(11,31,51,0.08)" }}
              // Prefetch detail on hover
              onMouseEnter={() =>
                queryClient.prefetchQuery({
                  queryKey: ["incident", incident.id],
                  queryFn:  () => incidentApi.getById(incident.id, token!).then((r) => r.data),
                  staleTime: 5 * 60 * 1000,
                })
              }
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                incident.severity === "CRITICAL" ? "bg-red-100"    :
                incident.severity === "HIGH"     ? "bg-orange-100" :
                incident.severity === "MEDIUM"   ? "bg-yellow-100" : "bg-emerald-100"
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  incident.severity === "CRITICAL" ? "text-red-600"    :
                  incident.severity === "HIGH"     ? "text-orange-600" :
                  incident.severity === "MEDIUM"   ? "text-yellow-600" : "text-emerald-600"
                }`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-sm" style={{ color: "#0B1F33" }}>{incident.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityColor[incident.severity]}`}>
                    {incident.severity}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor[incident.status]}`}>
                    {incident.status}
                  </span>
                  {user && canViewAllIncidents(user.role) && (
                    <PriorityBadge score={incident.priorityScore} />
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                    <Users className="h-3 w-3" />{incident.affectedPeople} affected
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                    <Clock className="h-3 w-3" />{new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#9CA3AF" }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
