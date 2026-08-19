"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  incidentApi, decisionApi, assignmentApi, reoptimizationApi, getToken,
  type Incident, type PriorityResult, type User,
  type ResourceRecommendation, type DecisionLog, type ReoptimizationLog,
} from "@/lib/api";
import { canManageIncidents, canViewAuditLogs, getStoredUser } from "@/lib/auth";
import {
  ArrowLeft, AlertTriangle, Clock, Users, MapPin,
  Zap, CheckCircle2, Loader2, Truck, ChevronDown, ChevronUp,
  XCircle, History, ShieldCheck, RefreshCw, ClipboardList, GitMerge,
} from "lucide-react";

const severityColor: Record<Incident["severity"], string> = {
  LOW: "bg-emerald-100 text-emerald-700", MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",  CRITICAL: "bg-red-100 text-red-700",
};
const statusColor: Record<Incident["status"], string> = {
  PENDING: "bg-slate-100 text-slate-600",   VALIDATED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700", ASSIGNED: "bg-indigo-100 text-indigo-700",
  DISPATCHED: "bg-cyan-100 text-cyan-700",  RESOLVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};
const ALL_STATUSES: Incident["status"][] = ["PENDING","VALIDATED","PROCESSING","ASSIGNED","DISPATCHED","RESOLVED","CANCELLED"];
const decisionTypeMeta: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PRIORITY_CALCULATION:    { label: "Priority Calculation",   color: "#7C3AED", bg: "rgba(124,58,237,0.08)",  icon: "⚡" },
  RESOURCE_RECOMMENDATION: { label: "Resource Recommendation", color: "#0B1F33", bg: "rgba(11,31,51,0.06)",   icon: "🚑" },
  RESOURCE_ASSIGNMENT:     { label: "Resource Assignment",     color: "#19C3B1", bg: "rgba(25,195,177,0.08)", icon: "✅" },
  RESOURCE_REJECTION:      { label: "Resource Rejected",       color: "#E63946", bg: "rgba(230,57,70,0.07)",  icon: "❌" },
};

function FactorBar({ label, weighted, maxWeight, reason }: { label: string; weighted: number; maxWeight: number; reason: string }) {
  const pct = maxWeight > 0 ? (weighted / maxWeight) * 100 : 0;
  const color = pct >= 80 ? "#E63946" : pct >= 60 ? "#F59E0B" : "#19C3B1";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium" style={{ color: "#374151" }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: "#0B1F33" }}>{weighted.toFixed(2)} / {maxWeight}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{reason}</p>
    </div>
  );
}

function InfoItem({ Icon, label, value }: { Icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(11,31,51,0.05)" }}>
        <Icon className="h-4 w-4" style={{ color: "#0B1F33" }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[11px] font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: "#243447" }}>{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl py-3 text-center"
      style={{ backgroundColor: "rgba(11,31,51,0.04)", border: "1px solid rgba(11,31,51,0.07)" }}>
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-bold" style={{ color: "#0B1F33" }}>{value}</p>
      <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{label}</p>
    </div>
  );
}

function DecisionLogCard({ log }: { log: DecisionLog }) {
  const [expanded, setExpanded] = useState(false);
  const meta = decisionTypeMeta[log.decisionType] ?? { label: log.decisionType, color: "#6B7280", bg: "rgba(107,114,128,0.07)", icon: "📋" };
  return (
    <div className="rounded-2xl border transition-all" style={{ borderColor: "rgba(11,31,51,0.08)", backgroundColor: "rgba(11,31,51,0.01)" }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-base">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">{log.algorithmVersion}</span>
            {log.priorityScore !== null && (
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: "rgba(25,195,177,0.1)", color: "#19C3B1" }}>
                Score: {log.priorityScore.toFixed(1)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px]" style={{ color: "#9CA3AF" }}>{new Date(log.createdAt).toLocaleString()}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" style={{ color: "#6B7280" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#6B7280" }} />}
        </button>
      </div>
      {expanded && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: "rgba(11,31,51,0.06)" }}>
          {log.selectedResourceId && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Selected Resource</p>
              <p className="font-mono text-xs rounded-lg px-3 py-1.5"
                style={{ backgroundColor: "rgba(25,195,177,0.07)", color: "#19C3B1", border: "1px solid rgba(25,195,177,0.2)" }}>
                {log.selectedResourceId}
              </p>
            </div>
          )}
          {log.factors && Object.keys(log.factors).length > 0 && (
            <div className="space-y-2">
              {Object.entries(log.factors).map(([key, val]) => {
                const f = val as Record<string, unknown>;
                return (
                  <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                    style={{ backgroundColor: "rgba(11,31,51,0.03)", border: "1px solid rgba(11,31,51,0.06)" }}>
                    <span className="font-semibold capitalize" style={{ color: "#374151" }}>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <div className="flex items-center gap-3">
                      {f.value !== undefined && <span className="rounded-full px-2 py-0.5 font-medium" style={{ backgroundColor: "rgba(11,31,51,0.06)", color: "#6B7280" }}>{String(f.value)}</span>}
                      {f.contribution !== undefined && <span className="font-bold" style={{ color: "#0B1F33" }}>+{Number(f.contribution).toFixed(2)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Full Explanation</p>
            <pre className="overflow-x-auto rounded-xl p-3 text-[11px] leading-relaxed"
              style={{ backgroundColor: "rgba(11,31,51,0.04)", border: "1px solid rgba(11,31,51,0.08)", color: "#374151" }}>
              {JSON.stringify(log.explanation, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ReoptimizationLogCard({ log }: { log: ReoptimizationLog }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border transition-all" style={{ borderColor: "rgba(11,31,51,0.08)", backgroundColor: "rgba(11,31,51,0.01)" }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-base">{log.replaced ? "🔄" : "✅"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: log.replaced ? "rgba(249,115,22,0.1)" : "rgba(25,195,177,0.1)", color: log.replaced ? "#f97316" : "#19C3B1" }}>
              {log.replaced ? "Resource Replaced" : "No Change Needed"}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">{log.triggeredBy}</span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "#6B7280" }}>{log.reason}</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "#9CA3AF" }}>{new Date(log.createdAt).toLocaleString()}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" style={{ color: "#6B7280" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#6B7280" }} />}
        </button>
      </div>
      {expanded && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: "rgba(11,31,51,0.06)" }}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Old Assignment</p><p className="font-mono" style={{ color: "#243447" }}>{log.oldAssignmentId.slice(0, 12)}…</p></div>
            {log.newAssignmentId && <div><p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>New Assignment</p><p className="font-mono" style={{ color: "#19C3B1" }}>{log.newAssignmentId.slice(0, 12)}…</p></div>}
            <div><p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Old Resource</p><p className="font-mono" style={{ color: "#243447" }}>{log.oldResourceId.slice(0, 12)}…</p></div>
            {log.newResourceId && <div><p className="font-medium mb-0.5" style={{ color: "#9CA3AF" }}>New Resource</p><p className="font-mono" style={{ color: "#19C3B1" }}>{log.newResourceId.slice(0, 12)}…</p></div>}
          </div>
          {Object.keys(log.details).length > 0 && (
            <pre className="overflow-x-auto rounded-xl p-3 text-[11px] leading-relaxed"
              style={{ backgroundColor: "rgba(11,31,51,0.04)", border: "1px solid rgba(11,31,51,0.08)", color: "#374151" }}>
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [incident, setIncident]             = useState<Incident | null>(null);
  const [user, setUser]                     = useState<User | null>(null);
  const [priority, setPriority]             = useState<PriorityResult | null>(null);
  const [calcLoading, setCalcLoading]       = useState(false);
  const [calcError, setCalcError]           = useState("");
  const [recommendation, setRecommendation] = useState<ResourceRecommendation | null>(null);
  const [recLoading, setRecLoading]         = useState(false);
  const [recError, setRecError]             = useState("");
  const [showRejected, setShowRejected]     = useState(false);
  const [decisions, setDecisions]           = useState<DecisionLog[]>([]);
  const [decLoading, setDecLoading]         = useState(false);
  const [reoptLogs, setReoptLogs]           = useState<ReoptimizationLog[]>([]);
  const [reoptLoading, setReoptLoading]     = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError]     = useState("");
  const [statusLoading, setStatusLoading]     = useState(false);
  const [statusError, setStatusError]         = useState("");
  const [assignLoading, setAssignLoading]     = useState(false);
  const [assignError, setAssignError]         = useState("");
  const [assignSuccess, setAssignSuccess]     = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    const storedUser = getStoredUser();
    if (storedUser) setUser(storedUser as User);
    incidentApi.getById(id, token)
      .then((res) => setIncident(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    if (storedUser && canViewAuditLogs(storedUser.role)) {
      setDecLoading(true);
      decisionApi.listByIncident(id, token).then((res) => setDecisions(res.data)).catch(() => {}).finally(() => setDecLoading(false));
      setReoptLoading(true);
      reoptimizationApi.listByIncident(id, token).then((res) => setReoptLogs(res.data)).catch(() => {}).finally(() => setReoptLoading(false));
    }
  }, [id, router]);

  const canManage = user && canManageIncidents(user.role);

  const handleValidate = async () => {
    const token = getToken(); if (!token) return;
    setValidateError(""); setValidateLoading(true);
    try { const res = await incidentApi.validate(id, token); setIncident(res.data); }
    catch (err) { setValidateError(err instanceof Error ? err.message : "Validation failed"); }
    finally { setValidateLoading(false); }
  };

  const handleStatusChange = async (newStatus: Incident["status"]) => {
    const token = getToken(); if (!token || !incident || newStatus === incident.status) return;
    setStatusError(""); setStatusLoading(true);
    try { const res = await incidentApi.updateStatus(id, newStatus, token); setIncident(res.data); }
    catch (err) { setStatusError(err instanceof Error ? err.message : "Status update failed"); }
    finally { setStatusLoading(false); }
  };

  const handleCalculatePriority = async () => {
    const token = getToken(); if (!token) return;
    setCalcError(""); setCalcLoading(true);
    try {
      const res = await incidentApi.calculatePriority(id, token);
      setPriority(res.data);
      setIncident((prev) => prev ? { ...prev, priorityScore: res.data.priorityScore } : prev);
    } catch (err) { setCalcError(err instanceof Error ? err.message : "Calculation failed"); }
    finally { setCalcLoading(false); }
  };

  const handleRecommendResource = async () => {
    const token = getToken(); if (!token) return;
    setRecError(""); setAssignError(""); setAssignSuccess(false); setRecLoading(true);
    try { const res = await incidentApi.recommendResource(id, token); setRecommendation(res.data); }
    catch (err) { setRecError(err instanceof Error ? err.message : "Recommendation failed"); }
    finally { setRecLoading(false); }
  };

  const handleAssignResource = async () => {
    const token = getToken(); if (!token || !recommendation?.selectedResource) return;
    setAssignError(""); setAssignSuccess(false); setAssignLoading(true);
    try {
      await assignmentApi.create({ incidentId: id, resourceId: recommendation.selectedResource.id }, token);
      setAssignSuccess(true);
      const updated = await incidentApi.getById(id, token); setIncident(updated.data);
      const logs = await decisionApi.listByIncident(id, token); setDecisions(logs.data);
    } catch (err) { setAssignError(err instanceof Error ? err.message : "Assignment failed"); }
    finally { setAssignLoading(false); }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
    </div>
  );

  if (error || !incident) return (
    <div className="rounded-xl border px-4 py-3 text-sm"
      style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
      {error || "Incident not found"}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/incidents"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(11,31,51,0.12)" }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "#0B1F33" }} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Incident Detail</h1>
      </div>

      {/* Two-column layout: left=content, right=sticky logs */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px] xl:items-start">

        {/* ── LEFT ── */}
        <div className="space-y-5 min-w-0">

          {/* Main info card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#0B1F33" }}>{incident.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityColor[incident.severity]}`}>{incident.severity}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[incident.status]}`}>{incident.status}</span>
                  {incident.priorityScore !== null ? (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      incident.priorityScore >= 75 ? "bg-red-100 text-red-700" :
                      incident.priorityScore >= 50 ? "bg-orange-100 text-orange-700" :
                      incident.priorityScore >= 25 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                    }`}>Priority: {incident.priorityScore.toFixed(1)}</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-400">Priority: N/A</span>
                  )}
                </div>
              </div>
              {canManage && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {incident.status === "PENDING" && (
                    <button onClick={handleValidate} disabled={validateLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white hover:bg-[#14A89A] disabled:opacity-60"
                      style={{ backgroundColor: "#19C3B1" }}>
                      {validateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />} Validate
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 rounded-xl border px-3 py-2" style={{ borderColor: "rgba(11,31,51,0.15)" }}>
                    {statusLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#6B7280" }} /> : <RefreshCw className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />}
                    <select value={incident.status} onChange={(e) => handleStatusChange(e.target.value as Incident["status"])}
                      disabled={statusLoading} className="text-xs font-semibold bg-transparent outline-none cursor-pointer disabled:opacity-60"
                      style={{ color: "#0B1F33" }}>
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            {(validateError || statusError) && (
              <div className="rounded-xl border px-4 py-2.5 text-sm" style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
                {validateError || statusError}
              </div>
            )}
            <div className="h-px" style={{ backgroundColor: "rgba(11,31,51,0.06)" }} />
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{incident.description}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoItem Icon={AlertTriangle} label="Severity"        value={incident.severity} />
              <InfoItem Icon={Clock}         label="Time Sensitivity" value={incident.timeSensitivity} />
              <InfoItem Icon={Users}         label="Affected People"  value={String(incident.affectedPeople)} />
              <InfoItem Icon={MapPin}        label="Location"         value={`${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`} />
              {incident.environmentalCondition && <InfoItem Icon={AlertTriangle} label="Environment" value={incident.environmentalCondition} />}
            </div>
            {incident.resourceRequirements.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Resource Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {incident.resourceRequirements.map((r) => (
                    <span key={r} className="rounded-xl border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: "rgba(25,195,177,0.3)", color: "#19C3B1", backgroundColor: "rgba(25,195,177,0.06)" }}>
                      {r.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs" style={{ color: "#9CA3AF" }}>Created: {new Date(incident.createdAt).toLocaleString()}</p>
          </div>

          {/* Resource Recommendation */}
          {canManage && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#0B1F33" }}>Resource Recommendation</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Greedy algorithm selects the best available resource</p>
                </div>
                <button onClick={handleRecommendResource} disabled={recLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A3550] disabled:opacity-60"
                  style={{ backgroundColor: "#0B1F33" }}>
                  {recLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Finding…</> : <><Truck className="h-4 w-4" /> Recommend</>}
                </button>
              </div>
              {recError && <div className="rounded-xl border px-4 py-3 text-sm" style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>{recError}</div>}
              {recommendation && (
                <div className="space-y-4">
                  {recommendation.selectedResource ? (
                    <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "rgba(25,195,177,0.25)", backgroundColor: "rgba(25,195,177,0.04)" }}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(25,195,177,0.15)" }}>
                            <Truck className="h-5 w-5" style={{ color: "#19C3B1" }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" style={{ color: "#19C3B1" }} />
                              <p className="font-bold" style={{ color: "#0B1F33" }}>{recommendation.selectedResource.name}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(25,195,177,0.12)", color: "#19C3B1" }}>
                              {recommendation.selectedResource.type.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <button onClick={handleAssignResource} disabled={assignLoading || assignSuccess}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#14A89A] disabled:opacity-60"
                          style={{ backgroundColor: assignSuccess ? "#19C3B1" : "#0B1F33" }}>
                          {assignLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Assigning…</>
                           : assignSuccess ? <><CheckCircle2 className="h-4 w-4" /> Assigned!</>
                           : <><ClipboardList className="h-4 w-4" /> Assign Resource</>}
                        </button>
                      </div>
                      {assignError && <div className="rounded-xl border px-4 py-2.5 text-sm" style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>{assignError}</div>}
                      {assignSuccess && <div className="rounded-xl border px-4 py-2.5 text-sm" style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>Resource assigned successfully.</div>}
                      <div className="grid grid-cols-3 gap-3">
                        <StatBox icon="📍" label="Distance" value={recommendation.estimatedDistanceKm !== null ? `${recommendation.estimatedDistanceKm.toFixed(2)} km` : "N/A"} />
                        <StatBox icon="⏱"  label="ETA"      value={recommendation.estimatedEtaMinutes !== null ? `${recommendation.estimatedEtaMinutes.toFixed(1)} min` : "N/A"} />
                        <StatBox icon="👥" label="Capacity" value={String(recommendation.selectedResource.capacity)} />
                      </div>
                      <ul className="space-y-1.5">
                        {recommendation.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#19C3B1" }} /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: "rgba(230,57,70,0.04)", border: "1px solid rgba(230,57,70,0.15)" }}>
                      <XCircle className="h-5 w-5 shrink-0" style={{ color: "#E63946" }} />
                      <p className="text-sm font-medium" style={{ color: "#E63946" }}>No suitable resource available</p>
                    </div>
                  )}
                  {recommendation.rejectedCandidates.length > 0 && (
                    <div>
                      <button onClick={() => setShowRejected(!showRejected)} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#9CA3AF" }}>
                        {showRejected ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {showRejected ? "Hide" : `Show ${recommendation.rejectedCandidates.length}`} rejected candidates
                      </button>
                      {showRejected && (
                        <div className="mt-3 space-y-2">
                          {recommendation.rejectedCandidates.map((c) => (
                            <div key={c.resourceId} className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                              style={{ backgroundColor: "rgba(11,31,51,0.03)", border: "1px solid rgba(11,31,51,0.07)" }}>
                              <span className="font-medium flex items-center gap-2" style={{ color: "#6B7280" }}>
                                <XCircle className="h-3.5 w-3.5 opacity-40" /> {c.resourceName}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(107,114,128,0.1)", color: "#6B7280" }}>{c.reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Priority Engine */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg" style={{ color: "#0B1F33" }}>Priority Engine</h3>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>AI-calculated priority score</p>
              </div>
              {canManage && (
                <button onClick={handleCalculatePriority} disabled={calcLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#14A89A] disabled:opacity-60"
                  style={{ backgroundColor: "#19C3B1" }}>
                  {calcLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</> : <><Zap className="h-4 w-4" /> Calculate</>}
                </button>
              )}
            </div>
            {calcError && <div className="rounded-xl border px-4 py-3 text-sm" style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>{calcError}</div>}
            {priority ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-2xl p-5" style={{ backgroundColor: "rgba(11,31,51,0.03)", border: "1px solid rgba(11,31,51,0.07)" }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shrink-0"
                    style={{ backgroundColor: priority.priorityScore >= 75 ? "#E63946" : priority.priorityScore >= 50 ? "#F59E0B" : "#19C3B1" }}>
                    {priority.priorityScore.toFixed(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#0B1F33" }}>Score: {priority.priorityScore.toFixed(1)} / 100</p>
                    <p className="text-sm" style={{ color: "#6B7280" }}>
                      {priority.priorityScore >= 75 ? "🔴 Critical" : priority.priorityScore >= 50 ? "🟠 High" : priority.priorityScore >= 25 ? "🟡 Medium" : "🟢 Low"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <FactorBar label="Severity"              weighted={priority.factors.severity.weightedScore}             maxWeight={30} reason={priority.factors.severity.reason} />
                  <FactorBar label="Time Sensitivity"      weighted={priority.factors.timeSensitivity.weightedScore}      maxWeight={25} reason={priority.factors.timeSensitivity.reason} />
                  <FactorBar label="Population Affected"   weighted={priority.factors.affectedPopulation.weightedScore}   maxWeight={20} reason={priority.factors.affectedPopulation.reason} />
                  <FactorBar label="Environmental Risk"    weighted={priority.factors.environmentalRisk.weightedScore}    maxWeight={15} reason={priority.factors.environmentalRisk.reason} />
                  <FactorBar label="Resource Requirements" weighted={priority.factors.resourceRequirements.weightedScore} maxWeight={10} reason={priority.factors.resourceRequirements.reason} />
                </div>
                <ul className="space-y-2">
                  {priority.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#374151" }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} /> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: "rgba(11,31,51,0.03)", border: "1px solid rgba(11,31,51,0.07)" }}>
                <Zap className="h-5 w-5 shrink-0" style={{ color: "#9CA3AF" }} />
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  {canManage ? "Click \"Calculate\" to run the priority engine." : "Priority score not calculated yet."}
                </p>
              </div>
            )}
          </div>

        </div>{/* end LEFT */}

        {/* ── RIGHT — sticky logs (Admin/Coordinator) ── */}
        {canManage && (
          <div className="space-y-5 xl:sticky xl:top-6">

            {/* Decision Log */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(11,31,51,0.05)" }}>
                  <History className="h-4 w-4" style={{ color: "#0B1F33" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#0B1F33" }}>Decision Log</p>
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>Algorithmic audit trail</p>
                </div>
              </div>
              {decLoading ? (
                <div className="flex h-16 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
                </div>
              ) : decisions.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "#9CA3AF" }}>No decision logs yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {decisions.map((log) => <DecisionLogCard key={log.id} log={log} />)}
                </div>
              )}
            </div>

            {/* Re-optimization History */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(249,115,22,0.08)" }}>
                  <GitMerge className="h-4 w-4" style={{ color: "#f97316" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#0B1F33" }}>Re-optimization History</p>
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>Dynamic re-assignment events</p>
                </div>
              </div>
              {reoptLoading ? (
                <div className="flex h-16 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
                </div>
              ) : reoptLogs.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "#9CA3AF" }}>No re-optimizations yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {reoptLogs.map((log) => <ReoptimizationLogCard key={log.id} log={log} />)}
                </div>
              )}
            </div>

          </div>
        )}

      </div>{/* end grid */}
    </div>
  );
}
