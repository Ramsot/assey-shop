import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count(),
  ]);

  const data = logs.map((l) => ({
    id: l.id,
    user: l.user?.name || l.user?.email || "System",
    action: l.action,
    entity: l.entity || "",
    entityId: l.entityId || "",
    details: l.metadata || "",
    timestamp: l.createdAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data, total, page, pageSize });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await prisma.activityLog.deleteMany({});
  return NextResponse.json({ success: true, message: "Activity logs cleared" });
}
