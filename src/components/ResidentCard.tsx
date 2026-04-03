'use client';

import { useState } from 'react';
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
  onDelete?: (id: string) => void;
}

export default function ResidentCard({ planning, adminLink, onDelete }: ResidentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const href = adminLink
    ? `/gestion/dashboard/plannings/${planning.id}`
    : `/planning/${planning.slug}`;

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(planning.id);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative">
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

      {/* Bouton supprimer */}
      {onDelete && !showConfirm && (
        <button
          onClick={(e) => { e.preventDefault(); setShowConfirm(true); }}
          className="absolute top-3 right-14 p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          title="Supprimer ce planning"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Confirmation de suppression */}
      {showConfirm && (
        <div className="absolute inset-0 bg-white/95 rounded-xl border-2 border-red-200 flex flex-col items-center justify-center p-4 z-10">
          <p className="text-sm font-semibold text-gray-900 mb-1">Supprimer ce planning ?</p>
          <p className="text-xs text-gray-500 text-center mb-4">
            « {planning.title} » sera supprimé définitivement avec tous ses créneaux, réservations et messages.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={deleting}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : 'Oui, supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
