import { NextResponse } from "next/server";
import { seedAdmin } from "@/lib/admin-seed";

export async function POST() {
  try {
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
