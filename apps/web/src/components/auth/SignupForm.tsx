"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Automatically sign in after successful signup
      const signInResponse = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      setLoading(false);

      if (!signInResponse || signInResponse.error) {
        // Account created but login failed - redirect to login page
        router.push(`/auth/login?message=Account created successfully. Please sign in.`);
        return;
      }

      // Success - redirect to callback URL
      router.push(signInResponse.url ?? callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-brand-blue">Create Account</h1>
        <p className="text-sm text-gray-500 mt-2">
          Sign up to access your personalized tax services portal.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="John Doe"
          />

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
          />

          <Select
            label="Account Type"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            options={[
              { value: "CLIENT", label: "Client" },
              { value: "SUPER_ADMIN", label: "Admin" },
              { value: "PROGRAM_MANAGER", label: "Program Manager" },
              { value: "COMPLIANCE", label: "Compliance" },
              { value: "FINANCE", label: "Finance" },
              { value: "CLIENT_SUCCESS", label: "Client Success" },
            ]}
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

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
