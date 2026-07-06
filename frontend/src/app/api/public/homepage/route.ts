import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const data = sections.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title ?? "",
    subtitle: s.subtitle ?? "",
    content: s.content ?? "",
    settings: s.settings ? tryParse(s.settings) : {},
    sortOrder: s.sortOrder,
  }));

  return NextResponse.json({ sections: data });
}

function tryParse(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
