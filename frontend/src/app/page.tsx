import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Hero } from "@/components/sections/hero";
import { CollectionTiles } from "@/components/sections/collection-tiles";
import { TrustStrip } from "@/components/sections/trust-strip";
import { BestSellers } from "@/components/sections/best-sellers";
import { AtelierPromise } from "@/components/sections/atelier-promise";
import { getCollections, getFeaturedProducts, getHomepageSections } from "@/lib/public-data";

export default async function HomePage(): Promise<JSX.Element> {
  const [sections, collections, products] = await Promise.all([
    getHomepageSections(),
    getCollections(),
    getFeaturedProducts(),
  ]);

  const typeMap: Record<string, React.ReactNode> = {
    hero: <Hero />,
    collections: <CollectionTiles collections={collections} />,
    trust_strip: <TrustStrip />,
    best_sellers: <BestSellers products={products} />,
    atelier_promise: <AtelierPromise />,
  };

  const visible = sections.filter((s) => typeMap[s.type]);

  return (
    <>
      <Navbar />
      <main>
        {visible.length > 0
          ? visible.map((s) => <div key={s.id}>{typeMap[s.type]}</div>)
          : <>
              <Hero />
              <CollectionTiles collections={collections} />
              <TrustStrip />
              <BestSellers products={products} />
              <AtelierPromise />
            </>
        }
      </main>
      <Footer />
    </>
  );
}
