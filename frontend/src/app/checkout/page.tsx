import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { CheckoutForm } from "@/components/sections/checkout-form";


export default async function CheckoutPage(): Promise<JSX.Element> {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28">
        <div className="container-narrow py-12">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">
              Checkout
            </h1>
            <p className="mt-3 text-muted-foreground">
              A calm, streamlined checkout designed for premium conversion.
            </p>
          </div>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
