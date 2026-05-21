import { NextRequest, NextResponse } from "next/server";
import { RouterService } from "@/modules/routers/router.service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await RouterService.syncRouterStatus(id);
    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to sync router" }, { status: 500 });
  }
}
