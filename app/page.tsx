import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
