import { NextRequest, NextResponse } from "next/server";
import { getPackages, createPackage } from "@/modules/admin/admin-management.actions";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["TIME", "DATA", "UNLIMITED"]),
  price: z.number().positive(),
  duration: z.number().int().positive().optional(),
  dataLimit: z.number().int().positive().optional(),
  speedLimitUp: z.string().optional(),
  speedLimitDown: z.string().optional(),
  deviceLimit: z.number().int().positive().default(1),
});

export async function GET() {
  const packages = await getPackages();
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const pkg = await createPackage(data);
    return NextResponse.json(pkg);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
  }
}
