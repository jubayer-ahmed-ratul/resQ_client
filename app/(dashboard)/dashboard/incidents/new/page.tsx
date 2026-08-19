"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { incidentApi, getToken, type CreateIncidentBody } from "@/lib/api";
import { canCreateIncident, getStoredUser } from "@/lib/auth";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import LocationPicker, { MapPanel } from "@/components/shared/location-picker";

const RESOURCE_OPTIONS = [
  "AMBULANCE", "RESCUE_TEAM", "HELICOPTER",
  "MEDICAL_SUPPORT", "FIRE_TRUCK", "POLICE",
];

export default function NewIncidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  // Guard: only ADMIN, COORDINATOR, CITIZEN can create incidents
  useEffect(() => {
    const user = getStoredUser();
    if (user && !canCreateIncident(user.role)) {
      router.replace("/dashboard/incidents");
    }
  }, [router]);

  const [form, setForm] = useState<CreateIncidentBody>({
    title: "",
    description: "",
    severity: "MEDIUM",
    affectedPeople: 1,
    latitude: 0,
    longitude: 0,
    timeSensitivity: "MEDIUM",
    environmentalCondition: "",
    resourceRequirements: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "affectedPeople" || name === "latitude" || name === "longitude"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const toggleResource = (res: string) => {
    setForm((prev) => ({
      ...prev,
      resourceRequirements: prev.resourceRequirements.includes(res)
        ? prev.resourceRequirements.filter((r) => r !== res)
        : [...prev.resourceRequirements, res],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    try {
      await incidentApi.create(form, token);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/incidents"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create incident");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20";
  const inputStyle = { borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" };
  const labelClass = "mb-1.5 block text-sm font-medium";
  const labelStyle = { color: "#374151" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/incidents"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(11,31,51,0.12)" }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "#0B1F33" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>
            Report Incident
          </h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Submit a new emergency incident
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          Incident reported successfully! Redirecting…
        </div>
      )}
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left — form */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-6 space-y-5"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>

          <div>
            <label htmlFor="title" className={labelClass} style={labelStyle}>Title</label>
            <input id="title" name="title" required minLength={3} value={form.title}
              onChange={handleChange} placeholder="Brief description of the emergency"
              className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label htmlFor="description" className={labelClass} style={labelStyle}>Description</label>
            <textarea id="description" name="description" required rows={3} minLength={10}
              value={form.description} onChange={handleChange}
              placeholder="Detailed description of the incident..."
              className={inputClass} style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="severity" className={labelClass} style={labelStyle}>Severity</label>
              <select id="severity" name="severity" value={form.severity}
                onChange={handleChange} className={inputClass} style={inputStyle}>
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="timeSensitivity" className={labelClass} style={labelStyle}>Time Sensitivity</label>
              <select id="timeSensitivity" name="timeSensitivity" value={form.timeSensitivity}
                onChange={handleChange} className={inputClass} style={inputStyle}>
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="affectedPeople" className={labelClass} style={labelStyle}>
              Affected People
            </label>
            <input id="affectedPeople" name="affectedPeople" type="number" min={0}
              required value={form.affectedPeople} onChange={handleChange}
              className={inputClass} style={inputStyle} />
          </div>

          {/* Location — manual inputs */}
          <div>
            <label className={labelClass} style={labelStyle}>Location</label>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
            />
          </div>

          <div>
            <label htmlFor="environmentalCondition" className={labelClass} style={labelStyle}>
              Environmental Condition
            </label>
            <input id="environmentalCondition" name="environmentalCondition"
              value={form.environmentalCondition} onChange={handleChange}
              placeholder="e.g. Heavy rain, Road blockage..."
              className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Resource Requirements</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_OPTIONS.map((res) => {
                const selected = form.resourceRequirements.includes(res);
                return (
                  <button key={res} type="button" onClick={() => toggleResource(res)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selected
                        ? "border-[#19C3B1] bg-[#19C3B1]/10 text-[#19C3B1]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}>
                    {res.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/incidents"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading || success}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
              style={{ backgroundColor: "#19C3B1" }}>
              {loading ? "Submitting…" : "Submit Incident"}
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
            onChange={(lat, lng) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
          />
        </div>
      </div>
    </div>
  );
}
