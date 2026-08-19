"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hospitalApi, getToken, type CreateHospitalBody } from "@/lib/api";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import LocationPicker, { MapPanel } from "@/components/shared/location-picker";

export default function NewHospitalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateHospitalBody>({
    name: "",
    latitude: 0,
    longitude: 0,
    bedCapacity: 0,
    availableBeds: 0,
    icuCapacity: 0,
    availableICUBeds: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude"
        ? parseFloat(value) || 0
        : parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    try {
      await hospitalApi.create(form, token);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/hospitals"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add hospital");
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
        <Link href="/dashboard/hospitals"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(11,31,51,0.12)" }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "#0B1F33" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Add Hospital</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>Register a new hospital</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          Hospital added successfully! Redirecting…
        </div>
      )}
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left — form */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-6 space-y-5"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}>

          <div>
            <label htmlFor="name" className={labelClass} style={labelStyle}>Hospital Name</label>
            <input id="name" name="name" required value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dhaka Medical College Hospital"
              className={inputClass} style={inputStyle} />
          </div>

          {/* Location — manual inputs */}
          <div>
            <label className={labelClass} style={labelStyle}>Location</label>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedCapacity" className={labelClass} style={labelStyle}>Bed Capacity</label>
              <input id="bedCapacity" name="bedCapacity" type="number" min={0}
                required value={form.bedCapacity} onChange={handleChange}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="availableBeds" className={labelClass} style={labelStyle}>Available Beds</label>
              <input id="availableBeds" name="availableBeds" type="number" min={0}
                required value={form.availableBeds} onChange={handleChange}
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="icuCapacity" className={labelClass} style={labelStyle}>ICU Capacity</label>
              <input id="icuCapacity" name="icuCapacity" type="number" min={0}
                required value={form.icuCapacity} onChange={handleChange}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="availableICUBeds" className={labelClass} style={labelStyle}>Available ICU Beds</label>
              <input id="availableICUBeds" name="availableICUBeds" type="number" min={0}
                required value={form.availableICUBeds} onChange={handleChange}
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/hospitals"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading || success}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
              style={{ backgroundColor: "#19C3B1" }}>
              {loading ? "Adding…" : "Add Hospital"}
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
    </div>
  );
}
