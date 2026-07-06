import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ui/product-card";

export const metadata: Metadata = {
  title: "Materials — ASSEY Atelier",
  description:
    "Explore the premium materials used across ASSEY Atelier handbags.",
};

export default async function MaterialsPage(): Promise<JSX.Element> {
  const products = await getProducts({ page_size: "100" });

  const materials = Array.from(
    new Set(products.map((p) => p.material).filter(Boolean))
  );

  const productsByMaterial = materials.map((material) => ({
    material,
    items: products.filter((p) => p.material === material).slice(0, 3),
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Materials
            </h1>
            <p className="mt-3 text-muted-foreground">
              Premium materials selected for their texture, durability, and
              refined finish.
            </p>
          </div>

          {productsByMaterial.map(({ material, items }) => (
            <section key={material} className="mb-16">
              <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
                {material}
              </h2>
              {items.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No products available.</p>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
