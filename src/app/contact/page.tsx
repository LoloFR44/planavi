'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi.');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-shadow';

  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Nous contacter</h1>
            <p className="text-gray-500">
              Une question, une suggestion ou un problème ? Envoyez-nous un message.
            </p>
          </div>

          {sent ? (
            <div className="bg-white rounded-2xl border border-[#3db54a]/20 shadow-sm p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#3db54a]/10 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Message envoyé !</h2>
              <p className="text-gray-500 mb-6">
                Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre nom *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  placeholder="jean@exemple.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Objet *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inputClass}
                  placeholder="Question sur le fonctionnement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={inputClass}
                  rows={5}
                  placeholder="Décrivez votre demande..."
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white text-base font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
