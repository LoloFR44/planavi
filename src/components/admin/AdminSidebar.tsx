'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/gestion/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/gestion/dashboard/plannings', label: 'Plannings', icon: '📋' },
  { href: '/gestion/dashboard/plannings/new', label: 'Nouveau planning', icon: '➕' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/gestion');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 hidden md:block flex flex-col">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] bg-clip-text text-transparent">
          Planavi
        </Link>
        <p className="text-xs text-gray-400 mt-1">Gestion</p>
      </div>

      <nav className="space-y-1 flex-1">
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

      {/* User info + sign out */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        {user?.email && (
          <p className="text-xs text-gray-400 truncate mb-2 px-3">{user.email}</p>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
