import type { Metadata } from "next";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getCollections } from "@/lib/api";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact — ASSEY Atelier",
  description:
    "Get in touch with ASSEY Atelier for orders, styling advice, and inquiries.",
};

export default async function ContactPage(): Promise<JSX.Element> {
  const collections = await getCollections();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Contact
            </h1>
            <p className="mt-3 text-muted-foreground">
              Reach out for orders, styling advice, or atelier inquiries.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Atelier hours
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Monday — Friday
                  <br />
                  10:00 AM - 6:00 PM CET
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Email
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  concierge@asseyatelier.com
                </p>
              </div>

              <div className="rounded-lg border border-border bg-paper p-6">
                <h3 className="font-serif text-xl font-medium text-ink">
                  Collections
                </h3>
                <ul className="mt-3 space-y-2">
                  {collections
                    .filter((c) => c.isActive)
                    .map((collection) => (
                      <li key={collection.key}>
                        <a
                          href={`/collections/${collection.key}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-ink"
                        >
                          {collection.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
