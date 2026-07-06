import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Care Guide — ASSEY Atelier",
  description:
    "Learn how to store, clean, and protect your ASSEY Atelier handbags.",
};

export default async function CareGuidePage(): Promise<JSX.Element> {
  const products = await getProducts({ page_size: "100" });

  const materials = Array.from(
    new Set(products.map((p) => p.material).filter(Boolean))
  );

  const careTips = [
    {
      title: "Storage",
      body: "Store your bag in the included dust pouch and fill it with tissue paper to maintain its shape. Avoid direct sunlight and humid environments.",
    },
    {
      title: "Cleaning",
      body: "Gently wipe the surface with a soft, dry microfiber cloth. For leather, use a conditioner every 3-6 months to keep the finish supple.",
    },
    {
      title: "Handling",
      body: "Avoid contact with sharp objects, cosmetics, and liquids. If your bag gets wet, blot it immediately with a dry cloth and let it air dry.",
    },
    {
      title: "Hardware",
      body: "Polish metal fittings with a soft cloth. Keep zippers and closures free of dust and debris for smooth operation.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Care Guide
            </h1>
            <p className="mt-3 text-muted-foreground">
              Keep your ASSEY pieces looking impeccable with our recommended care
              routine.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                {careTips.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg border border-border bg-paper p-6"
                  >
                    <h3 className="font-serif text-xl font-medium text-ink">
                      {tip.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {tip.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-lg border border-border bg-paper p-6">
              <h3 className="font-serif text-xl font-medium text-ink">
                Materials used
              </h3>
              <ul className="mt-4 space-y-2">
                {materials.map((material) => (
                  <li
                    key={material}
                    className="text-sm text-muted-foreground"
                  >
                    {material}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
