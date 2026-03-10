import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-brand-blue">Page not found</h1>
        <p className="text-gray-500 mt-2">The page you requested does not exist or has moved.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={ROUTES.HOME} className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
            Home
          </Link>
          <Link href={ROUTES.PORTAL} className="border border-gray-200 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
