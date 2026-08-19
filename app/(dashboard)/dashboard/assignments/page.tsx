"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  assignmentApi, reoptimizationApi, getToken,
  type Assignment, type ReoptimizeResult,
} from "@/lib/api";
import {
  canManageAssignments,
  canReoptimize,
  canViewAssignments,
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";
import {
  ClipboardList, CheckCircle2, XCircle, Loader2,
  Clock, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";

const statusColor: Record<Assignment["status"], string> = {
  PENDING:   "bg-slate-100 text-slate-600",
  ACTIVE:    "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [user, setUser]                   = useState<AuthUser | null>(null);
  const [assignments, setAssignments]     = useState<Assignment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  const [reoptResults, setReoptResults] = useState<Record<string, ReoptimizeResult>>({});
  const [reoptErrors, setReoptErrors]   = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token) { router.replace("/login"); return; }
    if (!stored) { router.replace("/login"); return; }
    setUser(stored);

    // CITIZEN cannot access assignments
    if (stored.role === "CITIZEN") {
      router.replace("/dashboard");
      return;
    }

    if (!canViewAssignments(stored.role)) {
      router.replace("/dashboard");
      return;
    }

    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;

    setLoading(true);
    assignmentApi.list(token, params)
      .then((res) => setAssignments(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, statusFilter]);

  const handleComplete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id + "-complete");
    try {
      const res = await assignmentApi.complete(id, token);
      setAssignments((prev) => prev.map((a) => a.id === id ? res.data : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id + "-cancel");
    try {
      const res = await assignmentApi.cancel(id, token);
      setAssignments((prev) => prev.map((a) => a.id === id ? res.data : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReoptimize = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id + "-reopt");
    setReoptErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await reoptimizationApi.reoptimize(id, { trigger: "RESOURCE_FAILURE" }, token);
      setReoptResults((prev) => ({ ...prev, [id]: res.data }));
      if (res.data.reoptimized) {
        const token2 = getToken()!;
        const params: Record<string, string> = {};
        if (statusFilter) params.status = statusFilter;
        const updated = await assignmentApi.list(token2, params);
        setAssignments(updated.data.data);
      }
    } catch (err) {
      setReoptErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Re-optimization failed",
      }));
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  // OPERATOR can complete/cancel (backend enforces assigned-only)
  // ADMIN/COORDINATOR can also re-optimize
  const canManage  = canManageAssignments(user.role);
  const canReopt   = canReoptimize(user.role);
  const isOperator = user.role === "OPERATOR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
          Assignments
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
          {isOperator
            ? "Track and update your assigned tasks"
            : "Track and manage resource assignments"}
        </p>
      </div>

      {/* Operator notice */}
      {isOperator && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(249,115,22,0.06)",
            borderColor: "rgba(249,115,22,0.2)",
            color: "#0B1F33",
          }}
        >
          You can only complete or cancel assignments linked to your resources.
          Other operations are restricted.
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
        >
          <option value="">All Status</option>
          {["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
        </div>
      ) : assignments.length === 0 ? (
        <div
          className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}
        >
          <ClipboardList className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No assignments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const isExpanded  = expandedId === a.id;
            const reoptResult = reoptResults[a.id];
            const reoptError  = reoptErrors[a.id];

            return (
              <div
                key={a.id}
                className="rounded-2xl border bg-white shadow-sm transition-all"
                style={{ borderColor: "rgba(11,31,51,0.08)" }}
              >
                {/* Main row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Status icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    a.status === "ACTIVE"    ? "bg-blue-100" :
                    a.status === "COMPLETED" ? "bg-emerald-100" :
                    a.status === "CANCELLED" ? "bg-gray-100" : "bg-slate-100"
                  }`}>
                    {a.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : a.status === "CANCELLED" ? (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ClipboardList className={`h-5 w-5 ${a.status === "ACTIVE" ? "text-blue-600" : "text-slate-500"}`} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor[a.status]}`}>
                        {a.status}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "#9CA3AF" }}>
                        {a.id.slice(0, 12)}…
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: "#6B7280" }}>
                      <span>Incident: <span className="font-mono">{a.incidentId.slice(0, 8)}…</span></span>
                      <span>Resource: <span className="font-mono">{a.resourceId.slice(0, 8)}…</span></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {canManage && a.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => handleComplete(a.id)}
                          disabled={!!actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
                          style={{ backgroundColor: "#19C3B1" }}
                        >
                          {actionLoading === a.id + "-complete"
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <CheckCircle2 className="h-3.5 w-3.5" />
                          }
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(a.id)}
                          disabled={!!actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50 disabled:opacity-60"
                          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}
                        >
                          {actionLoading === a.id + "-cancel"
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <XCircle className="h-3.5 w-3.5" />
                          }
                          Cancel
                        </button>

                        {/* Re-optimize — ADMIN/COORDINATOR only, NOT Operator */}
                        {canReopt && (
                          <button
                            onClick={() => handleReoptimize(a.id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-orange-50 disabled:opacity-60"
                            style={{ borderColor: "rgba(249,115,22,0.35)", color: "#f97316" }}
                            title="Re-evaluate and replace resource if conditions have changed"
                          >
                            {actionLoading === a.id + "-reopt"
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <RefreshCw className="h-3.5 w-3.5" />
                            }
                            Re-optimize
                          </button>
                        )}
                      </>
                    )}

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4" style={{ color: "#6B7280" }} />
                        : <ChevronDown className="h-4 w-4" style={{ color: "#6B7280" }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Re-optimize result banner */}
                {reoptError && (
                  <div
                    className="mx-4 mb-3 rounded-xl border px-4 py-2.5 text-xs"
                    style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}
                  >
                    {reoptError}
                  </div>
                )}
                {reoptResult && (
                  <div
                    className="mx-4 mb-3 rounded-xl border px-4 py-3 text-xs space-y-1"
                    style={{
                      backgroundColor: reoptResult.reoptimized ? "rgba(25,195,177,0.06)" : "rgba(11,31,51,0.03)",
                      borderColor: reoptResult.reoptimized ? "rgba(25,195,177,0.25)" : "rgba(11,31,51,0.1)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 font-semibold"
                      style={{ color: reoptResult.reoptimized ? "#19C3B1" : "#6B7280" }}
                    >
                      {reoptResult.reoptimized
                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Re-optimized — new resource assigned</>
                        : reoptResult.replacementFound === false
                        ? <><XCircle className="h-3.5 w-3.5" /> No replacement found — original kept</>
                        : <><CheckCircle2 className="h-3.5 w-3.5" /> Still optimal — no change needed</>
                      }
                    </div>
                    <p style={{ color: "#6B7280" }}>{reoptResult.message}</p>
                    {reoptResult.newAssignmentId && (
                      <p style={{ color: "#9CA3AF" }}>
                        New assignment: <span className="font-mono">{reoptResult.newAssignmentId.slice(0, 12)}…</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    className="border-t px-4 py-4 space-y-2"
                    style={{ borderColor: "rgba(11,31,51,0.06)" }}
                  >
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Assignment ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{a.id}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Incident ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{a.incidentId}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Resource ID</p>
                        <p className="font-mono" style={{ color: "#243447" }}>{a.resourceId}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Last Updated</p>
                        <p style={{ color: "#243447" }}>{new Date(a.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
