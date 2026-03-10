import Link from "next/link";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ROUTES } from "@/lib/routes";

async function createClient(formData: FormData) {
  "use server";

  const businessName = String(formData.get("businessName") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const ownerPassword = String(formData.get("ownerPassword") ?? "");
  const programTrack = String(formData.get("programTrack") ?? "").trim();

  if (!businessName || !ownerEmail || !ownerPassword) {
    redirect(`${ROUTES.ADMIN_CLIENT_NEW}?error=${encodeURIComponent("Business name, owner email, and password are required.")}`);
  }

  if (ownerPassword.length < 8) {
    redirect(`${ROUTES.ADMIN_CLIENT_NEW}?error=${encodeURIComponent("Owner password must be at least 8 characters.")}`);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
    include: { client: { select: { id: true } } },
  });

  if (existingUser?.client) {
    redirect(`${ROUTES.ADMIN_CLIENT_NEW}?error=${encodeURIComponent("That owner already has a client profile.")}`);
  }

  const hashedPassword = await hash(ownerPassword, 10);

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: ownerName || existingUser.name,
          role: "CLIENT",
          hashedPassword,
        },
      })
    : await prisma.user.create({
        data: {
          email: ownerEmail,
          name: ownerName || businessName,
          role: "CLIENT",
          hashedPassword,
        },
      });

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      businessName,
      programTrack: programTrack || null,
      stage: "LEAD",
      readinessScore: 0,
    },
  });

  redirect(`${ROUTES.ADMIN_CLIENTS}/${client.id}`);
}

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={ROUTES.ADMIN_CLIENTS} className="hover:text-brand-blue">
          Clients
        </Link>
        <span>/</span>
        <span className="text-brand-blue font-medium">Add Client</span>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-brand-blue">Add Client</h1>
        <p className="text-gray-500 mt-1">Create a client record and owner login credentials.</p>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form action={createClient} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessName">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerName">
                Owner Name
              </label>
              <input
                id="ownerName"
                name="ownerName"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="programTrack">
                Program Track
              </label>
              <input
                id="programTrack"
                name="programTrack"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerEmail">
                Owner Email
              </label>
              <input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerPassword">
                Owner Password
              </label>
              <input
                id="ownerPassword"
                name="ownerPassword"
                type="password"
                minLength={8}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors"
            >
              Create Client
            </button>
            <Link
              href={ROUTES.ADMIN_CLIENTS}
              className="border border-gray-200 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
