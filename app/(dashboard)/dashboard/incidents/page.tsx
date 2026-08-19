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
import { Plus, AlertTriangle, Clock, Users, ChevronRight, ArrowUpDown, Filter } from "lucide-react";

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

  const incidents     = data ?? [];
  const isCitizenView = user?.role === "CITIZEN";
  const isOperator    = user?.role === "OPERATOR";
  const showFilters   = user && canViewAllIncidents(user.role);

  return (
    <div className="space-y-5">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
            {isCitizenView ? "My Reports" : isOperator ? "Assigned Incidents" : "Incidents"}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>
            {isCitizenView ? "Track your emergency reports"
              : isOperator ? "View incidents assigned to your resources"
              : "Manage and track emergency incidents"}
          </p>
        </div>
        {user && canCreateIncident(user.role) && (
          <Link href="/dashboard/incidents/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
            style={{ backgroundColor: "#19C3B1" }}>
            <Plus className="h-4 w-4" />
            {isCitizenView ? "Report Emergency" : "New Incident"}
          </Link>
        )}
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px] lg:items-start">

        {/* LEFT — incident list */}
        <div className="space-y-3 min-w-0">

          {/* Role notices */}
          {isCitizenView && (
            <div className="rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.2)", color: "#0B1F33" }}>
              You can only view your own emergency reports.
            </div>
          )}
          {isOperator && (
            <div className="rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.2)", color: "#0B1F33" }}>
              Showing incidents assigned to your resources only.
            </div>
          )}

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
            incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/dashboard/incidents/${incident.id}`}
                className="flex items-center gap-3 rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: "rgba(11,31,51,0.08)" }}
                onMouseEnter={() =>
                  queryClient.prefetchQuery({
                    queryKey: ["incident", incident.id],
                    queryFn:  () => incidentApi.getById(incident.id, token!).then((r) => r.data),
                    staleTime: 5 * 60 * 1000,
                  })
                }
              >
                {/* Severity icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  incident.severity === "CRITICAL" ? "bg-red-100"    :
                  incident.severity === "HIGH"     ? "bg-orange-100" :
                  incident.severity === "MEDIUM"   ? "bg-yellow-100" : "bg-emerald-100"
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    incident.severity === "CRITICAL" ? "text-red-600"    :
                    incident.severity === "HIGH"     ? "text-orange-600" :
                    incident.severity === "MEDIUM"   ? "text-yellow-600" : "text-emerald-600"
                  }`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm" style={{ color: "#0B1F33" }}>{incident.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityColor[incident.severity]}`}>
                      {incident.severity}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor[incident.status]}`}>
                      {incident.status}
                    </span>
                    {user && canViewAllIncidents(user.role) && (
                      <PriorityBadge score={incident.priorityScore} />
                    )}
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "#9CA3AF" }}>
                      <Users className="h-3 w-3" />{incident.affectedPeople}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "#9CA3AF" }}>
                      <Clock className="h-3 w-3" />{new Date(incident.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#9CA3AF" }} />
              </Link>
            ))
          )}
        </div>

        {/* RIGHT — sticky filter panel (Admin/Coordinator only) */}
        {showFilters && (
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: "rgba(11,31,51,0.08)" }}>
              <div className="mb-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" style={{ color: "#9CA3AF" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                  Filters
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#19C3B1]"
                    style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
                    <option value="">All</option>
                    {["PENDING","VALIDATED","PROCESSING","ASSIGNED","DISPATCHED","RESOLVED","CANCELLED"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>Severity</label>
                  <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#19C3B1]"
                    style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
                    <option value="">All</option>
                    {["LOW","MEDIUM","HIGH","CRITICAL"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>Sort by</label>
                  <div className="flex rounded-xl border overflow-hidden"
                    style={{ borderColor: "rgba(11,31,51,0.15)" }}>
                    {(["time","priority"] as const).map((opt) => (
                      <button key={opt} onClick={() => setSortBy(opt)}
                        className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                          sortBy === opt ? "bg-[#0B1F33] text-white" : "text-slate-500 hover:text-[#0B1F33]"
                        }`}>
                        {opt === "time" ? <><Clock className="inline h-3 w-3 mr-1" />Time</> : <><ArrowUpDown className="inline h-3 w-3 mr-1" />Priority</>}
                      </button>
                    ))}
                  </div>
                </div>

                {(statusFilter || severityFilter) && (
                  <button
                    onClick={() => { setStatusFilter(""); setSeverityFilter(""); }}
                    className="w-full rounded-xl border py-2 text-xs font-semibold transition-colors hover:bg-gray-50"
                    style={{ borderColor: "rgba(11,31,51,0.12)", color: "#6B7280" }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Count summary */}
            {!isLoading && (
              <div className="rounded-xl border px-4 py-3 text-center"
                style={{ borderColor: "rgba(11,31,51,0.08)", backgroundColor: "rgba(11,31,51,0.02)" }}>
                <p className="text-2xl font-bold" style={{ color: "#0B1F33" }}>{incidents.length}</p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  {statusFilter || severityFilter ? "matching incidents" : "total incidents"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
