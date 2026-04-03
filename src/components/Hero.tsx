import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-white/70 font-medium mb-2 text-sm tracking-wide uppercase">
            Planification de visites
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Visitez vos proches,<br />
            <span className="text-[#4ade80]">simplement.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
            Organisez les visites de vos proches sans stress.
            Plus besoin d&apos;appels ou de SMS : un planning partag&eacute;, clair et accessible &agrave; tous.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/gestion/dashboard/plannings/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1e3a8a] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              Cr&eacute;er un planning
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Comment &ccedil;a marche ?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
