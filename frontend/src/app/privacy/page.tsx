import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — ASSEY Atelier",
  description: "How we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container-narrow max-w-3xl">
          <h1 className="font-serif text-4xl font-medium text-ink">Privacy Policy</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Your privacy matters to us. This policy explains how ASSEY Atelier collects, uses, and safeguards your personal information when you visit our website or make a purchase.</p>
            <h2 className="text-base font-semibold text-ink">Information We Collect</h2>
            <p>We collect information you provide directly — name, email, phone, shipping address — when you place an order, sign up for our newsletter, or contact us.</p>
            <h2 className="text-base font-semibold text-ink">How We Use It</h2>
            <p>Your data is used to process orders, send updates, improve our service, and — with your consent — send marketing communications. We never sell your data to third parties.</p>
            <h2 className="text-base font-semibold text-ink">Data Security</h2>
            <p>We implement industry-standard measures to protect your personal information.</p>
            <h2 className="text-base font-semibold text-ink">Contact</h2>
            <p>For privacy-related inquiries, email us at concierge@asseyatelier.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
