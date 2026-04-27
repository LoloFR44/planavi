'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanningsByEmail } from '@/hooks/usePlanning';
import { deletePlanning } from '@/services/plannings';
import { deleteTimeSlotsForPlanning } from '@/services/timeSlots';
import { deleteBookingsForPlanning } from '@/services/bookings';
import { deleteMessagesForPlanning } from '@/services/messages';
import ResidentCard from '@/components/ResidentCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function PlanningsListPage() {
  const { user } = useAuth();
  const { plannings, loading } = usePlanningsByEmail(user?.email || null);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes plannings</h1>
          <p className="text-sm text-gray-400">Connecté avec {user?.email}</p>
        </div>
        <Link
          href="/gestion/dashboard/plannings/new"
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
          description="Commencez par créer un planning pour organiser les visites de vos proches."
          action={
            <Link
              href="/gestion/dashboard/plannings/new"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              Créer mon premier planning
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
