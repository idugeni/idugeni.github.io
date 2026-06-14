import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

type SupabaseUserResult = {
  user: Awaited<ReturnType<ReturnType<typeof createSupabaseProxyClient>["auth"]["getUser"]>>["data"]["user"] | null;
};

function createSupabaseProxyClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Only set cookies on the outgoing response; incoming request cookies are read-only.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

async function getProxyUser(request: NextRequest, response: NextResponse): Promise<SupabaseUserResult> {
  try {
    const supabase = createSupabaseProxyClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { user };
  } catch {
    return { user: null };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // --- Rate Limiting for API routes ---
  if (pathname.startsWith("/api")) {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    let identifier = "api";

    if (pathname.startsWith("/api/contact")) {
      identifier = "contact";
    } else if (pathname.includes("track-view")) {
      identifier = "blog-view";
    } else if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/login")) {
      identifier = "login";
    } else if (pathname.startsWith("/api/search")) {
      identifier = "search";
    }

    const result = await checkRateLimit(identifier, ip);

    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  // --- Security Headers ---
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel-insights.vercel.app;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com;
    media-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // --- Admin route protection ---
  if (pathname.startsWith("/admin")) {
    if (process.env.DEV_BYPASS_AUTH === "true") {
      return response;
    }
    const { user } = await getProxyUser(request, response);

    // Check authentication
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check authorization (admin whitelist)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
    if (adminEmails.length === 0 || !adminEmails.includes(user.email || "")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Login page: redirect to admin if already authenticated ---
  if (pathname === "/login") {
    const { user } = await getProxyUser(request, response);

    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png, apple-icon.png (favicon files)
     * - public folder assets (images, manifest, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml)$).*)",
  ],
};
