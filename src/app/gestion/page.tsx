'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getPlanningsByEmail, migratePlanningToAuth } from '@/services/plannings';

export default function AdminPage() {
  const { user, loading: authLoading, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'choice' | 'login' | 'register' | 'reset'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/gestion/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email.trim().toLowerCase(), password);

      // Migrate existing plannings that don't have adminUid yet
      const plannings = await getPlanningsByEmail(email.trim().toLowerCase());
      const currentUser = (await import('@/firebase/config')).auth.currentUser;
      if (currentUser) {
        for (const p of plannings) {
          if (!p.adminUid) {
            await migratePlanningToAuth(p.id, currentUser.uid);
          }
        }
      }

      router.push('/gestion/dashboard');
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
      } else if (code === 'auth/wrong-password') {
        setError('Mot de passe incorrect.');
      } else if (code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
      } else {
        setError('Un problème est survenu. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password);

      // Store admin name in sessionStorage for use when creating planning
      if (adminName.trim()) {
        sessionStorage.setItem('admin_name', adminName.trim());
      }

      router.push('/gestion/dashboard/plannings/new');
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email. Essayez de vous connecter.');
      } else if (code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible. Minimum 6 caractères.');
      } else if (code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else {
        setError('Un problème est survenu. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setResetSent(true);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cet email.');
      } else {
        setError('Un problème est survenu. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything while checking auth state
  if (authLoading) return null;
  if (user) return null;

  // Choice screen
  if (mode === 'choice') {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Espace organisateur</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Bienvenue ! Ici, vous pouvez organiser les visites de vos proches.
                <br />
                Que souhaitez-vous faire ?
              </p>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border-2 border-[#3db54a] p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#3db54a]/10 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Créer un nouveau planning</h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    C&apos;est votre première fois ? Créez un compte et un planning pour permettre à votre famille et vos amis de réserver des créneaux de visite.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className="block w-full py-4 text-white text-lg font-semibold rounded-xl text-center hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #3db54a, #2d9639)' }}
                >
                  Créer mon compte →
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border-2 border-[#1e3a8a] p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Accéder à mon planning existant</h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Vous avez déjà un compte ? Connectez-vous pour gérer vos plannings.
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

  // Register screen
  if (mode === 'register') {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Créer votre compte</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Renseignez vos informations pour commencer à organiser les visites.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="reg-name" className="block text-base font-semibold text-gray-700 mb-2">
                    Votre prénom *
                  </label>
                  <input
                    type="text"
                    id="reg-name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="ex : Loic"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#3db54a] focus:border-[#3db54a]"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-base font-semibold text-gray-700 mb-2">
                    Votre adresse email *
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#3db54a] focus:border-[#3db54a]"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-pwd" className="block text-base font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="reg-pwd"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#3db54a] focus:border-[#3db54a]"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="reg-pwd2" className="block text-base font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    id="reg-pwd2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#3db54a] focus:border-[#3db54a]"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-base px-5 py-4 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password || !adminName}
                  className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #3db54a, #2d9639)' }}
                >
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-base text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
                >
                  Déjà un compte ? Se connecter
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => { setMode('choice'); setError(''); }} className="text-base text-gray-400 hover:text-gray-600">
                ← Retour
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Reset screen
  if (mode === 'reset') {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Mot de passe oublié</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Entrez votre email, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#3db54a]/10 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Email envoyé !</h2>
                  <p className="text-base text-gray-600">
                    Vérifiez votre boîte email (et vos spams). Cliquez sur le lien reçu pour choisir un nouveau mot de passe.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); setError(''); setPassword(''); }}
                    className="w-full py-4 text-white text-lg font-semibold rounded-xl hover:shadow-md transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2d4fa8)' }}
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-6">
                  <div>
                    <label htmlFor="reset-email" className="block text-base font-semibold text-gray-700 mb-2">
                      Votre adresse email
                    </label>
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
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button
                  onClick={() => { setMode('choice'); setError(''); setResetSent(false); }}
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

  // Login screen
  return (
    <>
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Connexion</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Connectez-vous pour accéder à vos plannings.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
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
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
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
                onClick={() => { setMode('register'); setError(''); }}
                className="block w-full text-base text-[#3db54a] hover:text-[#2d9639] font-medium"
              >
                Pas encore de compte ? S&apos;inscrire
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
              <strong>Besoin d&apos;aide ?</strong> Si vous aviez un ancien compte avec mot de passe,
              utilisez &quot;Mot de passe oublié&quot; pour en créer un nouveau sécurisé.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
