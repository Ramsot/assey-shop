"use client";

import { motion } from "framer-motion";

const promises = [
  {
    title: "Authenticity, always.",
    subtitle: "Promise",
    gradient: "linear-gradient(180deg, rgba(232,217,190,0.4) 0%, rgba(212,184,150,0.2) 100%)",
  },
  {
    title: "Dust bag included.",
    subtitle: "Care",
    gradient: "linear-gradient(180deg, rgba(235,195,191,0.4) 0%, rgba(212,160,160,0.2) 100%)",
  },
  {
    title: "Concierge checkout.",
    subtitle: "Support",
    gradient: "linear-gradient(180deg, rgba(201,212,192,0.4) 0%, rgba(168,188,158,0.2) 100%)",
  },
];

export function AtelierPromise(): JSX.Element {
  return (
    <section className="bg-paper py-24">
      <div className="container-narrow">
        <div className="grid gap-6 md:grid-cols-3">
          {promises.map((item, index) => (
            <motion.div
              key={item.subtitle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-2xl p-6"
              style={{ background: item.gradient }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                {item.subtitle}
              </span>
              <h3 className="mt-2 font-serif text-xl text-ink">{item.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
