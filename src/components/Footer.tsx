import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-5 px-4 border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
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
  );
}
