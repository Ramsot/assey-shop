import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where: where as any,
      include: { _count: { select: { users: true, permissions: true } }, permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.role.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: roles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const role = await prisma.role.create({
      data: {
        name: body.name,
        description: body.description || "",
        isSystem: body.isSystem ?? false,
      },
      include: { permissions: { include: { permission: true } } },
    });
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create role" }, { status: 500 });
  }
}
