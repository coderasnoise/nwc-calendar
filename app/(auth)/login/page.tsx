import { login, signup } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto mt-14 max-w-md">
      <Card className="space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="mt-1 text-sm text-slate-500">Access the clinic operations dashboard.</p>
        </div>

        <form className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <Input name="email" type="email" required className="mt-1" placeholder="you@example.com" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <Input name="password" type="password" required className="mt-1" placeholder="********" />
          </label>

          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="flex gap-2">
            <Button type="submit" formAction={login}>
              Login
            </Button>
            <Button type="submit" formAction={signup} variant="secondary">
              Sign up
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
