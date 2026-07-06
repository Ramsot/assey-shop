import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export const metadata: Metadata = {
  title: "FAQ — ASSEY Atelier",
  description: "Frequently asked questions about ordering, shipping, returns, and more.",
};

export default function FaqPage() {
  const faqs = [
    { q: "How do I place an order?", a: "Browse our collection, add items to your bag, and proceed to checkout. You'll receive a WhatsApp confirmation from our team within 2 hours." },
    { q: "What payment methods do you accept?", a: "We accept bank transfers and mobile money (M-Pesa, Tigo Pesa, Airtel Money). Payment details will be shared via WhatsApp after your order is placed." },
    { q: "Do you ship internationally?", a: "Yes, we ship worldwide. International shipping costs vary by destination and will be calculated at checkout." },
    { q: "What is your return policy?", a: "We offer a 30-day return policy for unworn items in original condition. See our Returns page for full details." },
    { q: "How long does shipping take?", a: "Domestic orders (Tanzania) arrive within 2-5 business days. International orders take 7-14 business days depending on the destination." },
    { q: "Are your products authentic?", a: "Absolutely. Every ASSEY Atelier piece is crafted from genuine, ethically sourced materials and inspected before shipping." },
    { q: "Can I track my order?", a: "Yes, once your order ships, you'll receive a tracking link via email or WhatsApp." },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container-narrow max-w-3xl">
          <h1 className="font-serif text-4xl font-medium text-ink">Frequently Asked Questions</h1>
          <div className="mt-8 space-y-8">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h2 className="font-semibold text-ink">{faq.q}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
