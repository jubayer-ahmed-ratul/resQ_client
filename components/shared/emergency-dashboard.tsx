"use client";

import { useState, useEffect } from "react";
import {
  Activity, MapPin, AlertTriangle, Ambulance, Building2,
  Radio, Signal, AlertCircle, ChevronUp, ChevronDown,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────
type Severity = "CRITICAL" | "HIGH" | "MEDIUM";

interface Incident {
  id: string;
  severity: Severity;
  location: string;
  priority: number;
  trend: "up" | "down";
}

interface Resource {
  id: string;
  name: string;
  sub: string;
  status: "available" | "dispatched";
}

// ── static seed data ──────────────────────────────────────────────────────────
const SEED_INCIDENTS: Incident[] = [
  { id: "Flood-102", severity: "CRITICAL", location: "Dhaka, BD",      priority: 92, trend: "up" },
  { id: "Fire-045",  severity: "HIGH",     location: "Chittagong, BD", priority: 78, trend: "down" },
];

const SEED_RESOURCES: Resource[] = [
  { id: "a12", name: "A-12",        sub: "ETA: 8 min",      status: "available" },
  { id: "b07", name: "City Medical", sub: "ICU: Available",  status: "available" },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const SEVERITY_STYLE: Record<Severity, { bg: string; border: string; badgeBg: string; badgeColor: string; iconClass: string }> = {
  CRITICAL: { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.20)",  badgeBg: "rgba(239,68,68,0.25)",  badgeColor: "#FCA5A5", iconClass: "text-red-400" },
  HIGH:     { bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.15)", badgeBg: "rgba(251,191,36,0.20)", badgeColor: "#FCD34D", iconClass: "text-yellow-400" },
  MEDIUM:   { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.15)", badgeBg: "rgba(59,130,246,0.20)", badgeColor: "#93C5FD", iconClass: "text-blue-400" },
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function nudgePriority(p: number): number {
  return clamp(p + (Math.random() > 0.5 ? 1 : -1), 60, 99);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── component ─────────────────────────────────────────────────────────────────
export default function EmergencyDashboard() {
  const [incidents,   setIncidents]   = useState<Incident[]>(SEED_INCIDENTS);
  const [resources,   setResources]   = useState<Resource[]>(SEED_RESOURCES);
  const [syncedAt,    setSyncedAt]    = useState<string>("");
  const [activeCount, setActiveCount] = useState(12);
  const [tick,        setTick]        = useState(0);   // drives pulse flash

  // Clock — updates every second
  useEffect(() => {
    setSyncedAt(formatTime(new Date()));
    const clock = setInterval(() => setSyncedAt(formatTime(new Date())), 1000);
    return () => clearInterval(clock);
  }, []);

  // Simulator — data updates every 2.5 s
  useEffect(() => {
    const sim = setInterval(() => {
      setIncidents(prev =>
        prev.map(inc => {
          const next = nudgePriority(inc.priority);
          return { ...inc, priority: next, trend: next >= inc.priority ? "up" : "down" };
        })
      );
      setResources(prev =>
        prev.map(r =>
          Math.random() < 0.15
            ? { ...r, status: r.status === "available" ? "dispatched" : "available" }
            : r
        )
      );
      setActiveCount(prev => clamp(prev + (Math.random() > 0.5 ? 1 : -1), 8, 18));
      setTick(t => t + 1);
    }, 2500);

    return () => clearInterval(sim);
  }, []);

  return (
    <div className="relative">
      {/* Glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, #19C3B1, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative rounded-2xl border overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#0B1F33", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(11,31,51,0.25)" }}
        role="region"
        aria-label="Live emergency operations monitor"
        aria-live="polite"
      >
        {/* ── Header ── */}
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4" style={{ color: "#19C3B1" }} />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.60)" }}>
                LIVE EMERGENCY MONITOR
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4" style={{ color: "#19C3B1" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.40)" }}>ONLINE</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* System status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" style={{ color: "#19C3B1" }} />
              <span className="text-sm font-medium text-white">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-400">● Operational</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>v2.4.1</span>
            </div>
          </div>

          {/* Incidents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.40)" }}>
                Active Incidents
              </span>
              <span className="text-xs font-semibold transition-all duration-500 text-white">
                {activeCount}
              </span>
            </div>

            <div className="space-y-2">
              {incidents.map(inc => {
                const s = SEVERITY_STYLE[inc.severity];
                const IncIcon = inc.severity === "CRITICAL" ? AlertTriangle : AlertCircle;
                const TrendIcon = inc.trend === "up" ? ChevronUp : ChevronDown;
                const trendColor = inc.trend === "up" ? "#FCA5A5" : "#86EFAC";

                return (
                  <div
                    key={inc.id}
                    className="p-4 rounded-xl transition-all duration-500"
                    style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IncIcon className={`w-5 h-5 mt-0.5 ${s.iconClass}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{inc.id}</span>
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: s.badgeBg, color: s.badgeColor }}
                            >
                              {inc.severity}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.30)" }} />
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{inc.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.30)" }} />
                              <span className="text-xs font-medium text-white transition-all duration-500">
                                {inc.priority}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <TrendIcon className="w-4 h-4 transition-all duration-500" style={{ color: trendColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resources */}
          <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.40)" }}>
                Available Resources
              </span>
              <span className="text-xs font-semibold text-white">28</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {resources.map(({ id, name, sub, status }) => {
                const Icon = id === "a12" ? Ambulance : Building2;
                const isAvailable = status === "available";
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500"
                    style={{ backgroundColor: isAvailable ? "rgba(25,195,177,0.08)" : "rgba(255,255,255,0.04)" }}
                  >
                    <Icon className="w-4 h-4 transition-colors duration-500" style={{ color: isAvailable ? "#19C3B1" : "rgba(255,255,255,0.30)" }} />
                    <div>
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-xs transition-colors duration-500" style={{ color: isAvailable ? "rgba(25,195,177,0.80)" : "rgba(255,255,255,0.40)" }}>
                        {isAvailable ? sub : "Dispatched"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-6">
              {([["Active Incidents", activeCount], ["Available Units", 28]] as const).map(([lbl, val], i) => (
                <div key={lbl} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />}
                  <div>
                    <p className="text-sm font-medium text-white transition-all duration-500">{val}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>{lbl}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div
                key={tick}
                className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"
                style={{ animationDuration: "0.6s", animationIterationCount: 1 }}
              />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 -ml-3" />
              <span className="text-sm font-semibold ml-1 text-white">
                {syncedAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATOR badge */}
      <div
        className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#19C3B1", color: "#FFFFFF", boxShadow: "0 4px 15px rgba(25,195,177,0.40)" }}
      >
        SIMULATOR
      </div>
    </div>
  );
}
