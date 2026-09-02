"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function Hero(): JSX.Element {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-28">
      <div className="container-narrow relative grid min-h-[calc(100vh-7rem)] items-center gap-8 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="z-10 flex flex-col justify-center py-12"
        >
          <motion.span
            variants={fadeUp}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-gold"
          >
            New Season Atelier Edit
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="max-w-md font-serif text-5xl font-medium leading-[1.05] text-ink md:text-6xl lg:text-7xl"
          >
            Carry quiet luxury, beautifully.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground"
          >
            A curated collection of premium handbags in champagne gold, cream,
            and blush — crafted for modern silhouettes and timeless polish.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link href="/shop">
              <Button size="lg">Shop New Arrivals</Button>
            </Link>
            <Link href="/collections/signature">
              <Button variant="ghost" size="lg">
                Explore Signature
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              ["Complimentary", "Shipping + returns"],
              ["Hardware", "Champagne gold finish"],
              ["Craft", "Minimal seams, refined edge"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-sm font-semibold text-ink">{label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{value}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-[calc(100vh_30%)] overflow-hidden rounded-2xl bg-stone lg:h-[calc(100vh-10rem)]"
        >
          <Image
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury handbag campaign"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
