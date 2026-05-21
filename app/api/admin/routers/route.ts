import { NextRequest, NextResponse } from "next/server";
import { addRouter } from "@/modules/admin/admin.actions";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  ipAddress: z.string().min(1),
  apiPort: z.number().int().default(8728),
  username: z.string().min(1),
  password: z.string().min(1),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const router = await addRouter(data);
    return NextResponse.json(router);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to connect router" }, { status: 500 });
  }
}
