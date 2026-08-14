import { ArrowDown } from "lucide-react";

const layers = [
  {
    title:    "API Gateway",
    label:    "Request Routing",
    sublabel: "Single entry point for all incoming requests",
    accent:   "#19C3B1",
  },
  {
    title:    "Load Balancer",
    label:    "Horizontal Scaling",
    sublabel: "Distributes traffic across backend instances",
    accent:   "#19C3B1",
  },
  {
    title:    "Backend Instances",
    label:    "Event Processing",
    sublabel: "Stateless workers process emergency requests in parallel",
    accent:   "#19C3B1",
  },
  {
    title:    "Event Queue",
    label:    "Async Messaging",
    sublabel: "Decouples components for reliability and throughput",
    accent:   "#19C3B1",
  },
  {
    title:    "Decision Engine",
    label:    "Intelligent Decisions",
    sublabel: "Prioritizes incidents and optimizes resource allocation",
    accent:   "#19C3B1",
  },
];

const scalabilityPoints = [
  "Horizontal scaling across stateless backend workers",
  "Event-driven architecture decouples components",
  "Designed for burst traffic in large-scale emergencies",
  "Fault-tolerant queue prevents request loss",
];

export default function Architecture() {
  return (
    <section
      id="architecture"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#0B1F33" }}
      aria-labelledby="arch-heading"
    >
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            id="arch-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white"
          >
            Built for Large-Scale Emergencies
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Designed to handle high-volume emergency requests through horizontal
            scaling, load balancing, and event-driven processing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: architecture flow */}
          <div className="flex flex-col items-center gap-0 max-w-md mx-auto w-full">
            {layers.map(({ title, label, sublabel }, idx) => (
              <div key={title} className="flex flex-col items-center w-full">
                {/* Layer card */}
                <div
                  className="w-full rounded-xl px-5 py-4 border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(25,195,177,0.2)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <span
                      className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(25,195,177,0.15)",
                        color: "#19C3B1",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {sublabel}
                  </p>
                </div>

                {/* Arrow */}
                {idx < layers.length - 1 && (
                  <div
                    className="py-1.5 flow-line"
                    aria-hidden="true"
                  >
                    <ArrowDown
                      className="w-4 h-4"
                      style={{ color: "rgba(25,195,177,0.5)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>
            ))}

            <p
              className="text-xs text-center mt-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Conceptual architecture — for visualization purposes
            </p>
          </div>

          {/* Right: scalability points */}
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-white mb-6">
              Scalability Design Principles
            </h3>
            <ul className="space-y-5">
              {scalabilityPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5"
                    style={{ backgroundColor: "rgba(25,195,177,0.12)", border: "1px solid rgba(25,195,177,0.2)" }}
                    aria-hidden="true"
                  >
                    <span className="text-xs font-bold" style={{ color: "#19C3B1" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed pt-1"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {point}
                  </p>
                </li>
              ))}
            </ul>

            {/* Conceptual note */}
            <div
              className="mt-8 rounded-xl px-5 py-4 border"
              style={{
                backgroundColor: "rgba(25,195,177,0.07)",
                borderColor: "rgba(25,195,177,0.2)",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                This architecture is a conceptual representation designed to
                illustrate how resq can scale for large emergency operations.
                Backend implementation is developed separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
