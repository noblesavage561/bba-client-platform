import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Intake | BBA Client Platform",
};

const fields = [
  { id: "firstName", label: "First Name", type: "text", required: true },
  { id: "lastName", label: "Last Name", type: "text", required: true },
  { id: "email", label: "Email Address", type: "email", required: true },
  { id: "phone", label: "Phone Number", type: "tel", required: false },
  { id: "company", label: "Company / Organization", type: "text", required: false },
  { id: "service", label: "Service Requested", type: "text", required: true },
];

export default function IntakePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Client Intake</h1>
        <p className="mt-1 text-sm text-gray-500">
          Onboard new clients and manage the intake pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Intake form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              New Client Form
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {fields.map(({ id, label, type, required }) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {label}
                      {required && (
                        <span className="ml-1 text-red-500" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>
                    <input
                      id={id}
                      name={id}
                      type={type}
                      required={required}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Intake Form
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Pipeline status */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Pipeline Status
            </h2>
            <ul className="space-y-3">
              {[
                { stage: "New Submissions", count: 0, color: "bg-blue-100 text-blue-700" },
                { stage: "Under Review", count: 0, color: "bg-yellow-100 text-yellow-700" },
                { stage: "Approved", count: 0, color: "bg-green-100 text-green-700" },
                { stage: "Onboarded", count: 0, color: "bg-purple-100 text-purple-700" },
              ].map(({ stage, count, color }) => (
                <li
                  key={stage}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-700">{stage}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
