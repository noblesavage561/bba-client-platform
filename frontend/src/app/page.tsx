import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">
          BBA Client Platform
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Client intake, financials, automation, and admin dashboard
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
