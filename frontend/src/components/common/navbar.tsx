"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

const defaultLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections/signature", label: "Signature" },
  { href: "/collections/evening", label: "Evening" },
  { href: "/collections/workwear", label: "Workwear" },
];

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const scrolled = useScroll(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((state) => state.getCount());
  const [navLinks, setNavLinks] = useState(defaultLinks);

  useEffect(() => {
    fetch("/api/public/navigation?location=header")
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) setNavLinks(data.items);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled ? "bg-paper/80 py-3 backdrop-blur-md border-b border-border" : "bg-transparent py-6"
        )}
      >
        <div className="container-narrow flex items-center justify-between">
          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
              ASSEY
            </span>
            <span className="text-[0.75em] uppercase tracking-[0.15em] text-muted-foreground">
              Atelier
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-xs uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-70",
                  pathname === link.href && "font-semibold"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-ink"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/checkout" className="relative p-2.5">
              <ShoppingBag className="h-4.5 w-4.5 text-ink" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-[8px] font-medium text-paper">
                  {count}
                </span>
              )}
              <span className="sr-only">Bag</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-paper/95"
          >
            <div className="container-narrow flex h-full flex-col py-8">
              <div className="flex items-center justify-between">
                <Link href="/" className="font-serif text-2xl font-semibold">
                  ASSEY
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              <nav className="mt-12 flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="font-serif text-3xl font-light text-ink"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8">
                <Link href="/checkout" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="lg">
                    Checkout {count > 0 && `(${count})`}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
