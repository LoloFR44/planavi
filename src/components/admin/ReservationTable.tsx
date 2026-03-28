'use client';

import type { Booking, TimeSlot } from '@/types';

interface ReservationTableProps {
  bookings: Booking[];
  timeSlots: TimeSlot[];
  onDelete?: (bookingId: string) => void;
}

export default function ReservationTable({ bookings, timeSlots, onDelete }: ReservationTableProps) {
  const getSlot = (slotId: string) => timeSlots.find((s) => s.id === slotId);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Aucune réservation pour le moment.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-3 font-medium text-gray-500">Visiteur</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500">Date</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500">Créneau</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500">Lien</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500">Nb</th>
            {onDelete && (
              <th className="text-right py-3 px-3 font-medium text-gray-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const slot = getSlot(booking.timeSlotId);
            return (
              <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-3">
                  <p className="font-medium text-gray-900">
                    {booking.visitorFirstName} {booking.visitorLastName}
                  </p>
                  {booking.visitorPhone && (
                    <p className="text-xs text-gray-400">{booking.visitorPhone}</p>
                  )}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {slot ? new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  }) : '-'}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {slot ? `${slot.startTime} - ${slot.endTime}` : '-'}
                </td>
                <td className="py-3 px-3 text-gray-500 text-xs">
                  {booking.visitorRelation || '-'}
                </td>
                <td className="py-3 px-3 text-gray-600">{booking.visitorCount}</td>
                {onDelete && (
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
