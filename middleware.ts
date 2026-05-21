import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createToken } from "@/modules/auth/auth.service";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/api/auth/admin/login",
  "/hotspot",
  "/api/hotspot",
  "/_next",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
  );

  // 2. Public Path Check
  if (pathname === "/" || PUBLIC_PATHS.some((path) => path !== "/" && pathname.startsWith(path))) {
    return response;
  }

  // 3. Auth Check
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    if (refreshToken) {
      // Try to rotate tokens
      const payload = await verifyToken(refreshToken);
      if (payload && payload.type === "refresh") {
        const newAccessToken = await createToken(
          { userId: payload.userId, role: payload.role, type: "access" },
          "15m"
        );
        const nextResponse = NextResponse.redirect(req.url);
        nextResponse.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60,
        });
        return nextResponse;
      }
    }
    
    // Redirect to login if not authenticated
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    // Access token expired or invalid
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
