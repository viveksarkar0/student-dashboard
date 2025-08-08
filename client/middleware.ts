import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const session = req.cookies.get(process.env.NEXT_PUBLIC_COOKIE_NAME || "token")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname.startsWith("/auth");

  // If accessing protected routes without a session → send to login with next
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If already authenticated and visiting auth pages → send to `next` or dashboard
  if (isAuthPage && session) {
    const next = searchParams.get("next");
    const url = req.nextUrl.clone();
    url.pathname = next || "/dashboard";
    url.search = ""; // clear query params
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth/:path*"],
};


