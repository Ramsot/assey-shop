import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";


export const metadata: Metadata = {
  title: "Returns — ASSEY Atelier",
  description:
    "Return policy and instructions for ASSEY Atelier handbags.",
};

export default async function ReturnsPage(): Promise<JSX.Element> {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Returns
            </h1>
            <p className="mt-3 text-muted-foreground">
              Our return policy and how to initiate a return.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  Return policy
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-ink">30-day return window</h3>
                    <p className="text-sm text-muted-foreground">
                      Items may be returned within 30 days of delivery for a full refund
                      or exchange, provided they are unused and in original condition.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Original packaging required</h3>
                    <p className="text-sm text-muted-foreground">
                      All items must be returned in their original ASSEY packaging
                      including dust pouch, tags, and any protective materials.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">Final sale items</h3>
                    <p className="text-sm text-muted-foreground">
                      Sale items marked as &ldquo;final sale&rdquo; cannot be returned or exchanged.
                      Custom or personalized orders are also final sale.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  How to return
                </h2>
                <ol className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper text-xs font-medium">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-ink">Contact us</p>
                      <p>Email returns@asseyatelier.com with your order number and reason for return.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper text-xs font-medium">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-ink">Receive return label</p>
                      <p>We&apos;ll email you a prepaid return shipping label within 1 business day.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper text-xs font-medium">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-ink">Pack and ship</p>
                      <p>Package the item securely and attach the return label. Drop off at any authorized shipping location.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper text-xs font-medium">
                      4
                    </span>
                    <div>
                      <p className="font-medium text-ink">Refund processed</p>
                      <p>Once received and inspected, your refund will be processed within 3-5 business days.</p>
                    </div>
                  </li>
                </ol>
              </section>

              <section className="rounded-lg border border-border bg-paper p-6">
                <h2 className="font-serif text-2xl font-medium text-ink mb-4">
                  Exchanges
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Exchanges are available for items of equal or lesser value. If the new item
                  costs more, you&apos;ll pay the difference. If it costs less, we&apos;ll refund the
                  difference to your original payment method.
                </p>
                <div className="rounded-md bg-stone p-4">
                  <p className="text-xs text-ink">
                    Exchange example: Exchange a Signature Tote (TSh 1,800,000) for an Evening Clutch (TSh 1,520,000) → TSh 280,000 refund
                  </p>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Condition guidelines
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• No signs of wear or use</li>
                  <li>• No scratches or marks</li>
                  <li>• All hardware intact</li>
                  <li>• Original tags attached</li>
                  <li>• Dust pouch included</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Refund timeline
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Refunds are processed to your original payment method within 3-5 business
                  days after we receive and inspect the returned item.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Need help?
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Email returns@asseyatelier.com or call +41 44 123 4567 (Mon–Fri, 10 AM–6 PM CET).
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
