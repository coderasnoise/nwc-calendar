import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";

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
    pathname.startsWith("/import");

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
