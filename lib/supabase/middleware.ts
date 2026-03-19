import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";

const LOGIN_STARTED_AT_COOKIE = "app_login_started_at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none" | boolean;
  };
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL, getPublicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/patients") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/timeline") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/internal") ||
    pathname.startsWith("/import");

  if (user) {
    const { data: exemptUser } = await supabase
      .from("session_timeout_exempt_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isExempt = Boolean(exemptUser);

    if (!isExempt) {
      const startedAtCookie = request.cookies.get(LOGIN_STARTED_AT_COOKIE)?.value;
      const startedAt = startedAtCookie ? Number(startedAtCookie) : Number.NaN;

      if (!Number.isFinite(startedAt)) {
        await supabase.auth.signOut();

        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "?error=Session%20expired";

        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie);
        });
        redirectResponse.cookies.delete(LOGIN_STARTED_AT_COOKIE);
        return redirectResponse;
      }

      if (Date.now() - startedAt > SESSION_TIMEOUT_MS) {
        await supabase.auth.signOut();

        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "?error=Session%20expired";

        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie);
        });
        redirectResponse.cookies.delete(LOGIN_STARTED_AT_COOKIE);
        return redirectResponse;
      }
    } else if (request.cookies.get(LOGIN_STARTED_AT_COOKIE)) {
      response.cookies.delete(LOGIN_STARTED_AT_COOKIE);
    }
  }

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
