import { NextResponse } from "next/server";
import { seedAdmin } from "@/lib/admin-seed";
import { getCurrentUser } from "@/lib/admin-auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const result = await seedAdmin();
    return NextResponse.json({
      success: true,
      message: "Admin panel seeded successfully",
      data: { email: result.adminUser.email, role: result.adminRole.name },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "Seed failed" }, { status: 500 });
  }
}
