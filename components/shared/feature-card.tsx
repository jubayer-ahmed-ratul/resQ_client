import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon:        LucideIcon;
  title:       string;
  description: string;
  iconBg?:     string;
  iconColor?:  string;
}

export default function FeatureCard({
  Icon,
  title,
  description,
  iconBg    = "rgba(11,31,51,0.07)",
  iconColor = "#0B1F33",
}: FeatureCardProps) {
  return (
    <article
      className="flex flex-col gap-4 bg-white rounded-xl p-6 border h-full transition-shadow hover:shadow-md"
      style={{ borderColor: "rgba(11,31,51,0.1)" }}
    >
      <div
        className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
        style={{ backgroundColor: iconBg }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.75} />
      </div>
      <div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: "#243447" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
          {description}
        </p>
      </div>
    </article>
  );
}
