import { notFound } from "next/navigation";

import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ProductCard } from "@/components/ui/product-card";
import { getCollections, getProductsByCollection } from "@/lib/api";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const [collections, products] = await Promise.all([
    getCollections(),
    getProductsByCollection(slug),
  ]);

  const collection = collections.find((c) => c.key === slug);
  if (!collection) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              {collection.caption}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-medium text-ink md:text-5xl">
              {collection.title || collection.name}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {collection.description}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-paper p-12 text-center">
              <h2 className="font-serif text-xl text-ink">No products yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This collection is currently empty.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
