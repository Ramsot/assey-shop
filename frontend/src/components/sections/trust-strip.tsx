import { Truck, RefreshCw, Gem, Gift } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Free Shipping",
    text: "On all orders, always",
  },
  {
    icon: RefreshCw,
    title: "Free Returns",
    text: "30-day return policy",
  },
  {
    icon: Gem,
    title: "Authentic",
    text: "Genuine luxury leather",
  },
  {
    icon: Gift,
    title: "Gift Ready",
    text: "Dust bag & receipt included",
  },
];

export function TrustStrip(): JSX.Element {
  return (
    <section className="border-y border-border bg-background">
      <div className="container-narrow">
        <div className="grid divide-y border-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-4 px-2 py-8 md:justify-center md:px-6"
            >
              <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-semibold text-ink">{title}</div>
                <div className="text-xs text-muted-foreground">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
