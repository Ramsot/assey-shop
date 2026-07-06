import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const suspendedParam = searchParams.get("suspended");

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }];
  if (suspendedParam === "true") where.isSuspended = true;
  if (suspendedParam === "false") where.isSuspended = false;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: where as any,
      include: { _count: { select: { orders: true, reviews: true } } },
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where: where as any }),
  ]);

  return NextResponse.json({ success: true, data: customers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const customer = await prisma.customer.create({ data: { email: body.email, firstName: body.firstName, lastName: body.lastName, phone: body.phone } });
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 });
  }
}
