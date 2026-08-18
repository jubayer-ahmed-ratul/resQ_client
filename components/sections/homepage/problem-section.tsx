"use client";

import { AlertTriangle, Truck, Route, Inbox, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

const problems = [
  {
    Icon: AlertTriangle,
    title: "Multiple Simultaneous Emergencies",
    description: "Multiple incidents can arrive at the same time, making manual prioritization difficult.",
    number: "01",
  },
  {
    Icon: Truck,
    title: "Limited Emergency Resources",
    description: "Available ambulances, teams, and equipment must be assigned where they can have the greatest impact.",
    number: "02",
  },
  {
    Icon: Route,
    title: "Changing Road & Disaster Conditions",
    description: "Road blocks, traffic, and evolving disaster conditions can make an existing assignment ineffective.",
    number: "03",
  },
  {
    Icon: Inbox,
    title: "High-Volume Incoming Requests",
    description: "Large-scale emergencies can generate more requests than response teams can process manually.",
    number: "04",
  },
];

const emergencyImages = [
  {
    src: "https://i.ibb.co.com/SXjrFZL8/fire-service.jpg",
    alt: "Fire service emergency response",
    label: "Emergency Response",
  },
  {
    src: "https://i.ibb.co.com/wFpvT1Tt/flood.jpg",
    alt: "Flood disaster scene",
    label: "Disaster Scene",
  },
  {
    src: "https://i.ibb.co.com/x95JLgg/ambullance.jpg",
    alt: "Ambulance emergency dispatch",
    label: "Medical Dispatch",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ProblemSection() {
  return (
    <section
      id="problems"
      aria-labelledby="problems-heading"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-20"
    >
      {/* Background decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />
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
            id="problems-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-[#0B1F33]"
          >
            When Every <span className="text-[#19C3B1]">Second Matters</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-slate-500">
            Emergency teams often face multiple incidents, limited resources,
            and rapidly changing conditions at the same time.
          </p>
        </motion.div>

        {/* Main Content: cards left, images right */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left: Problem Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-3"
          >
            {problems.map(({ Icon, title, description, number }) => (
              <motion.article
                key={title}
                variants={itemVariants}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6"
                )}
              >
                {/* Left accent bar */}
                <div className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 rounded-r bg-gradient-to-b from-[#19C3B1] to-[#0B1F33] transition-transform duration-300 group-hover:scale-y-100" />

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F33] text-white transition-all duration-300 group-hover:bg-[#19C3B1]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold leading-snug text-[#243447]">
                        {title}
                      </h3>
                      <span className="shrink-0 text-[11px] font-bold tracking-[0.14em] text-slate-300 transition-colors group-hover:text-[#19C3B1]">
                        {number}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">{description}</p>
                  </div>

                  <ArrowUpRight
                    className="mt-0.5 hidden h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:text-[#19C3B1] sm:block"
                    aria-hidden="true"
                  />
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Right: Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Main tall image */}
              <div className="group relative row-span-2 min-h-[360px] overflow-hidden rounded-2xl shadow-xl sm:min-h-[420px]">
                <Image
                  src={emergencyImages[0].src}
                  alt={emergencyImages[0].alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/75 via-[#0B1F33]/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    {emergencyImages[0].label}
                  </span>
                </div>
              </div>

              {/* Two smaller images */}
              {emergencyImages.slice(1).map((img) => (
                <div
                  key={img.src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 18vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-medium text-white">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating live badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-5 left-4 hidden items-center gap-3 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md sm:flex"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#0B1F33]">Real-time response</p>
                <p className="text-[10px] text-slate-400">Every second counts</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
