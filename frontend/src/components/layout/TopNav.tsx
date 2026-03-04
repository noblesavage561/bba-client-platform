'use client';

export function TopNav() {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900">BBA Client Platform</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">User</span>
        <button className="text-sm text-primary-600 hover:text-primary-700">Logout</button>
      </div>
    </header>
  );
}
