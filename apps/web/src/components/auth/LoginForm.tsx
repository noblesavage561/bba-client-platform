"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { buildRegisterHref, normalizeAuthRedirectUrl } from "@/lib/authRouting";

export function LoginForm({
  callbackUrl,
  initialEmail,
  registered,
}: {
  callbackUrl: string;
  initialEmail?: string;
  registered?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (!response || response.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(normalizeAuthRedirectUrl(response.url, callbackUrl));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-brand-blue">Sign in</h1>
        <p className="text-sm text-gray-500 mt-2">Access your client portal and workflow dashboard.</p>

        {registered && (
          <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Account created. Sign in to continue.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" variant="secondary" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-5 text-center">
          Need portal access?{" "}
          <Link href={buildRegisterHref(callbackUrl)} className="text-brand-blue font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
