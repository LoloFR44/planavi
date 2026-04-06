'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPlanningByToken, updatePlanning } from '@/services/plannings';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useBookings } from '@/hooks/useBookings';
import { updateTimeSlot, deleteTimeSlot, bulkDeleteTimeSlots } from '@/services/timeSlots';
import { deleteBooking } from '@/services/bookings';
import { deleteMessage } from '@/services/messages';
import { useMessages } from '@/hooks/useMessages';
import TimeSlotForm from '@/components/admin/TimeSlotForm';
import WeeklyCalendarGrid from '@/components/admin/WeeklyCalendarGrid';
import ReservationTable from '@/components/admin/ReservationTable';
import MessageWall from '@/components/MessageWall';
import ToastMessage from '@/components/ui/ToastMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QRCodeShare from '@/components/QRCodeShare';
import Header from '@/components/Header';
import type { Planning } from '@/types';

export default function SharedManagePlanningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'bookings' | 'messages'>('slots');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  const planningId = planning?.id || '';
  const { timeSlots } = useTimeSlots(planningId);
  const { bookings } = useBookings(planningId);
  const { messages } = useMessages(planningId);

  const loadPlanning = useCallback(async () => {
    try {
      const p = await getPlanningByToken(token);
      if (!p) {
        setNotFound(true);
      } else {
        setPlanning(p);
        setAdminMessage(p.adminMessage || '');
      }
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadPlanning();
  }, [loadPlanning]);

  useEffect(() => {
    if (planning && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/planning/${planning.slug}`);
    }
  }, [planning]);

  const handleToggleSlot = async (slotId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'closed' : 'available';
    await updateTimeSlot(slotId, { status: newStatus });
    setToast({ type: 'success', message: `Créneau ${newStatus === 'closed' ? 'fermé' : 'ouvert'}` });
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    await deleteTimeSlot(slotId);
    setToast({ type: 'success', message: 'Créneau supprimé' });
  };

  const handleBulkDeleteSlots = async (slotIds: string[]) => {
    if (!confirm(`Supprimer ${slotIds.length} créneau${slotIds.length > 1 ? 'x' : ''} ?`)) return;
    await bulkDeleteTimeSlots(slotIds);
    setToast({ type: 'success', message: `${slotIds.length} créneau${slotIds.length > 1 ? 'x' : ''} supprimé${slotIds.length > 1 ? 's' : ''}` });
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    await deleteBooking(bookingId);
    setToast({ type: 'success', message: 'Réservation supprimée' });
  };

  const handleSaveMessage = async () => {
    if (!planning) return;
    await updatePlanning(planning.id, { adminMessage });
    setToast({ type: 'success', message: 'Message mis à jour' });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    await deleteMessage(messageId);
    setToast({ type: 'success', message: 'Message supprimé' });
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setToast({ type: 'success', message: 'Lien copié !' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </>
    );
  }

  if (notFound || !planning) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-xl mx-auto px-4 py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-gray-500 mb-6">
              Ce lien de gestion n&apos;est pas valide ou a expiré. Vérifiez le lien ou contactez l&apos;organisateur du planning.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </main>
      </>
    );
  }

  const tabClass = (tab: string) =>
    `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
      activeTab === tab
        ? 'text-[#1e3a8a] border-[#1e3a8a]'
        : 'text-gray-500 border-transparent hover:text-gray-700'
    }`;

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
            Vous accédez à la gestion de ce planning via un lien partagé. Vous pouvez gérer les créneaux, réservations et messages.
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{planning.residentName}</h1>
              <p className="text-sm text-gray-500">{planning.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/planning/${planning.slug}`}
                target="_blank"
                className="px-3 py-2 text-sm text-[#1e3a8a] bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors"
              >
                Voir la page publique
              </Link>
            </div>
          </div>

          {/* Share link */}
          <div className="bg-[#1e3a8a]/5 rounded-xl border-2 border-[#1e3a8a]/20 p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#1e3a8a] mb-1">Partagez ce lien à vos proches</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Envoyez ce lien par SMS, email ou WhatsApp à votre famille pour qu&apos;ils puissent réserver une visite.
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 select-all"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <button
                  onClick={copyShareUrl}
                  className="w-full sm:w-auto px-6 py-3 text-white text-base font-semibold rounded-xl hover:shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
                >
                  Copier le lien à partager
                </button>
              </div>
              {shareUrl && (
                <div className="hidden sm:block shrink-0">
                  <QRCodeShare url={shareUrl} title={`Partager le planning de ${planning.residentName}`} />
                </div>
              )}
            </div>
          </div>

          {/* Admin message */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <p className="text-sm font-bold text-gray-700 mb-1">Message pour les visiteurs</p>
            <p className="text-xs text-gray-400 mb-2">Ce message sera affiché en haut de votre page de visites.</p>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
              rows={3}
              placeholder={"Ex : Merci de sonner au code 1234A\nKiné les lundis 13h-14h30\nNe pas venir entre 12h et 13h (repas)"}
            />
            <button
              onClick={handleSaveMessage}
              className="mt-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              Enregistrer le message
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            <button onClick={() => setActiveTab('slots')} className={tabClass('slots')}>
              Créneaux ({timeSlots.length})
            </button>
            <button onClick={() => setActiveTab('bookings')} className={tabClass('bookings')}>
              Réservations ({bookings.length})
            </button>
            <button onClick={() => setActiveTab('messages')} className={tabClass('messages')}>
              Messages ({messages.length})
            </button>
          </div>

          {/* Slots tab */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Ajouter des créneaux</h2>
                <TimeSlotForm
                  planningId={planning.id}
                  defaultDuration={planning.defaultVisitDuration}
                  onSuccess={() => setToast({ type: 'success', message: 'Créneaux ajoutés !' })}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Créneaux existants ({timeSlots.length})
                  </h2>
                  {timeSlots.length > 0 && (
                    <button
                      onClick={() => handleBulkDeleteSlots(timeSlots.map((s) => s.id))}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                    >
                      Tout supprimer ({timeSlots.length})
                    </button>
                  )}
                </div>
                <WeeklyCalendarGrid
                  timeSlots={timeSlots}
                  bookings={bookings}
                  onToggleSlot={handleToggleSlot}
                  onDeleteSlot={handleDeleteSlot}
                  onBulkDelete={handleBulkDeleteSlots}
                />
              </div>
            </div>
          )}

          {/* Bookings tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <ReservationTable
                bookings={bookings}
                timeSlots={timeSlots}
                onDelete={handleDeleteBooking}
              />
            </div>
          )}

          {/* Messages tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <MessageWall planningId={planning.id} onDelete={handleDeleteMessage} />
            </div>
          )}

          {toast && (
            <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />
          )}
        </div>
      </main>
    </>
  );
}
