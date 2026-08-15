
"use client";

import {
  PhoneIncoming,
  ScanSearch,
  GitMerge,
  Send,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    Icon: PhoneIncoming,
    title: "Emergency Request",
    desc: "Emergency incident enters the system.",
  },
  {
    number: "02",
    Icon: ScanSearch,
    title: "Priority Analysis",
    desc: "Severity, urgency, and incident context are analyzed.",
  },
  {
    number: "03",
    Icon: GitMerge,
    title: "Resource Matching",
    desc: "Available emergency resources are evaluated and matched.",
  },
  {
    number: "04",
    Icon: Send,
    title: "Dispatch",
    desc: "The selected resource and hospital receive the assignment.",
  },
  {
    number: "05",
    Icon: RefreshCw,
    title: "Dynamic Re-optimization",
    desc: "If conditions change, assignments are recalculated.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Workflow() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#EEF3F7] py-20 sm:py-24 lg:py-20"
      aria-labelledby="workflow-heading"
    >
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-100/30 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />

        <div className="absolute left-[12%] top-[18%] h-1.5 w-1.5 rounded-full bg-emerald-400/40" />
        <div className="absolute right-[15%] top-[30%] h-2 w-2 rounded-full bg-cyan-400/30" />
      </div>

      <div className="site-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center lg:mb-16"
        >
        

          <h2
            id="workflow-heading"
            className="text-3xl font-bold tracking-tight text-[#0B1F33] sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
          >
            From Emergency{" "}
            <span className="text-[#19C3B1]">to Action</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            resq turns incoming emergency requests into optimized response
            decisions.
          </p>
        </motion.div>

        {/* Workflow */}
        <motion.ol
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-3 lg:gap-5"
        >
          {/* Desktop connecting line — removed */}

          {steps.map(({ number, Icon, title, desc }, idx) => (
            <motion.li
              key={number}
              variants={itemVariants}
              className="group relative"
            >
              {/* Mobile connector — removed */}

              {/* Card */}
              <div className="relative flex h-full flex-col items-center rounded-2xl border border-white/80 bg-white/75 px-4 py-6 text-center shadow-[0_5px_25px_rgba(11,31,51,0.04)] backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:bg-white group-hover:shadow-[0_15px_40px_rgba(11,31,51,0.09)] md:border-transparent md:bg-transparent md:px-3 md:py-4 md:shadow-none md:backdrop-blur-0 md:group-hover:border-white/80 md:group-hover:bg-white/80 md:group-hover:shadow-[0_15px_40px_rgba(11,31,51,0.07)]"
              >
                {/* Icon */}
                <div className="relative z-10 mb-5">
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-full bg-emerald-300/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Icon circle */}
                  <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_5px_18px_rgba(11,31,51,0.08)] transition-all duration-300 group-hover:border-emerald-300 group-hover:shadow-[0_8px_25px_rgba(25,195,177,0.18)]">
                    <Icon
                      className="h-6 w-6 text-[#0B1F33] transition-colors duration-300 group-hover:text-[#19C3B1]"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Number badge */}
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#EEF3F7] bg-[#19C3B1] text-[9px] font-bold tracking-wide text-white shadow-sm">
                    {number}
                  </span>
                </div>

                {/* Text */}
                <h3 className="mb-2 text-sm font-semibold leading-snug text-[#243447] transition-colors duration-300 group-hover:text-[#0B1F33] sm:text-[15px]">
                  {title}
                </h3>

                <p className="max-w-[170px] text-xs leading-5 text-slate-500">
                  {desc}
                </p>

                {/* Arrow between desktop steps */}
                {idx < steps.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute -right-4 top-[3.25rem] z-20 hidden h-5 w-5 text-[#19C3B1] md:block"
                    strokeWidth={2}
                  />
                )}
              </div>
            </motion.li>
          ))}
        </motion.ol>

    
        

         
       
      </div>
    </section>
  );
}

