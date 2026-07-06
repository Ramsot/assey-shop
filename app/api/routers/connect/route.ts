import { NextRequest, NextResponse } from "next/server";
import { RouterService } from "@/modules/routers/router.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ipAddress, apiPort, username, password, location } = body;

    if (!name || !ipAddress || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const router = await RouterService.connectRouter({
      name,
      ipAddress,
      apiPort: parseInt(apiPort) || 8728,
      username,
      password,
      location,
    });

    return NextResponse.json(router);
  } catch (error: any) {
    console.error("Router connect error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
