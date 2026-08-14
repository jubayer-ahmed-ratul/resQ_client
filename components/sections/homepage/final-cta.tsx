import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section
      id="cta"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          style={{ color: "#0B1F33" }}
        >
          Ready to make emergency response smarter?
        </h2>
        <p
          className="text-lg leading-relaxed mb-8 max-w-xl mx-auto"
          style={{ color: "#6B7280" }}
        >
          resq connects critical incidents with the right resources at the
          right time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: "#0B1F33", color: "#FFFFFF" }}
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p
          className="mt-6 text-sm font-medium"
          style={{ color: "#6B7280" }}
        >
          Smart Response. Faster Rescue.
        </p>
      </div>
    </section>
  );
}
