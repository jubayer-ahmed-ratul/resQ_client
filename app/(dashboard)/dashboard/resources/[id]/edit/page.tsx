"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi, getToken, type Resource, type ResourceStatus } from "@/lib/api";
import { canEditResource, isAdmin, getStoredUser, type AuthUser } from "@/lib/auth";
import { ArrowLeft, CheckCircle2, MapPin, Lock, UserPlus, UserMinus, Loader2 } from "lucide-react";
import LocationPicker, { MapPanel } from "@/components/shared/location-picker";

export default function EditResourcePage() {
  const { id } = useParams<{ id: string }>();
  const router      = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser]         = useState<AuthUser | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  // Operator assignment (Admin only)
  const [operatorId, setOperatorId]       = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError]     = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const [form, setForm] = useState({
    name:      "",
    type:      "AMBULANCE" as Resource["type"],
    status:    "AVAILABLE" as ResourceStatus,
    latitude:  0,
    longitude: 0,
    capacity:  1,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    const stored = getStoredUser();
    if (!stored) { router.replace("/login"); return; }
    setUser(stored);

    // CITIZEN and COORDINATOR cannot edit resources directly
    if (!canEditResource(stored.role)) {
      router.replace("/dashboard/resources");
      return;
    }

    resourceApi.getById(id, token)
      .then((res) => {
        const r = res.data;
        setForm({ name: r.name, type: r.type, status: r.status, latitude: r.latitude, longitude: r.longitude, capacity: r.capacity });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" || name === "capacity"
        ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    updateMutation.mutate(form);
  };

  // ── useMutation for update ──────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (body: typeof form) => resourceApi.update(id, body, getToken()!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/resources"), 1500);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to update resource"),
  });

  const handleAssignOperator = async () => {
    if (!operatorId.trim()) return;
    const token = getToken();
    if (!token) return;
    setAssignError(""); setAssignSuccess(""); setAssignLoading(true);
    try {
      await resourceApi.assignOperator(id, operatorId.trim(), token);
      setAssignSuccess("Operator assigned successfully!");
      setOperatorId("");
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign operator");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveOperator = async () => {
    const token = getToken();
    if (!token) return;
    setAssignError(""); setAssignSuccess(""); setAssignLoading(true);
    try {
      await resourceApi.removeOperator(id, token);
      setAssignSuccess("Operator removed successfully!");
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to remove operator");
    } finally {
      setAssignLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20";
  const inputStyle = { borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" };
  const labelClass = "mb-1.5 block text-sm font-medium";
  const labelStyle = { color: "#374151" };

  if (loading) return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
    </div>
  );

  const adminOnly = user && isAdmin(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/resources"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(11,31,51,0.12)" }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "#0B1F33" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Edit Resource</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>Update resource details</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          Resource updated successfully! Redirecting…
        </div>
      )}
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

      {/* Operator restriction notice */}
      {user?.role === "OPERATOR" && (
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.2)", color: "#0B1F33" }}
        >
          <Lock className="h-4 w-4 shrink-0" style={{ color: "#F97316" }} />
          As an Operator, you can only update the status and location of your assigned resource.
          The server will reject changes to resources not assigned to you.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left — form */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-6 space-y-5"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>

          <div>
            <label htmlFor="name" className={labelClass} style={labelStyle}>Resource Name</label>
            <input id="name" name="name" required value={form.name}
              onChange={handleChange} placeholder="e.g. Ambulance A-12"
              disabled={!adminOnly}
              className={inputClass} style={inputStyle} />
            {!adminOnly && (
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>Only Admin can change the resource name.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className={labelClass} style={labelStyle}>Type</label>
              <select id="type" name="type" value={form.type}
                onChange={handleChange} disabled={!adminOnly}
                className={inputClass} style={inputStyle}>
                {["AMBULANCE", "RESCUE_TEAM", "HELICOPTER", "OTHER"].map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className={labelClass} style={labelStyle}>Status</label>
              <select id="status" name="status" value={form.status}
                onChange={handleChange} className={inputClass} style={inputStyle}>
                {["AVAILABLE", "BUSY", "UNAVAILABLE", "MAINTENANCE", "FAILED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="capacity" className={labelClass} style={labelStyle}>
              {form.type === "RESCUE_TEAM" ? "Team Size" : "Capacity"}
            </label>
            <input id="capacity" name="capacity" type="number" min={1}
              value={form.capacity} onChange={handleChange}
              disabled={!adminOnly}
              placeholder={form.type === "RESCUE_TEAM" ? "e.g. 10 members" : "e.g. 5"}
              className={inputClass} style={inputStyle} />
            {!adminOnly && (
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>Only Admin can change capacity.</p>
            )}
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Location</label>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/resources"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}>
              Cancel
            </Link>
            <button type="submit" disabled={updateMutation.isPending || success}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
              style={{ backgroundColor: "#19C3B1" }}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Right — sticky map */}
        <div className="lg:sticky lg:top-6 rounded-2xl border bg-white p-4"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" style={{ color: "#19C3B1" }} />
            <span className="text-sm font-semibold" style={{ color: "#0B1F33" }}>
              Pick Location on Map
            </span>
          </div>
          <MapPanel
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
          />
        </div>
      </div>

      {/* ── Admin-only: Operator assignment ── */}
      {adminOnly && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#0B1F33" }}>Operator Assignment</h2>
            <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>
              Assign or remove the Operator responsible for this resource.
            </p>
          </div>

          {assignError && (
            <div className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
              {assignError}
            </div>
          )}
          {assignSuccess && (
            <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm"
              style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
              {assignSuccess}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="Operator User ID"
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20"
              style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}
            />
            <button
              type="button"
              onClick={handleAssignOperator}
              disabled={assignLoading || !operatorId.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-50"
              style={{ backgroundColor: "#19C3B1" }}
            >
              {assignLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserPlus className="h-4 w-4" />
              }
              Assign
            </button>
            <button
              type="button"
              onClick={handleRemoveOperator}
              disabled={assignLoading}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 disabled:opacity-50"
              style={{ borderColor: "rgba(230,57,70,0.3)", color: "#E63946" }}
            >
              {assignLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserMinus className="h-4 w-4" />
              }
              Remove
            </button>
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Paste the Operator&apos;s User ID from the Users page to assign them.
          </p>
        </div>
      )}
    </div>
  );
}
