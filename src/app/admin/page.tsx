'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getPlanningBySlug } from '@/services/plannings';

export default function AdminPage() {
  const [mode, setMode] = useState<'choice' | 'login'>('choice');
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
      const planning = await getPlanningBySlug(slug.trim().toLowerCase());
      if (!planning) {
        setError('Nous n\'avons pas trouvé de planning avec cet identifiant. Vérifiez qu\'il est bien écrit (par exemple : maman-dupont).');
        setLoading(false);
        return;
      }

      if (password !== planning.adminPassword) {
        setError('Le mot de passe n\'est pas correct. Réessayez en vérifiant les majuscules et les minuscules.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem(`admin_${planning.id}`, 'true');
      router.push(`/admin/dashboard/plannings/${planning.id}`);
    } catch {
      setError('Un problème est survenu. Veuillez réessayer dans quelques instants.');
    } finally {
      setLoading(false);
    }
  };

  // Écran de choix initial
  if (mode === 'choice') {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-lg">
            {/* Titre et explication */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Espace organisateur
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Bienvenue ! Ici, vous pouvez organiser les visites de vos proches.
                <br />
                Que souhaitez-vous faire ?
              </p>
            </div>

            <div className="space-y-5">
              {/* Bouton : Créer un nouveau planning */}
              <div className="bg-white rounded-2xl shadow-sm border-2 border-[#3db54a] p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#3db54a]/10 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Créer un nouveau planning
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    C'est votre première fois ? Créez un planning pour permettre
                    à votre famille et vos amis de réserver des créneaux de visite.
                    C'est simple et rapide.
                  </p>
                </div>
                <Link
                  href="/admin/dashboard/plannings/new"
                  className="block w-full py-4 text-white text-lg font-semibold rounded-xl text-center hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #3db54a, #2d9639)' }}
                >
                  Créer mon planning →
                </Link>
              </div>

              {/* Bouton : Accéder à mon planning existant */}
              <div className="bg-white rounded-2xl shadow-sm border-2 border-[#1e3a8a] p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Accéder à mon planning existant
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Vous avez déjà créé un planning et vous souhaitez le consulter
                    ou le modifier ? Connectez-vous avec votre identifiant et votre
                    mot de passe.
                  </p>
                </div>
                <button
                  onClick={() => setMode('login')}
                  className="block w-full py-4 text-white text-lg font-semibold rounded-xl text-center hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
                >
                  Me connecter →
                </button>
              </div>
            </div>

            {/* Lien retour */}
            <div className="mt-6 text-center">
              <Link href="/" className="text-base text-gray-400 hover:text-gray-600">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Écran de connexion
  return (
    <>
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          {/* Titre et explication */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Connexion à votre planning
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Entrez les informations que vous avez choisies lors de la création
              de votre planning.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ identifiant */}
              <div>
                <label htmlFor="slug" className="block text-base font-semibold text-gray-700 mb-2">
                  Identifiant de votre planning
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  C'est le nom court que vous avez choisi, par exemple : <strong>maman-dupont</strong>
                </p>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Tapez votre identifiant ici"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  disabled={loading}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Champ mot de passe */}
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  C'est le mot de passe que vous avez choisi lors de la création du planning.
                </p>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tapez votre mot de passe ici"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  disabled={loading}
                  required
                />
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-base px-5 py-4 rounded-xl">
                  {error}
                </div>
              )}

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading || !slug || !password}
                className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
              >
                {loading ? 'Connexion en cours...' : 'Me connecter'}
              </button>
            </form>

            {/* Liens en bas */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-center">
              <button
                onClick={() => { setMode('choice'); setError(''); }}
                className="block w-full text-base text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
              >
                ← Revenir au choix précédent
              </button>
              <p className="text-sm text-gray-400">
                Vous n'avez pas encore de planning ?{' '}
                <Link href="/admin/dashboard/plannings/new" className="text-[#3db54a] hover:underline font-medium">
                  Créez-en un ici
                </Link>
              </p>
            </div>
          </div>

          {/* Aide */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Besoin d'aide ?</strong> Si vous avez oublié votre identifiant
              ou votre mot de passe, contactez la personne qui vous a aidé à créer
              votre planning.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
