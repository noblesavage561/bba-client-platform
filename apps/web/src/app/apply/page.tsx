import Link from "next/link";
import { DualPathwayIntake } from "@/components/intake/DualPathwayIntake";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { getPortalClient } from "@/lib/portalClient";
import { buildLoginHref, buildRegisterHref } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const { session, client } = await getPortalClient();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-blue mb-3">
            Tax Year Intelligence Wizard
          </h1>
          <p className="text-gray-600 text-lg">
            Complete a guided intake that powers AI-assisted preparation,
            confidence scoring, and proactive tax planning opportunities.
          </p>
        </div>

        {session && client ? (
          <DualPathwayIntake caseId={client.id} />
        ) : (
          <>
            <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900">
              <p className="font-semibold">Document-first intake is available after sign-in.</p>
              <p className="mt-1">
                Continue with manual intake now, or
                {" "}
                <Link
                  href={buildLoginHref(ROUTES.APPLY)}
                  className="font-semibold underline decoration-blue-700 underline-offset-2"
                >
                  sign in
                </Link>
                {" "}
                to unlock AI document upload and realtime confidence scoring.
              </p>
              <p className="mt-1">
                New here?
                {" "}
                <Link
                  href={buildRegisterHref(ROUTES.APPLY)}
                  className="font-semibold underline decoration-blue-700 underline-offset-2"
                >
                  Create your portal access
                </Link>
                .
              </p>
            </div>
            <IntakeWizard />
          </>
        )}
      </div>
    </div>
  );
}
