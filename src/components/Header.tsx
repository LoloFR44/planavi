'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PlanaviLogo from '@/components/ui/PlanaviLogo';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('admin_email');
    setIsAdmin(!!email);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <PlanaviLogo size={36} />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] bg-clip-text text-transparent">
            Planavi
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-sm font-medium">
            Accueil
          </Link>
          {isAdmin && (
            <Link href="/gestion/dashboard/plannings" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-sm font-medium">
              Mes plannings
            </Link>
          )}
          <Link
            href="/gestion"
            className="px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          >
            Se connecter
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Accueil
          </Link>
          {isAdmin && (
            <Link href="/gestion/dashboard/plannings" className="block py-2 text-[#1e3a8a] text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Mes plannings
            </Link>
          )}
          <Link
            href="/gestion"
            className="block py-2 text-[#1e3a8a] text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Se connecter
          </Link>
        </div>
      )}
    </header>
  );
}
