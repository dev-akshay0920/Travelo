import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isJwtFormat(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

function getAccessToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("travora_access_token");
  const header = request.headers.get("authorization");
  const fromHeader = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

  return cookie?.value ?? fromHeader ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/traveller") || pathname.startsWith("/agency") || pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = getAccessToken(request);

  if (!token || !isJwtFormat(token)) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/traveller/:path*", "/agency/:path*", "/admin/:path*"],
};
