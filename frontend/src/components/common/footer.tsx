import Link from "next/link";
import { getCollections, getWebsiteSettings } from "@/lib/public-data";

export async function Footer(): Promise<JSX.Element> {
  const [collections, settings] = await Promise.all([
    getCollections(),
    getWebsiteSettings(),
  ]);

  const activeCollections = collections.filter((c) => c.isActive);
  const tagline = settings.site_tagline || settings.site_description || "Premium leather handbags crafted for modern silhouettes and timeless polish.";
  const copyright = settings.copyright_text || "© 2025 ASSEY Atelier. All rights reserved.";
  const email = settings.site_email || "concierge@asseyatelier.com";
  const phone = settings.site_phone || "";
  const facebook = settings.social_facebook || "";
  const instagram = settings.social_instagram || "";

  return (
    <footer className="border-t border-border bg-paper">
      <div className="container-narrow py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-serif text-2xl font-semibold text-ink">ASSEY</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {tagline}
            </p>
            {email && (
              <a href={`mailto:${email}`} className="mt-3 block text-sm text-muted-foreground hover:text-ink">
                {email}
              </a>
            )}
            {phone && (
              <p className="mt-1 text-sm text-muted-foreground">{phone}</p>
            )}
            {(facebook || instagram) && (
              <div className="mt-4 flex gap-3">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-ink">
                    Facebook
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-ink">
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Shop
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  All collections
                </Link>
              </li>
              {activeCollections.map((collection) => (
                <li key={collection.key}>
                  <Link
                    href={`/collections/${collection.key}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-ink"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Service
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/checkout"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Atelier
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/materials"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/care-guide"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Care guide
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-ink"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-narrow flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted-foreground md:flex-row">
          <span>{copyright}</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-ink">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
