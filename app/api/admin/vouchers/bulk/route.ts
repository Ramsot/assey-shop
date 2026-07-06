import { NextRequest, NextResponse } from "next/server";
import { bulkGenerateVouchers } from "@/modules/admin/admin.actions";
import { z } from "zod";

const schema = z.object({
  packageId: z.string().min(1),
  count: z.number().int().min(1).max(1000),
  routerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packageId, count, routerId } = schema.parse(body);
    const result = await bulkGenerateVouchers(packageId, count, routerId);
    return NextResponse.json({ count: result.count });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to generate vouchers" }, { status: 500 });
  }
}
