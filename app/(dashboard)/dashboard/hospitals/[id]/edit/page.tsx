"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { hospitalApi, getToken, type Hospital, type HospitalStatus } from "@/lib/api";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function EditHospitalPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name:             "",
    latitude:         0,
    longitude:        0,
    bedCapacity:      0,
    availableBeds:    0,
    icuCapacity:      0,
    availableICUBeds: 0,
    status:           "OPERATIONAL" as HospitalStatus,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    hospitalApi.getById(id, token)
      .then((res) => {
        const h = res.data;
        setForm({
          name:             h.name,
          latitude:         h.latitude,
          longitude:        h.longitude,
          bedCapacity:      h.bedCapacity,
          availableBeds:    h.availableBeds,
          icuCapacity:      h.icuCapacity,
          availableICUBeds: h.availableICUBeds,
          status:           h.status,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude"
        ? parseFloat(value) || 0
        : name === "status"
        ? value
        : parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    try {
      await hospitalApi.update(id, {
        availableBeds:    form.availableBeds,
        availableICUBeds: form.availableICUBeds,
        status:           form.status,
      }, token);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/hospitals"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update hospital");
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/hospitals"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(11,31,51,0.12)" }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "#0B1F33" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Edit Hospital</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>Update hospital details and capacity</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#19C3B1" }} />
          Hospital updated successfully! Redirecting…
        </div>
      )}

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

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

        <div>
          <label htmlFor="status" className={labelClass} style={labelStyle}>Status</label>
          <select id="status" name="status" value={form.status}
            onChange={handleChange} className={inputClass} style={inputStyle}>
            {["OPERATIONAL", "LIMITED", "CLOSED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className={labelClass} style={labelStyle}>Latitude</label>
            <input id="latitude" name="latitude" type="number" step="any"
              required value={form.latitude} onChange={handleChange}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="longitude" className={labelClass} style={labelStyle}>Longitude</label>
            <input id="longitude" name="longitude" type="number" step="any"
              required value={form.longitude} onChange={handleChange}
              className={inputClass} style={inputStyle} />
          </div>
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
          <button type="submit" disabled={saving || success}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
            style={{ backgroundColor: "#19C3B1" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
