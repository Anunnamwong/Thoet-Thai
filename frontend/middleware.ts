import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route prefixes each role is allowed to access
const ROLE_ROUTES: Record<string, string[]> = {
  customer: ["/", "/home", "/shop", "/cart", "/checkout", "/payment", "/orders", "/profile", "/tracking", "/legal"],
  merchant: ["/merchant", "/legal"],
  rider: ["/rider", "/legal"],
  admin: ["/admin", "/legal"],
};

// Pages that are always public
const PUBLIC_PATHS = ["/", "/legal", "/not-found"];

function getRole(request: NextRequest): string | null {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;

  try {
    // JWT payload is the middle segment (base64url encoded)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
    );
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const role = getRole(request);

  // No token → redirect to landing
  if (!role) {
    // In dev mode: allow all routes so the role selector works without auth
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check role-based access
  const allowed = ROLE_ROUTES[role] ?? [];
  const canAccess = allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!canAccess) {
    // Redirect to role's home
    const home =
      role === "merchant" ? "/merchant/dashboard"
      : role === "rider"   ? "/rider/dashboard"
      : role === "admin"   ? "/admin/dashboard"
      : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
