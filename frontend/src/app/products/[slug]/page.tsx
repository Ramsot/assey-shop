import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ProductDetail } from "@/components/sections/product-detail";
import { getProduct, getProducts } from "@/lib/public-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — ASSEY Atelier`,
    description: product.subtitle || product.description?.slice(0, 160),
    openGraph: {
      title: `${product.name} — ASSEY Atelier`,
      description: product.subtitle || product.description?.slice(0, 160),
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  );
}
