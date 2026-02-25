"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(50, "Username is too long.")
    .regex(/^[a-z0-9._-]+$/i, "Username contains invalid characters."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: String(formData.get("username") ?? "").trim(),
    password: String(formData.get("password") ?? "")
  });

  if (!parsed.success) {
    redirect("/login?error=Invalid%20credentials%20format.");
  }

  const supabase = await createClient();
  const normalizedUsername = parsed.data.username.toLowerCase();
  const { data: emailFromUsername, error: lookupError } = await supabase.rpc(
    "get_login_email_by_username",
    {
      p_username: normalizedUsername
    }
  );

  if (lookupError || typeof emailFromUsername !== "string" || emailFromUsername.length === 0) {
    redirect("/login?error=Invalid%20username%20or%20password.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailFromUsername,
    password: parsed.data.password
  });

  if (error) {
    redirect("/login?error=Invalid%20username%20or%20password.");
  }

  redirect("/dashboard");
}
