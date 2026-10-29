import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/utils/rate-limit";

// ─── Security Headers ────────────────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) =>
    response.headers.set(key, value)
  );
  return response;
}

// ─── IP Extraction ────────────────────────────────────────────────────────────
function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Rate Limit Config ────────────────────────────────────────────────────────
const HOUR_MS = 60 * 60 * 1000;

// POST /api/v1/inquiries — configurable via env, default 10/hr/IP
// Change in Vercel Dashboard → Settings → Environment Variables → INQUIRY_RATE_LIMIT
const INQUIRY_RATE_LIMIT = Number(process.env.INQUIRY_RATE_LIMIT) || 10;
// POST /api/v1/auth/login — hardcoded 10/hr/IP (security-critical, don't expose to env)
const LOGIN_RATE_LIMIT = 10;

// ─── Route Matchers ───────────────────────────────────────────────────────────
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

function isAdminLoginPage(pathname: string): boolean {
  return pathname === "/admin/login";
}

function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/v1/admin");
}

function isLoginApiRoute(pathname: string): boolean {
  // Auth login API
  return pathname === "/api/v1/auth/login";
}

function isInquiryPostRoute(pathname: string): boolean {
  return pathname === "/api/v1/inquiries";
}

// ─── Main Middleware ──────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIP(request);
  const method = request.method;

  // ── 1. Rate limit: Login endpoint (10 req/hr/IP) ─────────────────────────
  if (isLoginApiRoute(pathname) && method === "POST") {
    const result = rateLimit(`${ip}:login`, LOGIN_RATE_LIMIT, HOUR_MS);
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many login attempts. Try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // ── 2. Rate limit: Inquiry submission (5 req/hr/IP) ────────────────────────
  if (isInquiryPostRoute(pathname) && method === "POST") {
    const result = rateLimit(`${ip}:inquiry`, INQUIRY_RATE_LIMIT, HOUR_MS);
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many inquiry submissions. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // ── 3. Refresh session ONLY for admin or auth routes (Bypass for public pages for 0ms speed) ──
  const requiresAuthCheck = isAdminRoute(pathname) || isAdminApiRoute(pathname) || isLoginApiRoute(pathname);
  
  let response = NextResponse.next({ request });
  let user = null;

  if (requiresAuthCheck) {
    const { supabaseResponse, user: sessionUser } = await updateSession(request);
    response = supabaseResponse;
    user = sessionUser;
  }

  // ── 4. Protect /admin/* (except /admin/login) ─────────────────────────────
  if (isAdminRoute(pathname) && !isAdminLoginPage(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("redirect", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      applySecurityHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  // ── 5. Protect Admin API routes ────────────────────────────────────────────
  if (isAdminApiRoute(pathname)) {
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // ── 6. Redirect authenticated admin away from login page ──────────────────
  if (isAdminLoginPage(pathname) && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // ── 7. Apply security headers to all responses ────────────────────────────
  applySecurityHeaders(response);
  return response;
}

// ─── Matcher: Skip static files & Next.js internals ──────────────────────────
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
