"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";


export function CheckoutForm(): JSX.Element {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal: total,
      total: total,
    };
  }, [items]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;

    // Format order details for WhatsApp
    const orderDetails = items.map((item) =>
      `${item.name} ${item.color ? `(${item.color})` : ''} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    ).join('%0A');

    const whatsappMessage = encodeURIComponent(
      `*NEW ORDER - ASSEY Atelier*%0A%0A` +
      `*Customer Details:*%0A` +
      `Name: ${data.firstName} ${data.lastName}%0A` +
      `Email: ${data.email}%0A` +
      `Phone: ${data.phone || 'Not provided'}%0A` +
      `Address: ${data.address1}, ${data.city}, ${data.postal}, ${data.country}%0A%0A` +
      `*Order Items:*%0A${orderDetails}%0A%0A` +
      `*Subtotal:* ${formatPrice(summary.subtotal)}%0A` +
      `*Total:* ${formatPrice(summary.total)}%0A%0A` +
      `*Delivery Address:* ${data.address1}, ${data.city}, ${data.postal}, ${data.country}%0A%0A` +
      `*Notes:* ${data.notes || 'None'}%0A%0A` +
      `Please confirm availability and payment instructions.`
    );

    // Save order to database
    let orderNumber = "";
    let saveError: string | null = null;
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address1: data.address1,
          city: data.city,
          postal: data.postal,
          country: data.country,
          notes: data.notes,
          subtotal: summary.subtotal,
          total: summary.total,
          items: items.map((item) => ({
            sku: item.sku,
            name: item.name,
            price: item.price,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        saveError = text || `Failed to save order: ${res.status}`;
      } else {
        const json = await res.json();
        orderNumber = json.data?.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;
      }
    } catch (err) {
      saveError = err instanceof Error ? err.message : "Failed to save order";
    }

    if (saveError) {
      console.error("Failed to save order:", saveError);
      setLoading(false);
      alert("Could not save your order. Please try again or contact us directly.");
      return;
    }

    const whatsappUrl = `https://wa.me/255787820865?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    router.push(`/order-confirmation?order_number=${orderNumber}&whatsapp=true`);
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-paper p-12 text-center">
        <h2 className="font-serif text-2xl text-ink">Your bag is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Explore the shop and add a few favorites.
        </p>
        <Button className="mt-6" onClick={() => router.push("/shop")}>
          Shop now
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 xl:gap-12">
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="rounded-2xl border border-border bg-paper p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-paper">
              1
            </div>
            <h2 className="font-serif text-xl text-ink">Delivery</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="firstName" required />
              <Field label="Last name" name="lastName" required />
            </div>
            <Field label="Email" name="email" type="email" required />
            <Field label="Address" name="address1" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" required />
              <Field label="Postal code" name="postal" required />
            </div>
            <Field label="Country" name="country" required />
            <Field label="Phone (optional)" name="phone" type="tel" />
            <Field label="Delivery instructions (optional)" name="notes" textarea />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-paper p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-paper">
              2
            </div>
            <h2 className="font-serif text-xl text-ink">Your items</h2>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.sku}-${item.color}`} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-accent">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    sizes="64px"
                    quality={85}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-ink">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.color && item.material && <span> · </span>}
                      {item.material && <span>{item.material}</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const { updateQuantity } = useCartStore.getState();
                          updateQuantity(item.sku, item.color, item.quantity - 1);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-ink transition-colors hover:bg-accent touch-target"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        title="Decrease quantity"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const { updateQuantity } = useCartStore.getState();
                          updateQuantity(item.sku, item.color, item.quantity + 1);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-ink transition-colors hover:bg-accent touch-target"
                        aria-label="Increase quantity"
                        title="Increase quantity"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const { removeItem } = useCartStore.getState();
                          removeItem(item.sku, item.color);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive touch-target"
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-paper p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-paper">
              3
            </div>
            <h2 className="font-serif text-xl text-ink">Payment via WhatsApp</h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-green-800">Order via WhatsApp</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Click &ldquo;Place order&rdquo; to send your order details directly to our WhatsApp. 
                We&apos;ll confirm availability and provide payment instructions.
              </p>
              <div className="text-xs text-green-600">
                <p>• Phone: +255 787 820 865</p>
                <p>• Response time: Within 2 hours</p>
                <p>• Payment: Bank transfer or mobile money</p>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent"></div>
              Placing order...
            </div>
          ) : (
            "Place order"
          )}
        </Button>
      </form>

      <aside>
        <div className="sticky top-28 rounded-2xl border border-border bg-paper p-4 sm:p-6 md:p-8">
          <h2 className="font-serif text-xl text-ink">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={`${item.sku}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-ink">
                  {item.name} {item.color && `· ${item.color}`} × {item.quantity}
                </span>
                <span className="font-medium text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
            <div className="flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(summary.total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  textarea?: boolean;
}

function Field({ label, textarea, className, ...props }: FieldProps): JSX.Element {
  const inputClasses =
    "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ink focus:ring-1 focus:ring-ring";
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">
        {label}
      </label>
      {textarea ? (
        <textarea className={inputClasses} rows={3} {...props} />
      ) : (
        <input className={inputClasses} {...props} />
      )}
    </div>
  );
}
