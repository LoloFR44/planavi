'use client';

import { useState } from 'react';
import { deleteBooking } from '@/services/bookings';
import type { TimeSlot, Booking } from '@/types';

interface TimeSlotCardProps {
  slot: TimeSlot;
  bookings: Booking[];
  onBook: (slot: TimeSlot) => void;
}

export default function TimeSlotCard({ slot, bookings, onBook }: TimeSlotCardProps) {
  const isClosed = slot.status === 'closed' || slot.status === 'cancelled';
  const totalVisitors = bookings.reduce((sum, b) => sum + b.visitorCount, 0);
  const isFull = slot.capacity > 0 && totalVisitors >= slot.capacity;
  const spotsLeft = slot.capacity > 0 ? slot.capacity - totalVisitors : null;
  const hasBookings = bookings.length > 0;

  const [showCancelList, setShowCancelList] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelName, setCancelName] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = (bookingId: string) => {
    setCancelId(bookingId);
    setCancelName('');
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    const booking = bookings.find((b) => b.id === cancelId);
    if (!booking) return;

    if (cancelName.trim().toLowerCase() !== booking.visitorLastName.toLowerCase()) {
      setCancelError('Le nom ne correspond pas.');
      return;
    }

    setCancelling(true);
    try {
      await deleteBooking(cancelId);
      setCancelId(null);
      setShowCancelList(false);
    } catch {
      setCancelError('Erreur lors de l\'annulation.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-2.5 text-sm ${
        isClosed
          ? 'bg-gray-50 border-gray-200 opacity-50'
          : isFull
            ? 'bg-amber-50 border-amber-200'
            : hasBookings
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-[#3db54a]/20 hover:border-[#3db54a]/40 hover:shadow-sm'
      }`}
    >
      {/* Time + status */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-gray-800 text-xs">
          {slot.startTime.replace(':', 'h')} – {slot.endTime.replace(':', 'h')}
        </span>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            isClosed
              ? 'bg-gray-100 text-gray-500'
              : isFull
                ? 'bg-amber-100 text-amber-700'
                : hasBookings
                  ? 'bg-red-100 text-red-600'
                  : 'bg-[#3db54a]/10 text-[#3db54a]'
          }`}
        >
          {isClosed ? 'Fermé' : isFull ? 'Complet' : hasBookings ? (spotsLeft !== null ? `${spotsLeft} place${spotsLeft > 1 ? 's' : ''}` : `${bookings.length} réservation${bookings.length > 1 ? 's' : ''}`) : spotsLeft !== null ? `${spotsLeft} place${spotsLeft > 1 ? 's' : ''}` : 'Disponible'}
        </span>
      </div>

      {/* Visitors */}
      {bookings.length > 0 && (
        <div className="mb-1.5">
          <div className="flex flex-wrap gap-1 mb-1">
            {bookings.map((b) => (
              <span
                key={b.id}
                className="inline-block bg-[#1e3a8a]/5 text-[#1e3a8a] text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              >
                {b.visitorFirstName} {b.visitorLastName.charAt(0)}.
                {b.visitorCount > 1 && ` +${b.visitorCount - 1}`}
              </span>
            ))}
          </div>
          {!cancelId && (
            <button
              onClick={() => setShowCancelList(!showCancelList)}
              className="text-[10px] text-red-400 hover:text-red-600 font-medium flex items-center gap-0.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler une réservation
            </button>
          )}
          {showCancelList && !cancelId && (
            <div className="mt-1 space-y-0.5">
              <p className="text-[10px] text-gray-400">Quelle réservation annuler ?</p>
              {bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { handleCancelClick(b.id); setShowCancelList(false); }}
                  className="block w-full text-left text-[11px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                >
                  {b.visitorFirstName} {b.visitorLastName.charAt(0)}.
                  {b.visitorCount > 1 && ` (+${b.visitorCount - 1} pers.)`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation */}
      {cancelId && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-1.5">
          <p className="text-[11px] text-red-700 font-medium mb-1.5">
            Pour annuler, confirmez votre nom de famille :
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={cancelName}
              onChange={(e) => { setCancelName(e.target.value); setCancelError(''); }}
              placeholder="Votre nom"
              className="flex-1 px-2 py-1 border border-red-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmCancel()}
            />
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-2 py-1 text-[10px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {cancelling ? '...' : 'Annuler'}
            </button>
            <button
              onClick={() => { setCancelId(null); setShowCancelList(false); }}
              className="px-2 py-1 text-[10px] text-gray-500 border border-gray-200 rounded hover:bg-gray-50"
            >
              Non
            </button>
          </div>
          {cancelError && (
            <p className="text-[10px] text-red-600 mt-1">{cancelError}</p>
          )}
        </div>
      )}

      {/* Note */}
      {slot.publicNote && (
        <p className="text-[10px] text-gray-400 italic mb-1.5 leading-tight">{slot.publicNote}</p>
      )}

      {/* Book button */}
      {!isClosed && !isFull && (
        <button
          onClick={() => onBook(slot)}
          className="w-full py-1.5 text-white text-xs font-semibold rounded-md hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
        >
          Réserver
        </button>
      )}
    </div>
  );
}
