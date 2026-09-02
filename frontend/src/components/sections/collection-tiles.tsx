"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { type Collection } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionTilesProps {
  collections: Collection[];
}

const gradients: Record<string, string> = {
  signature: "linear-gradient(135deg, #e8d9be 0%, #d4b896 100%)",
  evening: "linear-gradient(135deg, #ebc3bf 0%, #d4a0a0 100%)",
  workwear: "linear-gradient(135deg, #c9d4c0 0%, #a8bc9e 100%)",
  default: "linear-gradient(135deg, #f0e9de 0%, #e2d5c4 100%)",
};

export function CollectionTiles({ collections }: CollectionTilesProps): JSX.Element {
  const active = collections.filter((c) => c.isActive);

  return (
    <section className="bg-paper py-24">
      <div className="container-narrow">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-serif text-3xl font-medium text-ink md:text-4xl">
              Collections, styled like an editorial.
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Soft tones, clean lines, premium materials — designed to feel
              composed in any moment.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {active.map((collection, index) => (
            <motion.div
              key={collection.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Link
                href={`/collections/${collection.key}`}
                className="group relative flex flex-col h-full overflow-hidden rounded-3xl p-8 pt-12"
                style={{
                  background: gradients[collection.key] || gradients.default,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/5 bg-gradient-to-b from-ink/20 via-ink/5 to-transparent" />
                <div className="relative z-10 flex-1">
                  <span className="text-[0.75em] font-semibold uppercase tracking-[0.15em] text-white/80">
                    {collection.caption}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl text-white">
                    {collection.title || collection.name}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm text-white/80">
                    {collection.description}
                  </p>
                </div>
                <div
                  className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
