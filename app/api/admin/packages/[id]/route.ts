import { NextRequest, NextResponse } from "next/server";
import { updatePackage, deletePackage } from "@/modules/admin/admin-management.actions";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const pkg = await updatePackage(id, body);
    return NextResponse.json(pkg);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePackage(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
