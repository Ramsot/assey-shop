import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createToken } from "@/modules/auth/auth.service";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/api/auth/admin/login",
  "/api/auth/admin/logout",
  "/hotspot",
  "/api/hotspot",
  "/api/payments/webhook",
  "/_next",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => path !== "/" && pathname.startsWith(path)
  );

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (isPublic) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    if (refreshToken) {
      const payload = await verifyToken(refreshToken);
      if (payload && payload.type === "refresh") {
        try {
          const newAccessToken = await createToken(
            { userId: payload.userId, role: payload.role, type: "access" },
            "15m"
          );
          const redirectUrl = new URL(req.url);
          const response = NextResponse.redirect(redirectUrl);
          response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
          });
          return response;
        } catch {
          // Token rotation failed, redirect to login
        }
      }
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
