import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ProductGrid } from "@/components/sections/product-grid";
import { getCollections, getProducts } from "@/lib/api";

export default async function ShopPage(): Promise<JSX.Element> {
  const [products, collections] = await Promise.all([
    getProducts({ page_size: "100" }),
    getCollections(),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Shop
            </h1>
            <p className="mt-3 text-muted-foreground">
              Refined silhouettes in champagne, cream, and blush — styled for
              modern carry.
            </p>
          </div>
          <ProductGrid products={products} collections={collections} />
        </div>
      </main>
      <Footer />
    </>
  );
}
