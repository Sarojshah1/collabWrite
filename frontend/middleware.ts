import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple UX cookie flag (set on login/signup). We still use Bearer token for API auth.
const AUTH_COOKIE = "cw_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";

  // If authed and visiting public entry pages, push to dashboard
  if (isAuthed && (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If not authed and visiting protected dashboard, send to login
  if (!isAuthed && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard", "/dashboard/:path*"],
};
