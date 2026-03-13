import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { authOptions } from "@/lib/auth";
import { normalizeCallbackPath } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string; businessName?: string; fromIntake?: string }>;
}) {
  const { callbackUrl, email, businessName, fromIntake } = await searchParams;
  const safeCallbackUrl = normalizeCallbackPath(callbackUrl, ROUTES.PORTAL);
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <RegisterForm
      callbackUrl={safeCallbackUrl}
      initialEmail={typeof email === "string" ? email : ""}
      initialBusinessName={typeof businessName === "string" ? businessName : ""}
      fromIntake={fromIntake === "1"}
    />
  );
}