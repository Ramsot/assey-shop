import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultItems = [
  { href: "/shop", label: "Shop" },
  { href: "/collections/signature", label: "Signature" },
  { href: "/collections/evening", label: "Evening" },
  { href: "/collections/workwear", label: "Workwear" },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location") ?? "header";

  const menu = await prisma.navigationMenu.findFirst({
    where: { location, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (menu?.items) {
    try {
      const items = JSON.parse(menu.items);
      if (items.length > 0) {
        return NextResponse.json({ items });
      }
    } catch {}
  }

  return NextResponse.json({ items: defaultItems });
}
