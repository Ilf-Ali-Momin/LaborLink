import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session cookie and redirects signed-out visitors away
 * from app areas. This is a convenience, not a security boundary — every
 * page and server action re-checks auth itself (SECURITY.md).
 *
 * Next.js 16 replaced the `middleware` convention with `proxy`, which runs
 * on the Node.js runtime. That matters here: the Supabase SSR client pulls
 * in code referencing __dirname, which does not exist on Edge and 500s
 * every request.
 *
 * The session logic is inlined rather than imported from lib/ because
 * Vercel bundles this file separately and cannot resolve the "@/" alias
 * inside that bundle.
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/dashboard") || path.startsWith("/employer");

  // Fast path for visitors with no session at all. Supabase stores its
  // session in cookies prefixed "sb-", so their absence is proof there is
  // nothing to validate — and validating costs a network round-trip to
  // Frankfurt on every single page view.
  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (!hasSessionCookie) {
    if (!needsAuth) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getUser: the session
  // refresh depends on this exact call order.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Everything except static assets, images, and the Stripe webhook —
    // that endpoint authenticates by signature, not by session cookie, so
    // refreshing a Supabase session for it is pure overhead.
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
