import { CheckCircle2, XCircle } from "lucide-react";

const reasons = [
  "Closest available unit",
  "Suitable medical capability",
  "Fastest estimated response",
  "Hospital capacity available",
];

const rejected = [
  { name: "Ambulance B-07",   reason: "Longer ETA" },
  { name: "Ambulance C-03",   reason: "Currently assigned" },
  { name: "General Hospital", reason: "Limited capacity" },
];

export default function DecisionEngine() {
  return (
    <section
      id="decision-engine"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-labelledby="decision-heading"
    >
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            id="decision-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0B1F33" }}
          >
            Intelligent Decision Engine
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            resq does not only make decisions — it explains them.
          </p>
        </div>

        {/* Main decision card */}
        <div
          className="max-w-4xl mx-auto rounded-2xl border overflow-hidden shadow-lg"
          style={{ borderColor: "rgba(11,31,51,0.12)", backgroundColor: "#FFFFFF" }}
        >
          {/* Card header */}
          <div
            className="px-6 py-4 border-b flex items-center gap-3"
            style={{ borderColor: "rgba(11,31,51,0.1)", backgroundColor: "rgba(11,31,51,0.03)" }}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded"
              style={{ backgroundColor: "#E63946", color: "white" }}
            >
              CRITICAL
            </div>
            <div>
              <span className="text-sm font-bold" style={{ color: "#0B1F33" }}>
                Emergency Incident
              </span>
              <span className="mx-2 text-sm" style={{ color: "#6B7280" }}>·</span>
              <span className="text-sm font-semibold" style={{ color: "#E63946" }}>
                Flood-102
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "#6B7280" }}>Priority</span>
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: "rgba(230,57,70,0.1)", color: "#E63946" }}
              >
                92 / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "rgba(11,31,51,0.1)" }}>
            {/* Left: Selected option */}
            <div className="p-6">
              <div className="space-y-5">
                {/* Selected Resource */}
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    borderColor: "rgba(25,195,177,0.3)",
                    backgroundColor: "rgba(25,195,177,0.06)",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold tracking-wider uppercase mb-2"
                    style={{ color: "#19C3B1" }}
                  >
                    Selected Resource
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold" style={{ color: "#0B1F33" }}>
                        Ambulance A-12
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
                        Status:{" "}
                        <span className="font-medium" style={{ color: "#19C3B1" }}>
                          Available
                        </span>
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
                        Estimated Arrival:{" "}
                        <span className="font-medium" style={{ color: "#243447" }}>
                          8 minutes
                        </span>
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{ backgroundColor: "rgba(25,195,177,0.15)" }}
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#19C3B1" }} />
                    </div>
                  </div>
                </div>

                {/* Selected Hospital */}
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    borderColor: "rgba(25,195,177,0.3)",
                    backgroundColor: "rgba(25,195,177,0.06)",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold tracking-wider uppercase mb-2"
                    style={{ color: "#19C3B1" }}
                  >
                    Selected Hospital
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold" style={{ color: "#0B1F33" }}>
                        City Medical Center
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
                        Capacity:{" "}
                        <span className="font-medium" style={{ color: "#19C3B1" }}>
                          Available
                        </span>
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{ backgroundColor: "rgba(25,195,177,0.15)" }}
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#19C3B1" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Why selected + rejected */}
            <div className="p-6 flex flex-col gap-5">
              {/* Why selected */}
              <div>
                <p
                  className="text-[11px] font-semibold tracking-wider uppercase mb-3"
                  style={{ color: "#0B1F33" }}
                >
                  Why Selected?
                </p>
                <ul className="space-y-2" aria-label="Selection reasons">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "#19C3B1" }}
                        aria-hidden="true"
                      />
                      <span className="text-sm" style={{ color: "#243447" }}>
                        {reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{ backgroundColor: "rgba(11,31,51,0.08)" }}
                aria-hidden="true"
              />

              {/* Rejected alternatives */}
              <div>
                <p
                  className="text-[11px] font-semibold tracking-wider uppercase mb-3"
                  style={{ color: "#6B7280" }}
                >
                  Rejected Alternatives
                </p>
                <ul className="space-y-2" aria-label="Rejected alternatives">
                  {rejected.map(({ name, reason }) => (
                    <li
                      key={name}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ backgroundColor: "rgba(11,31,51,0.03)", border: "1px solid rgba(11,31,51,0.07)" }}
                    >
                      <div className="flex items-center gap-2">
                        <XCircle
                          className="w-3.5 h-3.5 flex-shrink-0 opacity-40"
                          style={{ color: "#6B7280" }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
                          {name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(107,114,128,0.1)", color: "#6B7280" }}
                      >
                        {reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
