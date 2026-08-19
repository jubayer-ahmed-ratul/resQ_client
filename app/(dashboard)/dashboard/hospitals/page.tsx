"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hospitalApi, getToken, type Hospital } from "@/lib/api";
import {
  canCreateHospital,
  canViewAllHospitals,
  canEditHospital,
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";
import { HospitalCardSkeleton } from "@/components/ui/TableSkeleton";
import { Building2, Bed, MapPin, ActivitySquare, Plus, Pencil, Lock } from "lucide-react";
import Link from "next/link";

const statusColor: Record<Hospital["status"], string> = {
  OPERATIONAL: "bg-emerald-100 text-emerald-700",
  LIMITED:     "bg-yellow-100 text-yellow-700",
  CLOSED:      "bg-red-100 text-red-600",
};

function CapacityBar({ used, total, label }: { used: number; total: number; label: string }) {
  const pct   = total > 0 ? Math.round(((total - used) / total) * 100) : 0;
  const color = pct > 50 ? "#19C3B1" : pct > 20 ? "#F59E0B" : "#E63946";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs" style={{ color: "#6B7280" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "#0B1F33" }}>
          {used}/{total} available
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function HospitalsPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser]                 = useState<AuthUser | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  // Auth guard
  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token || !stored) { router.replace("/login"); return; }
    if (stored.role === "CITIZEN") { router.replace("/dashboard"); return; }
    setUser(stored);
  }, [router]);

  const token = getToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["hospitals", statusFilter],
    queryFn:  () =>
      hospitalApi.list(token!, statusFilter ? { status: statusFilter } : undefined)
        .then((r) => r.data.data),
    enabled: !!token && !!user,
  });

  const hospitals = data ?? [];

  if (!user) return null;

  const isOperator = user.role === "OPERATOR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Hospitals</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            {isOperator
              ? "View hospitals — update only your assigned hospital"
              : "Monitor hospital capacity and availability"}
          </p>
        </div>
        {canCreateHospital(user.role) && (
          <Link
            href="/dashboard/hospitals/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
            style={{ backgroundColor: "#19C3B1" }}
          >
            <Plus className="h-4 w-4" /> Add Hospital
          </Link>
        )}
      </div>

      {/* Operator notice */}
      {isOperator && (
        <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.2)", color: "#0B1F33" }}>
          <Lock className="h-4 w-4 shrink-0" style={{ color: "#F97316" }} />
          You can only update hospitals assigned to you. Editing others will be blocked by the server.
        </div>
      )}

      {/* Status filter */}
      {canViewAllHospitals(user.role) && (
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
          >
            <option value="">All Status</option>
            {["OPERATIONAL", "LIMITED", "CLOSED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <HospitalCardSkeleton count={4} />
      ) : isError ? (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error instanceof Error ? error.message : "Data load করা যায়নি। Refresh করো।"}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}>
          <Building2 className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No hospitals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "rgba(11,31,51,0.08)" }}
              // Prefetch detail on hover
              onMouseEnter={() =>
                queryClient.prefetchQuery({
                  queryKey: ["hospital", h.id],
                  queryFn:  () => hospitalApi.getById(h.id, token!).then((r) => r.data),
                  staleTime: 5 * 60 * 1000,
                })
              }
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold leading-snug" style={{ color: "#0B1F33" }}>{h.name}</p>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                      <MapPin className="h-3 w-3" />
                      {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor[h.status]}`}>
                  {h.status}
                </span>
              </div>

              <div className="space-y-3">
                <CapacityBar used={h.availableBeds}    total={h.bedCapacity} label="Beds" />
                <CapacityBar used={h.availableICUBeds} total={h.icuCapacity} label="ICU"  />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
                    <Bed className="h-3.5 w-3.5" /> {h.availableBeds} beds free
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
                    <ActivitySquare className="h-3.5 w-3.5" /> {h.availableICUBeds} ICU free
                  </div>
                </div>
                {canEditHospital(user.role) && (
                  <Link
                    href={`/dashboard/hospitals/${h.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50"
                    style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
