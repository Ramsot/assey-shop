import { notFound } from "next/navigation";

import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getOrderByNumber } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface OrderConfirmationPageProps {
  searchParams: Promise<{ order_number?: string; whatsapp?: string }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps): Promise<JSX.Element> {
  const { order_number: orderNumber, whatsapp } = await searchParams;

  if (!orderNumber) {
    notFound();
  }

  // For WhatsApp orders, we don't query the backend
  const order = whatsapp ? null : await getOrderByNumber(orderNumber);
  if (!whatsapp && !order) {
    notFound();
  }

  const createdAt = whatsapp ? new Date() : (order?.created_at ? new Date(String(order.created_at)) : new Date());

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-paper p-8 text-center md:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              {whatsapp ? "Order sent via WhatsApp" : "Order confirmed"}
            </span>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink md:text-5xl">
              {whatsapp ? "Order sent to WhatsApp" : "Thank you — it&apos;s on the way."}
            </h1>
            <p className="mt-4 text-muted-foreground">
              {whatsapp 
                ? "Your order details have been sent to our WhatsApp. We'll confirm availability and payment instructions within 2 hours."
                : "Your order has been placed successfully. A confirmation email will be sent shortly."
              }
            </p>

            <div className="mt-10 space-y-3 text-left">
              <Row label="Order" value={orderNumber} />
              <Row
                label="Date"
                value={createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              {!whatsapp && <Row label="Email" value={String(order?.email ?? "—")} />}
              {!whatsapp && <Row label="Total" value={formatPrice(Number(order?.total ?? 0))} />}
              <Row label="Status" value={whatsapp ? "Awaiting confirmation" : String(order?.status ?? "Pending")} />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <a href="/shop">Continue shopping</a>
              </Button>
              {whatsapp && (
                <Button variant="outline" asChild>
                  <a href="https://wa.me/255787820865" target="_blank" rel="noopener noreferrer">
                    Open WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="ghost" onClick={() => window.print()}>
                Print order
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
