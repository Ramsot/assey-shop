import { NextRequest, NextResponse } from "next/server";
import { activateVoucher } from "@/modules/vouchers/voucher.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, mac, ip } = body;

    if (!code) {
      return NextResponse.json({ error: "Voucher code is required" }, { status: 400 });
    }

    // Activate voucher and bind to MAC
    const voucher = await activateVoucher(code, undefined, undefined); // userId and routerId can be null for now
    
    // In a real scenario, here we would call MikroTik API to bypass the MAC address
    // await RouterService.authorizeMac(mac, voucher.package.speedLimitDown, voucher.package.speedLimitUp);

    return NextResponse.json({ success: true, voucher });
  } catch (error: any) {
    console.error("Hotspot connect error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
