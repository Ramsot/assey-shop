"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      sku: product.sku,
      name: product.name,
      price: product.price,
      color: selectedColor,
      quantity: 1,
      imageUrl: product.imageUrl,
      material: product.material,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-narrow py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center">
          {product.collections?.[0] && (
            <Link
              href={`/collections/${product.collections[0].key}`}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-gold hover:underline"
            >
              {product.collections[0].name}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-4xl font-medium text-ink md:text-5xl">
            {product.name}
          </h1>
          {product.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{product.subtitle}</p>
          )}
          <p className="mt-6 font-serif text-3xl text-ink">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {product.colors.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Color</p>
              <div className="mt-2 flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? "border-ink scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.material && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-ink">Material:</span> {product.material}
            </p>
          )}
          {product.size && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-ink">Size:</span> {product.size}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={handleAddToCart} disabled={added}>
              {added ? "Added to cart" : "Add to cart"}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/checkout">Buy now</Link>
            </Button>
          </div>

          <div className="mt-8 flex gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
            <span>Free shipping</span>
            <span>30-day returns</span>
            <span>Authentic guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
