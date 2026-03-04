'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/documents', label: 'Documents' },
  { href: '/admin', label: 'Admin' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col">
      <div className="p-4 border-b border-primary-700">
        <h2 className="text-xl font-bold">BBA Platform</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'block px-4 py-2 rounded-md text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
