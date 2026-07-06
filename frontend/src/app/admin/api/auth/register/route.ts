import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function POST(request: Request) {
  try {
    const existingAdmin = await prisma.adminUser.findFirst();
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: "Admin already exists" }, { status: 400 });
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Find or create admin role
    let adminRole = await prisma.role.findUnique({ where: { name: "Super Admin" } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: "Super Admin", description: "Full system access", isSystem: true },
      });
      const defaultPerms = ["dashboard.view", "products.manage", "orders.manage", "customers.manage", "settings.manage"];
      for (const slug of defaultPerms) {
        const perm = await prisma.permission.upsert({
          where: { slug },
          update: {},
          create: { name: slug, slug, group: "General" },
        });
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: adminRole.id, permissionId: perm.id },
        });
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.adminUser.create({
      data: { email, passwordHash, name, roleId: adminRole.id },
    });

    await prisma.adminProfile.create({
      data: { userId: user.id },
    });

    // Create Supabase Auth user
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined },
    });

    if (signUpError) {
      console.error("Supabase signup error:", signUpError);
    }

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
