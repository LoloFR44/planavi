import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Link from 'next/link';

const USE_CASES = [
  {
    icon: '🏠',
    title: 'Parent à domicile',
    description: 'Coordonnez les visites chez un parent âgé qui vit seul, sans multiplier les appels.',
  },
  {
    icon: '🏥',
    title: 'Hospitalisation',
    description: 'Organisez les visites pendant une hospitalisation pour éviter les doublons.',
  },
  {
    icon: '🏡',
    title: 'EHPAD / Maison de retraite',
    description: 'Un planning clair pour les familles et le personnel soignant.',
  },
  {
    icon: '🤝',
    title: 'Aide à domicile',
    description: 'Coordonnez aidants, famille et amis autour d\'une personne qui a besoin de soutien.',
  },
];

const STEPS = [
  { step: '1', title: 'Créez un planning', description: 'Renseignez les informations de la personne visitée et configurez les créneaux.' },
  { step: '2', title: 'Partagez le lien', description: 'Envoyez le lien public à la famille et aux proches par SMS, email ou WhatsApp.' },
  { step: '3', title: 'Les proches réservent', description: 'Chacun choisit son créneau en un clic, sans créer de compte.' },
];

const BENEFITS = [
  { icon: '✓', text: 'Sans inscription pour les visiteurs' },
  { icon: '✓', text: 'Plusieurs visiteurs par créneau' },
  { icon: '✓', text: 'Mise à jour en temps réel' },
  { icon: '✓', text: 'Fini les SMS et appels en cascade' },
  { icon: '✓', text: 'Gratuit et simple d\'utilisation' },
  { icon: '✓', text: 'Accessible sur mobile et ordinateur' },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />

        {/* Use cases */}
        <section className="py-10 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pour toutes les situations</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Que ce soit pour un parent hospitalisé, un résident en EHPAD ou un proche à domicile.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {USE_CASES.map((uc) => (
                <div key={uc.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="text-2xl mb-3 block">{uc.icon}</span>
                  <h3 className="font-semibold text-gray-900 mb-1">{uc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
              <p className="text-gray-500 text-sm">Trois étapes simples pour organiser les visites.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 bg-[#1e3a8a]/10 text-[#1e3a8a] font-bold text-lg rounded-full flex items-center justify-center mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-10 px-4 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">Pourquoi Planavi ?</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {BENEFITS.map((b) => (
                <div key={b.text} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2.5">
                  <span className="text-[#4ade80] font-bold">{b.icon}</span>
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/dashboard/plannings/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1e3a8a] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              Créer un planning gratuitement
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-gray-100">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3db54a] bg-clip-text text-transparent">
              Planavi
            </span>
            <div className="flex items-center gap-4">
              <Link href="/cgu" className="text-xs text-gray-400 hover:text-[#1e3a8a]">
                CGU
              </Link>
              <Link href="/mentions-legales" className="text-xs text-gray-400 hover:text-[#1e3a8a]">
                Mentions légales
              </Link>
              <span className="text-xs text-gray-300">
                © {new Date().getFullYear()} Planavi
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
