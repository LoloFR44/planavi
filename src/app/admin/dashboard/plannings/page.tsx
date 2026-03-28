'use client';

import Link from 'next/link';
import { usePlannings } from '@/hooks/usePlanning';
import ResidentCard from '@/components/ResidentCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function PlanningsListPage() {
  const { plannings, loading } = usePlannings();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Plannings</h1>
        <Link
          href="/admin/dashboard/plannings/new"
          className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
        >
          + Nouveau planning
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : plannings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucun planning créé"
          description="Commencez par créer un planning pour organiser les visites."
          action={
            <Link
              href="/admin/dashboard/plannings/new"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              Créer un planning
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plannings.map((p) => (
            <ResidentCard key={p.id} planning={p} adminLink />
          ))}
        </div>
      )}
    </div>
  );
}
