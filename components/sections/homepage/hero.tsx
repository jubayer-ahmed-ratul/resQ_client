"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronRight, Clock, Activity, Shield } from "lucide-react";

// Lazy-load the heavy dashboard simulator — keeps hero bundle small
const EmergencyDashboard = dynamic(
  () => import("@/components/shared/emergency-dashboard"),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

function DashboardSkeleton() {
  return (
    <div
      className="w-full rounded-2xl border animate-pulse"
      style={{ height: 440, backgroundColor: "rgba(11,31,51,0.06)", borderColor: "rgba(11,31,51,0.08)" }}
      aria-hidden="true"
    />
  );
}

const STATS = [
  { Icon: Activity, label: "Events/Second", value: "10K+" },
  { Icon: Clock, label: "Response Time", value: "<500ms" },
  { Icon: Shield, label: "Uptime", value: "99.99%" },
] as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="relative pt-20 pb-12 md:pt-28 md:pb-20 min-h-screen flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      {/* Hero bg: #F5F7FA base + subtle Navy/Teal radial gradients */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: "#F5F7FA" }} aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0B1F33 1px, transparent 1px), radial-gradient(circle at 80% 20%, #0B1F33 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,51,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="hero-orb-1 absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-3xl opacity-[0.12]" style={{ background: "radial-gradient(circle, #0B1F33, transparent 70%)" }} />
        <div className="hero-orb-2 absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full blur-3xl opacity-[0.10]" style={{ background: "radial-gradient(circle, #19C3B1, transparent 70%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 site-container w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div className="hero-fade-up hero-delay-200">
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold leading-tight tracking-tight"
                style={{ color: "#0B1F33" }}
              >
                Smart Response.{" "}
                <span className="block hero-gradient-text bg-gradient-to-r from-[#19C3B1] via-[#14A89A] to-[#0D8C7E] bg-clip-text text-transparent">
                  Faster Rescue.
                </span>
              </h1>
            </div>

            <p
              className="hero-fade-up hero-delay-400 text-lg leading-relaxed max-w-[540px]"
              style={{ color: "rgba(11,31,51,0.70)" }}
            >
              An intelligent emergency response platform that prioritizes critical
              incidents, optimizes resource allocation, and adapts to changing
              disaster conditions.
            </p>

            <div className="hero-fade-up hero-delay-600 flex flex-col sm:flex-row gap-3">
              <Link
                href="#"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white overflow-hidden transition-all hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: "#0B1F33", boxShadow: "0 4px 25px rgba(11,31,51,0.20)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-1.5 px-8 py-3.5 rounded-lg text-sm font-semibold border transition-all hover:bg-gray-50"
                style={{ color: "#0B1F33", borderColor: "rgba(11,31,51,0.20)" }}
              >
                Explore How It Works
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats */}
            <div
              className="hero-fade-up hero-delay-800 grid grid-cols-3 gap-4 pt-6 border-t"
              style={{ borderColor: "rgba(11,31,51,0.08)" }}
            >
              {STATS.map(({ Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1 group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#19C3B1]/10 group-hover:bg-[#19C3B1]/20 transition-colors">
                      <Icon className="w-4 h-4" style={{ color: "#19C3B1" }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#0B1F33" }}>{value}</p>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(11,31,51,0.50)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — lazy dashboard */}
          <div className="hero-fade-up hero-delay-400 w-full max-w-[680px] mx-auto lg:mx-0">
            <EmergencyDashboard />
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, #F5F7FA, transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}
