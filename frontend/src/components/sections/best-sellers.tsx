import Link from "next/link";

import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { type Product } from "@/types";

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps): JSX.Element {
  return (
    <section className="bg-background py-24">
      <div className="container-narrow">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-serif text-3xl font-medium text-ink md:text-4xl">
              Best sellers
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              The pieces customers come back for — effortless shapes with a
              polished finish.
            </p>
          </div>
          <Link href="/shop">
            <Button variant="ghost">Shop best</Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No featured products yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
