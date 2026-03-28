'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getPlanningBySlug } from '@/services/plannings';

export default function AdminLoginPage() {
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const planning = await getPlanningBySlug(slug.trim());
      if (!planning) {
        setError('Planning introuvable. Vérifiez le slug.');
        setLoading(false);
        return;
      }

      if (password !== planning.adminPassword) {
        setError('Mot de passe incorrect.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem(`admin_${planning.id}`, 'true');
      router.push(`/admin/dashboard/plannings/${planning.id}`);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace administration</h1>
              <p className="text-sm text-gray-500">
                Connectez-vous pour gérer votre planning de visites.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Identifiant du planning (slug)
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex : maman-dupont"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe admin
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !slug || !password}
                className="w-full py-3 text-white font-semibold rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/admin/dashboard/plannings/new" className="block text-sm text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium">
                Créer un nouveau planning
              </Link>
              <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
