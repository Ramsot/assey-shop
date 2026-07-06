import { NextRequest, NextResponse } from "next/server";
import { deleteVoucher } from "@/modules/admin/admin.actions";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteVoucher(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete voucher" }, { status: 500 });
  }
}
