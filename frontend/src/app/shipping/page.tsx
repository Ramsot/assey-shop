import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";


export const metadata: Metadata = {
  title: "Shipping — ASSEY Atelier",
  description:
    "Shipping information and delivery options for ASSEY Atelier handbags.",
};

export default async function ShippingPage(): Promise<JSX.Element> {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Shipping
            </h1>
            <p className="mt-3 text-muted-foreground">
              Delivery options and timelines for your ASSEY pieces.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  Delivery options
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-ink">Standard delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Complimentary on all orders. Delivered within 3–5 business days.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Priority delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      TSh 35,000. Delivered within 2 business days.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Express delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      TSh 70,000. Delivered next business day (order by 12 PM CET).
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  International shipping
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-ink">Europe</h3>
                    <p className="text-sm text-muted-foreground">
                      TSh 45,000. 5–7 business days via DHL Express.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">North America</h3>
                    <p className="text-sm text-muted-foreground">
                      TSh 80,000. 7–10 business days via DHL Express.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Rest of world</h3>
                    <p className="text-sm text-muted-foreground">
                      TSh 110,000. 10–14 business days via DHL Express.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  Order tracking
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Once your order ships, you&apos;ll receive a tracking number via email.
                  Track your package directly on our website or the carrier&apos;s site.
                </p>
                <div className="rounded-md bg-stone p-4">
                  <p className="text-xs text-ink">
                    Sample tracking: AS-2025-001234 → In transit → Delivered
                  </p>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Packaging
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Each piece arrives in our signature ASSEY dust pouch with branded
                  packaging, ready for gifting or storage.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Customs & duties
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  International orders may be subject to import duties and taxes.
                  These charges are the recipient&apos;s responsibility.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
