import { NextRequest, NextResponse } from "next/server";
import { getAdmins, createAdmin } from "@/modules/admin/admin-management.actions";
import { z } from "zod";

const createSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().default("OPERATOR"),
});

export async function GET() {
  const admins = await getAdmins();
  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const result = await createAdmin(data);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create admin" }, { status: 500 });
  }
}
