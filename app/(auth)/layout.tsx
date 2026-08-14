import Link from "next/link";
import Image from "next/image";
import { Shield, Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left: Image Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden"
        style={{ backgroundColor: "#0B1F33" }}
      >
        {/* Background image — replace src when ready */}
        <div className="absolute inset-0">
          <Image
            src="/auth-bg.jpg"
            alt="Emergency response illustration"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,31,51,0.85) 0%, rgba(25,195,177,0.15) 100%)",
          }}
        />

        {/* Logo — top left */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="relative">
                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                <Zap
                  className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5"
                  style={{ color: "#19C3B1" }}
                  strokeWidth={2.5}
                />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              resq<span style={{ color: "#19C3B1" }}>Buddy</span>
            </span>
          </Link>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-xl font-semibold leading-snug text-white">
              "Every second counts in an emergency. resqBuddy makes sure none
              are wasted."
            </p>
            <footer
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Smart Response. Faster Rescue.
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div
        className="flex w-full lg:w-1/2 flex-col"
        style={{ backgroundColor: "#F5F7FA" }}
      >
        {/* Mobile logo — only visible on small screens */}
        <header className="flex lg:hidden items-center px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ backgroundColor: "#0B1F33" }}
            >
              <div className="relative">
                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                <Zap
                  className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5"
                  style={{ color: "#19C3B1" }}
                  strokeWidth={2.5}
                />
              </div>
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#0B1F33" }}
            >
              resq<span style={{ color: "#19C3B1" }}>Buddy</span>
            </span>
          </Link>
        </header>

        {/* Form — vertically centered */}
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          {children}
        </main>

        <footer className="py-5 text-center">
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            © 2026 resqBuddy. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
