"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resourceApi, getToken, type Resource } from "@/lib/api";
import { Truck, MapPin, Users, Plus, Pencil } from "lucide-react";
import Link from "next/link";

const typeColor: Record<Resource["type"], string> = {
  AMBULANCE:    "bg-blue-100 text-blue-700",
  RESCUE_TEAM:  "bg-orange-100 text-orange-700",
  HELICOPTER:   "bg-purple-100 text-purple-700",
  OTHER:        "bg-slate-100 text-slate-600",
};

const statusColor: Record<Resource["status"], string> = {
  AVAILABLE:   "bg-emerald-100 text-emerald-700",
  BUSY:        "bg-yellow-100 text-yellow-700",
  UNAVAILABLE: "bg-red-100 text-red-600",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  FAILED:      "bg-red-200 text-red-800",
};

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    const params: Record<string, string> = {};
    if (typeFilter)   params.type   = typeFilter;
    if (statusFilter) params.status = statusFilter;

    setLoading(true);
    resourceApi.list(token, params)
      .then((res) => setResources(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
            Resources
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Manage emergency response resources
          </p>
        </div>
        <Link
          href="/dashboard/resources/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
          style={{ backgroundColor: "#19C3B1" }}
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
          <option value="">All Types</option>
          {["AMBULANCE","RESCUE_TEAM","HELICOPTER","OTHER"].map(t => (
            <option key={t} value={t}>{t.replace("_"," ")}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
          <option value="">All Status</option>
          {["AVAILABLE","ASSIGNED","UNAVAILABLE"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}>
          <Truck className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((res) => (
            <div key={res.id}
              className="rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "rgba(11,31,51,0.08)" }}>
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  res.type === "AMBULANCE"   ? "bg-blue-100" :
                  res.type === "HELICOPTER"  ? "bg-purple-100" :
                  res.type === "RESCUE_TEAM" ? "bg-orange-100" : "bg-slate-100"
                }`}>
                  {res.type === "HELICOPTER"
                    ? <Plus className="h-5 w-5 text-purple-600" />
                    : res.type === "RESCUE_TEAM"
                    ? <Users className="h-5 w-5 text-orange-600" />
                    : <Truck className={`h-5 w-5 ${res.type === "AMBULANCE" ? "text-blue-600" : "text-slate-600"}`} />
                  }
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor[res.status]}`}>
                  {res.status}
                </span>
              </div>

              {/* Info */}
              <p className="font-semibold" style={{ color: "#0B1F33" }}>{res.name}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeColor[res.type]}`}>
                {res.type.replace("_", " ")}
              </span>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
                  <Users className="h-3.5 w-3.5" />
                  {res.type === "RESCUE_TEAM" ? "Team Size" : "Capacity"}: {res.capacity}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
                  <MapPin className="h-3.5 w-3.5" />
                  {res.latitude.toFixed(4)}, {res.longitude.toFixed(4)}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/dashboard/resources/${res.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}
                >
                  <Pencil className="h-3 w-3" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
