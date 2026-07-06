"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { type Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps): JSX.Element {
  const [activeColor, setActiveColor] = useState(product.colors[0]?.name ?? "");
  const addItem = useCartStore((state) => state.addItem);

  const soldOut = product.stockQty === 0;
  const lowStock = !soldOut && product.stockQty > 0 && product.stockQty <= 3;
  const tags = product.tags.map((t) => t.toLowerCase());
  const isNew = tags.includes("new");
  const isBest = tags.includes("best") || product.isFeatured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone">
        {product.displayImageUrl ? (
          <Image
            src={product.displayImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-atelier group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {product.sku}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && (
            <span className="rounded bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
              Sold Out
            </span>
          )}
          {!soldOut && isNew && (
            <span className="rounded bg-gold/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
              New
            </span>
          )}
          {!soldOut && isBest && (
            <span className="rounded bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
              Best seller
            </span>
          )}
          {!soldOut && lowStock && (
            <span className="rounded bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-800">
              Only {product.stockQty} left
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <Link href={`/products/${product.slug}`} className="font-serif text-lg font-medium text-ink hover:underline">{product.name}</Link>
        {product.subtitle && (
          <p className="text-xs text-muted-foreground">{product.subtitle}</p>
        )}

        {product.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            {product.colors.slice(0, 5).map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setActiveColor(color.name)}
                aria-label={`Select ${color.name}`}
                className={cn(
                  "h-5 w-5 rounded-full border border-border/60 transition-transform",
                  activeColor === color.name && "ring-1 ring-ink ring-offset-1"
                )}
                style={{ 
                  '--swatch-color': color.hex,
                  backgroundColor: 'var(--swatch-color)'
                } as React.CSSProperties}
                title={color.name}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            disabled={soldOut}
            onClick={() =>
              addItem({
                sku: product.sku,
                name: product.name,
                price: product.price,
                color: activeColor,
                quantity: 1,
                imageUrl: product.displayImageUrl || product.imageUrl,
                material: product.material,
              })
            }
          >
            {soldOut ? "Sold Out" : "Add"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
