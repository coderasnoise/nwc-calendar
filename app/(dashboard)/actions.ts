"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const LOGIN_STARTED_AT_COOKIE = "app_login_started_at";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(LOGIN_STARTED_AT_COOKIE);
  redirect("/login");
}
