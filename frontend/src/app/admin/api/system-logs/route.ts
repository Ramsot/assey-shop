import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");

  const where = level ? { level } : {};

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.systemLog.count({ where }),
  ]);

  const data = logs.map((l) => ({
    id: l.id,
    level: l.level,
    message: l.message,
    source: l.source || "",
    timestamp: l.createdAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data, total, page, pageSize });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { level, message, source } = await request.json();
    const log = await prisma.systemLog.create({
      data: { level: level || "info", message, source },
    });
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create log" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await prisma.systemLog.deleteMany({});
  return NextResponse.json({ success: true, message: "System logs cleared" });
}
