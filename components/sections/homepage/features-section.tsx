import {
  Brain,
  Truck,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Network,
} from "lucide-react";
import FeatureCard from "@/components/shared/feature-card";

const features = [
  {
    Icon:        Brain,
    iconBg:      "rgba(11,31,51,0.08)",
    iconColor:   "#0B1F33",
    title:       "Intelligent Incident Prioritization",
    description: "Automatically evaluate incident severity and urgency to determine response priority.",
  },
  {
    Icon:        Truck,
    iconBg:      "rgba(25,195,177,0.1)",
    iconColor:   "#19C3B1",
    title:       "Smart Resource Allocation",
    description: "Match incidents with suitable available resources based on capability, distance, and response time.",
  },
  {
    Icon:        HelpCircle,
    iconBg:      "rgba(11,31,51,0.08)",
    iconColor:   "#0B1F33",
    title:       "Explainable Decisions",
    description: "Understand why a specific resource or hospital was selected for each assignment.",
  },
  {
    Icon:        RefreshCw,
    iconBg:      "rgba(25,195,177,0.1)",
    iconColor:   "#19C3B1",
    title:       "Dynamic Re-optimization",
    description: "Adapt assignments when roads, resources, or incident conditions change.",
  },
  {
    Icon:        ShieldCheck,
    iconBg:      "rgba(230,57,70,0.08)",
    iconColor:   "#E63946",
    title:       "Resource Conflict Prevention",
    description: "Prevent conflicting assignments and avoid sending the same resource to multiple incidents.",
  },
  {
    Icon:        Network,
    iconBg:      "rgba(11,31,51,0.08)",
    iconColor:   "#0B1F33",
    title:       "Scalable Event-Driven Architecture",
    description: "Designed for high-volume emergency workflows using scalable and event-driven architecture.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#F5F7FA" }}
      aria-labelledby="features-heading"
    >
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0B1F33" }}
          >
            Built to Make Better Decisions
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#6B7280" }}
          >
            Intelligent coordination for complex emergency response operations.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
