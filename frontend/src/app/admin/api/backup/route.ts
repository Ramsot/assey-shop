import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const [backups, total] = await Promise.all([
    prisma.backup.findMany({
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.backup.count(),
  ]);

  return NextResponse.json({ success: true, data: backups, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const backup = await prisma.backup.create({
      data: {
        name: body.name || `Backup ${new Date().toISOString()}`,
        filename: body.filename || null,
        size: body.size ? parseInt(body.size) : null,
        type: body.type || "manual",
        status: body.status || "pending",
        notes: body.notes || null,
      },
    });
    return NextResponse.json({ success: true, data: backup }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create backup" }, { status: 500 });
  }
}
