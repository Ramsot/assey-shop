import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export const metadata: Metadata = {
  title: "Terms of Use — ASSEY Atelier",
  description: "Terms and conditions for using ASSEY Atelier's website and services.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container-narrow max-w-3xl">
          <h1 className="font-serif text-4xl font-medium text-ink">Terms of Use</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>By accessing and using the ASSEY Atelier website, you agree to these terms. Please read them carefully.</p>
            <h2 className="text-base font-semibold text-ink">General</h2>
            <p>All content on this site — including text, images, logos — is the property of ASSEY Atelier and protected by applicable intellectual property laws.</p>
            <h2 className="text-base font-semibold text-ink">Orders &amp; Payments</h2>
            <p>We reserve the right to refuse or cancel any order. Prices are listed in TZS and may change without notice. Payment is due at the time of purchase.</p>
            <h2 className="text-base font-semibold text-ink">Shipping &amp; Returns</h2>
            <p>Shipping and return policies are outlined on their respective pages and form part of these terms.</p>
            <h2 className="text-base font-semibold text-ink">Limitation of Liability</h2>
            <p>ASSEY Atelier is not liable for indirect damages arising from use of this site or our products.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
