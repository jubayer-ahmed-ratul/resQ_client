import Link from "next/link";
import { Shield, Zap } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features",     href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Contact",       href: "#" },
    { label: "GitHub",        href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ backgroundColor: "#0B1F33", borderColor: "rgba(255,255,255,0.08)" }}
      aria-label="Site footer"
    >
      <div className="site-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="#home"
              className="inline-flex items-center gap-2.5 mb-4"
            aria-label="resqBuddy home"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
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
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Intelligent emergency response and resource optimization.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3
                className="text-xs font-semibold tracking-wider uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {group}
              </h3>
              <ul className="space-y-2.5" role="list">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © 2026 resqBuddy. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Smart Response. Faster Rescue.
          </p>
        </div>
      </div>
    </footer>
  );
}
