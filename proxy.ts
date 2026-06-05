import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // --- Admin route protection ---
  if (pathname.startsWith("/admin")) {
    const { user } = await getProxyUser(request, response);

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
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
