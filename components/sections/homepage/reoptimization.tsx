import { Truck, AlertOctagon, RefreshCw, CheckCircle2, ArrowDown } from "lucide-react";

const flowSteps = [
  {
    step:    "Current Assignment",
    detail:  "Ambulance A-12 — ETA: 8 min",
    Icon:    Truck,
    iconBg:  "rgba(25,195,177,0.1)",
    iconColor: "#19C3B1",
    badge:   null,
    badgeBg: null,
    badgeText: null,
  },
  {
    step:    "Event Detected",
    detail:  "Road Block Detected",
    Icon:    AlertOctagon,
    iconBg:  "rgba(230,57,70,0.1)",
    iconColor: "#E63946",
    badge:   "ALERT",
    badgeBg: "#E63946",
    badgeText: "white",
  },
  {
    step:    "Recalculation",
    detail:  "A-12 route becomes unavailable",
    Icon:    RefreshCw,
    iconBg:  "rgba(11,31,51,0.08)",
    iconColor: "#0B1F33",
    badge:   null,
    badgeBg: null,
    badgeText: null,
  },
  {
    step:    "Alternative Resource",
    detail:  "Ambulance B-07 — ETA: 10 min",
    Icon:    Truck,
    iconBg:  "rgba(11,31,51,0.08)",
    iconColor: "#0B1F33",
    badge:   null,
    badgeBg: null,
    badgeText: null,
  },
  {
    step:    "Updated Dispatch",
    detail:  "Assignment updated automatically",
    Icon:    CheckCircle2,
    iconBg:  "rgba(25,195,177,0.1)",
    iconColor: "#19C3B1",
    badge:   "RESOLVED",
    badgeBg: "#19C3B1",
    badgeText: "white",
  },
];

export default function Reoptimization() {
  return (
    <section
      id="reoptimization"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#F0F7F6" }}
      aria-labelledby="reopt-heading"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: copy */}
          <div>
            <h2
              id="reopt-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
              style={{ color: "#0B1F33" }}
            >
              When Conditions Change,{" "}
              <span style={{ color: "#19C3B1" }}>resq Adapts</span>
            </h2>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: "#6B7280" }}
            >
              Emergency conditions are dynamic. resq continuously
              reevaluates assignments when new information arrives — ensuring
              resources always take the fastest viable route to those who need
              them most.
            </p>

            {/* Highlights */}
            <ul className="space-y-4">
              {[
                "Real-time condition monitoring",
                "Automatic assignment recalculation",
                "Minimal disruption to ongoing operations",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#19C3B1" }}
                    aria-hidden="true"
                  />
                  <span className="text-sm" style={{ color: "#243447" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: flow visual */}
          <div className="flex flex-col items-center gap-0 max-w-sm mx-auto w-full">
            {flowSteps.map(
              ({ step, detail, Icon, iconBg, iconColor, badge, badgeBg, badgeText }, idx) => (
                <div key={step} className="flex flex-col items-center w-full">
                  {/* Step card */}
                  <div
                    className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 border"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor:
                        idx === 1
                          ? "rgba(230,57,70,0.3)"
                          : idx === flowSteps.length - 1
                          ? "rgba(25,195,177,0.3)"
                          : "rgba(11,31,51,0.1)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: iconBg }}
                      aria-hidden="true"
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: "1.125rem", height: "1.125rem" }} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#0B1F33" }}
                      >
                        {step}
                      </p>
                      <p
                        className="text-xs leading-snug mt-0.5"
                        style={{ color: "#6B7280" }}
                      >
                        {detail}
                      </p>
                    </div>
                    {badge && (
                      <span
                        className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: badgeBg!, color: badgeText! }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Arrow between steps */}
                  {idx < flowSteps.length - 1 && (
                    <div
                      className="flex items-center justify-center py-1 flow-line"
                      aria-hidden="true"
                    >
                      <ArrowDown
                        className="w-4 h-4"
                        style={{ color: "rgba(11,31,51,0.25)" }}
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
