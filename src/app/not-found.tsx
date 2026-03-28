import Header from '@/components/Header';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="text-center px-4">
          <div className="text-7xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Page introuvable</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </>
  );
}
