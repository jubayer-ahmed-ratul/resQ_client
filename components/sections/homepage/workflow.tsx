import {
  PhoneIncoming,
  ScanSearch,
  GitMerge,
  Send,
  RefreshCw,
} from "lucide-react";

const steps = [
  {
    number: "01",
    Icon:   PhoneIncoming,
    title:  "Emergency Request",
    desc:   "Emergency incident enters the system.",
  },
  {
    number: "02",
    Icon:   ScanSearch,
    title:  "Priority Analysis",
    desc:   "Severity, urgency, and incident context are analyzed.",
  },
  {
    number: "03",
    Icon:   GitMerge,
    title:  "Resource Matching",
    desc:   "Available emergency resources are evaluated and matched.",
  },
  {
    number: "04",
    Icon:   Send,
    title:  "Dispatch",
    desc:   "The selected resource and hospital receive the assignment.",
  },
  {
    number: "05",
    Icon:   RefreshCw,
    title:  "Dynamic Re-optimization",
    desc:   "If conditions change, assignments are recalculated.",
  },
];

export default function Workflow() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#EEF3F7" }}
      aria-labelledby="workflow-heading"
    >
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            id="workflow-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0B1F33" }}
          >
            From Emergency to Action
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            resq turns incoming emergency requests into optimized response
            decisions.
          </p>
        </div>

        {/* Steps – horizontal on md+, vertical on mobile */}
        <div className="relative">
          {/* Connecting line – desktop only */}
          <div
            className="hidden md:block absolute top-[2.6rem] left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, rgba(11,31,51,0.15) 10%, rgba(11,31,51,0.15) 90%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative">
            {steps.map(({ number, Icon, title, desc }, idx) => (
              <li
                key={number}
                className="flex flex-col items-center text-center relative"
              >
                {/* Vertical connector line – mobile only */}
                {idx < steps.length - 1 && (
                  <div
                    className="md:hidden absolute left-1/2 top-full w-px h-8 mt-px -translate-x-1/2"
                    style={{ backgroundColor: "rgba(11,31,51,0.15)" }}
                    aria-hidden="true"
                  />
                )}

                {/* Icon circle */}
                <div className="relative flex items-center justify-center mb-4 z-10">
                  <div
                    className="flex items-center justify-center w-[5.5rem] h-[5.5rem] rounded-full border-2 bg-white"
                    style={{ borderColor: "rgba(11,31,51,0.12)" }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: "#0B1F33" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  {/* Step number badge */}
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: "#19C3B1" }}
                  >
                    {number}
                  </span>
                </div>

                <h3
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#243447" }}
                >
                  {title}
                </h3>
                <p
                  className="text-xs leading-relaxed max-w-[150px]"
                  style={{ color: "#6B7280" }}
                >
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
