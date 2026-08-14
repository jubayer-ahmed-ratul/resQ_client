"use client";

import {
  AlertTriangle,
  Truck,
  Route,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const problems = [
  {
    Icon: AlertTriangle,
    title: "Multiple Simultaneous Emergencies",
    description:
      "Multiple incidents can arrive at the same time, making manual prioritization difficult.",
  },
  {
    Icon: Truck,
    title: "Limited Emergency Resources",
    description:
      "Available ambulances, teams, and equipment must be assigned where they can have the greatest impact.",
  },
  {
    Icon: Route,
    title: "Changing Road & Disaster Conditions",
    description:
      "Road blocks, traffic, and evolving disaster conditions can make an existing assignment ineffective.",
  },
  {
    Icon: Inbox,
    title: "High-Volume Incoming Requests",
    description:
      "Large-scale emergencies can generate more requests than response teams can process manually.",
  },
];

const cardVariants = {
  hiddenLeft: {
    opacity: 0,
    x: -80,
  },
  hiddenRight: {
    opacity: 0,
    x: 80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function ProblemSection() {
  return (
    <section
      id="problems"
      className="relative overflow-hidden bg-white py-20 md:py-28"
      aria-labelledby="problems-heading"
    >
      {/* Background Decoration */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 h-80 w-80 rounded-full blur-3xl"
        style={{
          backgroundColor: "rgba(11, 31, 51, 0.035)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: "rgba(11, 31, 51, 0.025)",
        }}
      />

      <div className="site-container relative z-10">
        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2
            id="problems-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#0B1F33" }}
          >
            When Every{" "}
            <span style={{ color: "#1AC3B1" }}>Second Matters</span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: "#6B7280" }}
          >
            Emergency teams often face multiple incidents, limited resources,
            and rapidly changing conditions at the same time.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ Icon, title, description }, index) => {
            const isLeft = index < 2;

            return (
              <motion.article
                key={title}
                variants={cardVariants}
                initial={isLeft ? "hiddenLeft" : "hiddenRight"}
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  delay: index * 0.12,
                }}
                className={cn(
                  "group flex min-h-[290px] flex-col rounded-2xl border bg-white p-6",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                )}
                style={{
                  borderColor: "rgba(11, 31, 51, 0.09)",
                }}
              >
                {/* Icon + Number */}
                <div className="mb-7 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "rgba(26, 195, 177, 0.12)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{
                        color: "#0B1F33",
                      }}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className="text-xs font-bold tracking-[0.15em]"
                    style={{
                      color: "rgba(11, 31, 51, 0.25)",
                    }}
                  >
                    0{index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <h3
                    className="mb-3 text-lg font-semibold leading-snug"
                    style={{
                      color: "#243447",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    className="text-sm leading-6"
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    {description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}