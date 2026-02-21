import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL, getPublicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
}
