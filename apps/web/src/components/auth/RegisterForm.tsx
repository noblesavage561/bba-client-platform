"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthRedirectUrl } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

interface RegisterFormProps {
  callbackUrl: string;
  initialEmail?: string;
  initialBusinessName?: string;
  fromIntake?: boolean;
}

export function RegisterForm({
  callbackUrl,
  initialEmail,
  initialBusinessName,
  fromIntake,
}: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [businessName, setBusinessName] = useState(initialBusinessName ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          email,
          businessName: businessName || undefined,
          password,
        }),
      });

      const payload = await response.json().catch(() => ({ error: "Registration failed" }));

      if (!response.ok) {
        setError(payload.error ?? "Registration failed");
        return;
      }

      const signInResponse = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (!signInResponse || signInResponse.error) {
        router.push(
          `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=1&email=${encodeURIComponent(email)}`
        );
        return;
      }

      router.push(normalizeAuthRedirectUrl(signInResponse.url, callbackUrl));
      router.refresh();
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-brand-blue">Create your portal sign-in</h1>
        <p className="text-sm text-gray-500 mt-2">
          {fromIntake
            ? "Finish setup to access your dashboard, checklist, and document center."
            : "Set your credentials to access your secure client portal."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g., Jordan Smith"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Business Name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="e.g., Apex Holdings LLC"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            helperText="Use at least 8 characters."
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" variant="secondary" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-5 text-center">
          Already have credentials?{" "}
          <Link
            href={`${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email)}`}
            className="text-brand-blue font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}