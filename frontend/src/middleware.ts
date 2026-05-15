import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth"];
const PROTECTED_PATHS = ["/scan", "/history", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));

  if (!isPublic && !isProtected) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;

  // Kirish sahifasiga token bilan kelsa — scan ga yo'naltir
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/scan", request.url));
  }

  // Himoyalangan sahifaga token bo'lmay kelsa — auth ga yo'naltir
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
