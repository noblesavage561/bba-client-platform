import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { authOptions } from "@/lib/auth";
import { normalizeCallbackPath } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string; registered?: string }>;
}) {
  const { callbackUrl, email, registered } = await searchParams;
  const safeCallbackUrl = normalizeCallbackPath(callbackUrl, ROUTES.PORTAL);
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <LoginForm
      callbackUrl={safeCallbackUrl}
      initialEmail={typeof email === "string" ? email : ""}
      registered={registered === "1"}
    />
  );
}
