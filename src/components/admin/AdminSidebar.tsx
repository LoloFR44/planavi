'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/dashboard/plannings', label: 'Plannings', icon: '📋' },
  { href: '/admin/dashboard/plannings/new', label: 'Nouveau planning', icon: '➕' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] bg-clip-text text-transparent">
          Planavi
        </Link>
        <p className="text-xs text-gray-400 mt-1">Administration</p>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1e3a8a]/5 text-[#1e3a8a]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
