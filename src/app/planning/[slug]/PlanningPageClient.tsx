'use client';

import Header from '@/components/Header';
import CalendarWeek from '@/components/CalendarWeek';
import MessageWall from '@/components/MessageWall';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePlanningBySlug } from '@/hooks/usePlanning';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useBookings } from '@/hooks/useBookings';

const TYPE_LABELS: Record<string, string> = {
  home: 'A domicile',
  hospital: 'Hôpital',
  nursing_home: 'EHPAD / Maison de retraite',
  other: 'Autre',
};

const TYPE_ICONS: Record<string, string> = {
  home: '🏠',
  hospital: '🏥',
  nursing_home: '🏡',
  other: '📍',
};

export default function PlanningPageClient({ slug }: { slug: string }) {
  const { planning, loading: planningLoading } = usePlanningBySlug(slug);
  const { timeSlots, loading: slotsLoading } = useTimeSlots(planning?.id);
  const { bookings, loading: bookingsLoading } = useBookings(planning?.id);

  const isLoading = planningLoading || slotsLoading || bookingsLoading;

  if (planningLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner className="min-h-screen" />
      </>
    );
  }

  if (!planning) {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <span className="text-5xl mb-3 block">🔍</span>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Planning introuvable</h1>
            <p className="text-gray-500">Ce planning n&apos;existe pas ou a été archivé.</p>
          </div>
        </div>
      </>
    );
  }

  const icon = TYPE_ICONS[planning.residentType] || '📍';

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 min-h-screen">
        {/* Resident info header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {planning.residentName}
                  {planning.residentFirstName && (
                    <span className="text-gray-400 font-normal text-lg"> ({planning.residentFirstName})</span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{planning.title}</p>

                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-[#1e3a8a]/5 text-[#1e3a8a] rounded-full text-xs font-semibold">
                    {TYPE_LABELS[planning.residentType] || planning.residentType}
                  </span>
                  {planning.locationName && <span className="text-xs">{planning.locationName}</span>}
                  {planning.room && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs">{planning.room}</span>
                    </>
                  )}
                  {planning.address && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{planning.address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Admin message */}
            {planning.adminMessage && (
              <div className="mt-3 bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-[#1e3a8a]">📢 {planning.adminMessage}</p>
              </div>
            )}

            {/* Public notes */}
            {planning.publicNotes && (
              <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-600">{planning.publicNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <CalendarWeek timeSlots={timeSlots} bookings={bookings} planning={planning} />
          )}
        </div>

        {/* Messages */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <MessageWall planningId={planning.id} />
          </div>
        </div>
      </main>
    </>
  );
}
