"use client";

import { useEffect, useState } from "react";
import { auditLogApi, getToken, type AuditLog, type AuditEntity } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { roleBadgeColor, roleLabel, type UserRole } from "@/lib/auth";
import {
  ClipboardList, ChevronDown, ChevronUp, Clock,
  AlertTriangle, Truck, Building2, Users, FileText,
} from "lucide-react";

const ENTITY_ICONS: Record<AuditEntity, React.ElementType> = {
  INCIDENT:   AlertTriangle,
  ASSIGNMENT: ClipboardList,
  RESOURCE:   Truck,
  HOSPITAL:   Building2,
  USER:       Users,
};

const ENTITY_COLOR: Record<AuditEntity, string> = {
  INCIDENT:   "bg-orange-100 text-orange-700",
  ASSIGNMENT: "bg-blue-100 text-blue-700",
  RESOURCE:   "bg-purple-100 text-purple-700",
  HOSPITAL:   "bg-emerald-100 text-emerald-700",
  USER:       "bg-red-100 text-red-700",
};

export default function AuditLogsPage() {
  const { user, token, ready } = useAuth({ require: ["ADMIN", "COORDINATOR"] });

  const [logs, setLogs]               = useState<AuditLog[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [entityFilter, setEntityFilter] = useState<AuditEntity | "">("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  // COORDINATOR can only filter INCIDENT and ASSIGNMENT
  const allowedEntities: AuditEntity[] = user?.role === "ADMIN"
    ? ["INCIDENT", "ASSIGNMENT", "RESOURCE", "HOSPITAL", "USER"]
    : ["INCIDENT", "ASSIGNMENT"];

  useEffect(() => {
    if (!ready || !token) return;
    setLoading(true);
    auditLogApi.list(token, {
      page,
      limit: 20,
      entity: entityFilter || undefined,
    })
      .then((res) => {
        setLogs(res.data.data ?? []);
        setTotalPages(res.data.pagination.totalPages ?? 1);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, [ready, token, page, entityFilter]);

  if (!ready) return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Audit Logs</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {user?.role === "ADMIN"
            ? "Full system activity history"
            : "Incident and assignment activity history"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value as AuditEntity | ""); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
        >
          <option value="">All Entities</option>
          {allowedEntities.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        {user?.role === "COORDINATOR" && (
          <span className="text-xs rounded-full border px-3 py-1.5"
            style={{ borderColor: "rgba(124,58,237,0.2)", color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.06)" }}>
            Coordinator view — INCIDENT & ASSIGNMENT only
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}>
          <FileText className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon        = ENTITY_ICONS[log.entity] ?? FileText;
            const entityColor = ENTITY_COLOR[log.entity] ?? "bg-slate-100 text-slate-600";
            const isExpanded  = expandedId === log.id;
            const actorBadge  = log.actorRole ? roleBadgeColor[log.actorRole as UserRole] : null;

            return (
              <div key={log.id}
                className="rounded-2xl border bg-white shadow-sm transition-all"
                style={{ borderColor: "rgba(11,31,51,0.08)" }}>

                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Entity icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${entityColor.split(" ")[0]}`}>
                    <Icon className={`h-4 w-4 ${entityColor.split(" ")[1]}`} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${entityColor}`}>
                        {log.entity}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {log.action}
                      </span>
                      {actorBadge && (
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{ backgroundColor: actorBadge.bg, color: actorBadge.text }}>
                          {roleLabel[log.actorRole as UserRole] ?? log.actorRole}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs" style={{ color: "#9CA3AF" }}>
                      {log.actorName && <span>by {log.actorName}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  >
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4" style={{ color: "#6B7280" }} />
                      : <ChevronDown className="h-4 w-4" style={{ color: "#6B7280" }} />
                    }
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-3"
                    style={{ borderColor: "rgba(11,31,51,0.06)" }}>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Log ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{log.id}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Entity ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{log.entityId}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Actor ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{log.actorId}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Timestamp</p>
                        <p style={{ color: "#243447" }}>{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                          Changes
                        </p>
                        <pre className="overflow-x-auto rounded-xl p-3 text-[11px] leading-relaxed"
                          style={{ backgroundColor: "rgba(11,31,51,0.04)", border: "1px solid rgba(11,31,51,0.08)", color: "#374151" }}>
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-40"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: "#6B7280" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-40"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
