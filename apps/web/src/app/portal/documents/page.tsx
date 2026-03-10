import { DocumentUpload } from "@/components/portal/DocumentUpload";
import Link from "next/link";
import { getPortalClient } from "@/lib/portalClient";
import { buildLoginHref } from "@/lib/authRouting";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { session, client } = await getPortalClient();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">Sign in required</h1>
          <p className="text-gray-500 mt-2">Please sign in to upload tax documents.</p>
          <Link href={buildLoginHref(ROUTES.PORTAL_DOCUMENTS)} className="inline-block mt-6 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">No client profile found</h1>
          <p className="text-gray-500 mt-2">Complete intake first to enable secure document uploads.</p>
          <Link href={ROUTES.APPLY} className="inline-block mt-6 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
            Start Intake
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-blue text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Document Center</h1>
          <p className="text-slate-200 mt-1">
            Upload, classify, and track tax documents with AI confidence scoring.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DocumentUpload clientId={client.id} />
      </div>
    </div>
  );
}
