'use client';

import Link from 'next/link';
import { usePlannings } from '@/hooks/usePlanning';
import { deletePlanning } from '@/services/plannings';
import { deleteTimeSlotsForPlanning } from '@/services/timeSlots';
import { deleteBookingsForPlanning } from '@/services/bookings';
import { deleteMessagesForPlanning } from '@/services/messages';
import ResidentCard from '@/components/ResidentCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function AdminDashboardPage() {
  const { plannings, loading } = usePlannings();

  const handleDeletePlanning = async (id: string) => {
    try {
      await deleteTimeSlotsForPlanning(id);
    } catch (e) { console.error('Erreur suppression créneaux:', e); }
    try {
      await deleteBookingsForPlanning(id);
    } catch (e) { console.error('Erreur suppression réservations:', e); }
    try {
      await deleteMessagesForPlanning(id);
    } catch (e) { console.error('Erreur suppression messages:', e); }
    await deletePlanning(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de vos plannings</p>
        </div>
        <Link
          href="/gestion/dashboard/plannings/new"
          className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
        >
          + Nouveau planning
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Plannings actifs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? '-' : plannings.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total plannings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? '-' : plannings.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Archivés</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? '-' : plannings.filter((p) => !p.isActive).length}
          </p>
        </div>
      </div>

      {/* Plannings list */}
      {loading ? (
        <LoadingSpinner />
      ) : plannings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucun planning"
          description="Créez votre premier planning pour commencer à organiser les visites."
          action={
            <Link
              href="/gestion/dashboard/plannings/new"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              Créer un planning
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plannings.map((p, i) => (
            <ResidentCard key={p.id} planning={p} adminLink onDelete={handleDeletePlanning} index={plannings.length > 1 ? i + 1 : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
