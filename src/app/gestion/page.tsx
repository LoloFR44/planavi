'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getPlanningsByEmail, updatePlanning } from '@/services/plannings';
import type { Planning } from '@/types';

function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export default function AdminPage() {
  const [mode, setMode] = useState<'choice' | 'login' | 'reset'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const results = await getPlanningsByEmail(email.trim().toLowerCase());
      if (results.length === 0) {
        setError('Aucun planning trouvé avec cet email. Vérifiez l\'adresse saisie.');
        setLoading(false);
        return;
      }

      // Find a planning matching the password
      const matching = results.find((p) => p.adminPassword === password);
      if (!matching) {
        setError('Le mot de passe n\'est pas correct. Vérifiez les majuscules et minuscules.');
        setLoading(false);
        return;
      }

      // Sauvegarder la session admin
      sessionStorage.setItem('admin_email', email.trim().toLowerCase());
      for (const p of results) {
        if (p.adminPassword === password) {
          sessionStorage.setItem(`admin_${p.id}`, 'true');
        }
      }

      // Si plusieurs plannings, aller à la liste, sinon directement au planning
      if (results.filter((p) => p.adminPassword === password).length > 1) {
        router.push('/gestion/dashboard');
      } else {
        router.push(`/gestion/dashboard/plannings/${matching.id}`);
      }
    } catch {
      setError('Un problème est survenu. Veuillez réessayer dans quelques instants.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResetDone(false);

    try {
      const results = await getPlanningsByEmail(email.trim().toLowerCase());
      if (results.length === 0) {
        setError('Aucun planning trouvé avec cet email. Vérifiez l\'adresse saisie.');
        setLoading(false);
        return;
      }

      setPlannings(results);
      const pwd = generatePassword();
      setNewPassword(pwd);

      // Update all plannings with this email
      for (const p of results) {
        await updatePlanning(p.id, { adminPassword: pwd });
      }

      setResetDone(true);
    } catch {
      setError('Un problème est survenu. Veuillez réessayer.');
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
              {/* Créer un nouveau planning */}
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
                    C&apos;est votre première fois ? Créez un planning pour permettre
                    à votre famille et vos amis de réserver des créneaux de visite.
                    C&apos;est simple et rapide.
                  </p>
                </div>
                <Link
                  href="/gestion/dashboard/plannings/new"
                  className="block w-full py-4 text-white text-lg font-semibold rounded-xl text-center hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #3db54a, #2d9639)' }}
                >
                  Créer mon planning →
                </Link>
              </div>

              {/* Accéder à mon planning */}
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
                    ou le modifier ? Connectez-vous avec votre email et votre
                    mot de passe.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="block w-full py-4 text-white text-lg font-semibold rounded-xl text-center hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
                >
                  Me connecter →
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-base text-gray-400 hover:text-gray-600">
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Écran de réinitialisation de mot de passe
  if (mode === 'reset') {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Mot de passe oublié
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Entrez l&apos;email que vous avez utilisé lors de la création de votre planning.
                Un nouveau mot de passe sera généré.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              {resetDone ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#3db54a]/10 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Nouveau mot de passe généré</h2>
                  <p className="text-base text-gray-600">
                    Voici votre nouveau mot de passe. <strong>Notez-le précieusement</strong> :
                  </p>
                  <div className="bg-gray-50 border-2 border-[#1e3a8a] rounded-xl p-4">
                    <p className="text-2xl font-mono font-bold text-[#1e3a8a] tracking-wider select-all">
                      {newPassword}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ce mot de passe a été appliqué à {plannings.length > 1 ? `vos ${plannings.length} plannings` : 'votre planning'}.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setResetDone(false); setError(''); setPassword(''); }}
                    className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
                  >
                    Me connecter avec ce mot de passe
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-6">
                  <div>
                    <label htmlFor="reset-email" className="block text-base font-semibold text-gray-700 mb-2">
                      Votre adresse email
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      L&apos;email que vous avez renseigné en créant votre planning.
                    </p>
                    <input
                      type="email"
                      id="reset-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.fr"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                      disabled={loading}
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-base px-5 py-4 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
                  >
                    {loading ? 'Génération en cours...' : 'Générer un nouveau mot de passe'}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button
                  onClick={() => { setMode('choice'); setError(''); setResetDone(false); }}
                  className="text-base text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
                >
                  ← Revenir au choix précédent
                </button>
              </div>
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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Connexion à votre planning
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Entrez l&apos;email et le mot de passe que vous avez choisis
              lors de la création de votre planning.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                  Votre adresse email
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  L&apos;email que vous avez renseigné en créant votre planning.
                </p>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Le mot de passe que vous avez choisi lors de la création.
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-base px-5 py-4 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
              >
                {loading ? 'Connexion en cours...' : 'Me connecter'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-center">
              <button
                onClick={() => { setMode('reset'); setError(''); }}
                className="block w-full text-base text-red-500 hover:text-red-700 font-medium"
              >
                Mot de passe oublié ?
              </button>
              <button
                onClick={() => { setMode('choice'); setError(''); }}
                className="block w-full text-base text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
              >
                ← Revenir au choix précédent
              </button>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Besoin d&apos;aide ?</strong> Si vous avez oublié votre email,
              contactez la personne qui vous a aidé à créer votre planning.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
