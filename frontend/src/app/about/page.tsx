import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export const metadata: Metadata = {
  title: "About — ASSEY Atelier",
  description: "The story behind ASSEY Atelier — premium leather handbags crafted for modern silhouettes.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container-narrow max-w-3xl">
          <h1 className="font-serif text-4xl font-medium text-ink">About ASSEY Atelier</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>ASSEY Atelier was born from a desire to create handbags that marry quiet luxury with everyday practicality. Every piece is thoughtfully designed, meticulously crafted, and built to last.</p>
            <p>We work with skilled artisans who share our commitment to quality — selecting the finest leathers, hardware, and materials. The result is a collection that feels as beautiful as it looks.</p>
            <p>Our name, ASSEY, speaks to a philosophy of understated elegance. We believe luxury should be felt, not shouted.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
