import Link from 'next/link';
import type { Planning } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  home: 'A domicile',
  hospital: 'Hôpital',
  nursing_home: 'EHPAD / Maison de retraite',
  other: 'Autre',
};

interface ResidentCardProps {
  planning: Planning;
  adminLink?: boolean;
}

export default function ResidentCard({ planning, adminLink }: ResidentCardProps) {
  const href = adminLink
    ? `/admin/dashboard/plannings/${planning.id}`
    : `/planning/${planning.slug}`;

  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-[#1e3a8a] transition-colors">
              {planning.residentName}
              {planning.residentFirstName && (
                <span className="text-gray-500 font-normal"> ({planning.residentFirstName})</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{planning.title}</p>
          </div>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              planning.isActive
                ? 'bg-[#3db54a]/10 text-[#3db54a]'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {planning.isActive ? 'Actif' : 'Archivé'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>{TYPE_LABELS[planning.residentType] || planning.residentType}</span>
          {planning.locationName && (
            <>
              <span className="text-gray-300">|</span>
              <span>{planning.locationName}</span>
            </>
          )}
          {planning.room && (
            <>
              <span className="text-gray-300">|</span>
              <span>Chambre {planning.room}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
