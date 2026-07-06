import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ email: { contains: search } }, { name: { contains: search } }];

  const [users, total] = await Promise.all([
    prisma.adminUser.findMany({
      where: where as any,
      include: { role: true, _count: { select: { sessions: true, notifications: true } } },
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adminUser.count({ where: where as any }),
  ]);

  const sanitized = users.map(({ passwordHash, twoFactorSecret, recoveryCodes, ...u }) => u);

  return NextResponse.json({ success: true, data: sanitized, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const passwordHash = await hashPassword(body.password);

    const newUser = await prisma.adminUser.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        roleId: body.roleId || null,
        isActive: body.isActive ?? true,
      },
      include: { role: true },
    });

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { error: signUpError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { emailRedirectTo: undefined },
    });
    if (signUpError) {
      console.error("Supabase signup error during user creation:", signUpError);
    }

    const { passwordHash: _, twoFactorSecret, recoveryCodes, ...sanitized } = newUser;
    return NextResponse.json({ success: true, data: sanitized }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
