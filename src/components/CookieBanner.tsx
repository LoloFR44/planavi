'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't already accepted/declined
    const consent = sessionStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    sessionStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    sessionStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <p className="text-sm text-gray-600 flex-1 text-center sm:text-left">
          Ce site utilise uniquement des cookies essentiels au fonctionnement du service (session, préférences).
          Aucun cookie publicitaire ou de suivi n&apos;est utilisé.{' '}
          <a href="/mentions-legales" className="underline text-[#1e3a8a] hover:text-[#1e3a8a]/80">
            En savoir plus
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:shadow-md transition-all"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
