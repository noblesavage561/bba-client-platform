import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { authOptions } from "@/lib/auth";
import { normalizeCallbackPath } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = normalizeCallbackPath(callbackUrl, ROUTES.PORTAL);
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(safeCallbackUrl);
  }

  return <LoginForm callbackUrl={safeCallbackUrl} />;
}
