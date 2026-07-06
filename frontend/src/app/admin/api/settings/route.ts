import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") || "";

  const where: Record<string, unknown> = {};
  if (group) where.group = group;

  const settings = await prisma.websiteSetting.findMany({
    where: where as any,
    orderBy: { key: "asc" },
  });

  const grouped = settings.reduce<Record<string, Record<string, string | null>>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = {};
    acc[s.group][s.key] = s.value;
    return acc;
  }, {});

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    if (body.bulk && Array.isArray(body.bulk)) {
      const results = await Promise.all(
        body.bulk.map((s: { key: string; value: string; group?: string }) =>
          prisma.websiteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, group: s.group || "general" },
            create: { key: s.key, value: s.value, group: s.group || "general" },
          })
        )
      );
      revalidatePublic("home");
      return NextResponse.json({ success: true, data: results }, { status: 201 });
    }

    const setting = await prisma.websiteSetting.upsert({
      where: { key: body.key },
      update: { value: body.value, group: body.group || "general" },
      create: { key: body.key, value: body.value, group: body.group || "general" },
    });
    revalidatePublic("home");
    return NextResponse.json({ success: true, data: setting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save setting" }, { status: 500 });
  }
}
