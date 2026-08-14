// Static mock emergency command-center visualization — no real map API

import { MapPin, Truck, Building2, Wifi } from "lucide-react";
import { incidents, dashboardStats } from "@/lib/mock-data";

const severityColor: Record<string, string> = {
  Critical: "#E63946",
  High:     "#f97316",
  Medium:   "#eab308",
};

const stats = [
  { label: "Active Incidents",  value: dashboardStats.activeIncidents, color: "#E63946" },
  { label: "Available Units",   value: dashboardStats.availableUnits,  color: "#19C3B1" },
  { label: "Hospitals Ready",   value: dashboardStats.hospitalsReady,  color: "#0B1F33" },
  { label: "Avg Response",      value: `${dashboardStats.avgResponseMin} min`, color: "#6B7280" },
];

// Grid-based mock map elements
const mapRoads = [
  { style: "absolute top-[38%] left-0 right-0 h-px bg-gray-300 opacity-60" },
  { style: "absolute top-[65%] left-0 right-0 h-px bg-gray-300 opacity-40" },
  { style: "absolute left-[30%] top-0 bottom-0 w-px bg-gray-300 opacity-60" },
  { style: "absolute left-[65%] top-0 bottom-0 w-px bg-gray-300 opacity-40" },
];

const mapIncidents = [
  { id: "Flood-102", label: "Flood-102", severity: "Critical", top: "22%", left: "18%"  },
  { id: "Fire-221",  label: "Fire-221",  severity: "High",     top: "55%", left: "52%"  },
  { id: "Med-087",   label: "Med-087",   severity: "Medium",   top: "35%", left: "72%"  },
];

const mapAmbulances = [
  { top: "28%", left: "35%", color: "#19C3B1" },
  { top: "62%", left: "22%", color: "#19C3B1" },
];

const mapHospitals = [
  { top: "15%", left: "60%" },
  { top: "70%", left: "75%" },
];

// Route line SVG path hint between A-12 and Flood-102
const routePoints = "M120 90 Q160 130 180 155";

export default function CommandCenter() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20"
      style={{ backgroundColor: "#0B1F33" }}
    >
      {/* Dashboard header bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-90" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-90" />
          <div className="w-3 h-3 rounded-full bg-green-400 opacity-90" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#19C3B1" }}>
          <Wifi className="w-3 h-3 pulse-dot" />
          <span>LIVE OPERATIONS</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          resq v1.0
        </span>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center py-3 px-2 border-r last:border-r-0"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <span className="text-xl font-bold" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-[10px] text-center leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mock map */}
      <div className="relative overflow-hidden" style={{ height: "200px", backgroundColor: "#0d2744" }}>
        {/* Grid lines */}
        {mapRoads.map((r, i) => (
          <div key={i} className={r.style} />
        ))}

        {/* Route hint SVG */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
          <path d={routePoints} fill="none" stroke="#19C3B1" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>

        {/* Incident markers */}
        {mapIncidents.map((inc) => (
          <div
            key={inc.id}
            className="absolute flex flex-col items-center"
            style={{ top: inc.top, left: inc.left, transform: "translate(-50%,-50%)" }}
            aria-label={`Incident ${inc.label} – ${inc.severity}`}
          >
            <div
              className="w-3 h-3 rounded-full border-2 border-white pulse-ring"
              style={{ backgroundColor: severityColor[inc.severity] }}
            />
            <span
              className="mt-1 text-[9px] font-semibold px-1 py-0.5 rounded whitespace-nowrap"
              style={{ backgroundColor: severityColor[inc.severity], color: "white" }}
            >
              {inc.label}
            </span>
          </div>
        ))}

        {/* Ambulance markers */}
        {mapAmbulances.map((a, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: a.top, left: a.left, transform: "translate(-50%,-50%)" }}
            aria-label="Ambulance unit"
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded"
              style={{ backgroundColor: a.color }}
            >
              <Truck className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
          </div>
        ))}

        {/* Hospital markers */}
        {mapHospitals.map((h, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: h.top, left: h.left, transform: "translate(-50%,-50%)" }}
            aria-label="Hospital"
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded border"
              style={{ backgroundColor: "white", borderColor: "#0B1F33" }}
            >
              <Building2 className="w-3.5 h-3.5" style={{ color: "#0B1F33" }} strokeWidth={2} />
            </div>
          </div>
        ))}

        {/* Map label */}
        <div
          className="absolute bottom-2 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.6)" }}
        >
          OPERATIONS MAP
        </div>
      </div>

      {/* Incident list */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold mb-2 tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          ACTIVE INCIDENTS
        </p>
        <div className="space-y-1.5">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: severityColor[inc.severity] }}
                />
                <div>
                  <p className="text-xs font-semibold text-white">{inc.id}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {inc.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${severityColor[inc.severity]}22`,
                    color: severityColor[inc.severity],
                    border: `1px solid ${severityColor[inc.severity]}44`,
                  }}
                >
                  {inc.severity.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold" style={{ color: "#19C3B1" }}>
                  {inc.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live status panel */}
      <div
        className="mx-4 my-3 rounded-lg px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: "rgba(25,195,177,0.12)", border: "1px solid rgba(25,195,177,0.25)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: "#19C3B1" }} />
          <span className="text-xs font-semibold" style={{ color: "#19C3B1" }}>
            AMBULANCE A-12
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            Available
          </span>
          <span className="text-[10px] font-medium" style={{ color: "#19C3B1" }}>
            ETA: 8 min
          </span>
        </div>
      </div>
    </div>
  );
}
