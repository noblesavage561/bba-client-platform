import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { authOptions } from "@/lib/auth";
import { normalizeCallbackPath } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = normalizeCallbackPath(callbackUrl, ROUTES.PORTAL);
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to portal
  if (session) {
    redirect(safeCallbackUrl);
  }

  return <SignupForm callbackUrl={safeCallbackUrl} />;
}
