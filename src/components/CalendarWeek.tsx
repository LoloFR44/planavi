'use client';

import { useState, useMemo } from 'react';
import TimeSlotCard from './TimeSlotCard';
import BookingModal from './BookingModal';
import ToastMessage from './ui/ToastMessage';
import type { TimeSlot, Booking, Planning } from '@/types';

interface CalendarWeekProps {
  timeSlots: TimeSlot[];
  bookings: Booking[];
  planning: Planning;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDays(start: Date): Date[] {
  const monday = getMonday(start);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export default function CalendarWeek({ timeSlots, bookings, planning }: CalendarWeekProps) {
  const [weekStart, setWeekStart] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const slotsByDate = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    for (const slot of timeSlots) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    return map;
  }, [timeSlots]);

  const bookingsBySlot = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.timeSlotId]) map[b.timeSlotId] = [];
      map[b.timeSlotId].push(b);
    }
    return map;
  }, [bookings]);

  // Navigation limits: current week to 4 weeks ahead
  const currentMonday = useMemo(() => getMonday(new Date()), []);
  const maxMonday = useMemo(() => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 28);
    return d;
  }, [currentMonday]);

  const thisMonday = getMonday(weekStart);
  const canGoPrev = thisMonday.getTime() > currentMonday.getTime();
  const canGoNext = thisMonday.getTime() < maxMonday.getTime();

  const navigateWeek = (offset: number) => {
    if (offset < 0 && !canGoPrev) return;
    if (offset > 0 && !canGoNext) return;
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset * 7);
      return next;
    });
  };

  const goToToday = () => setWeekStart(new Date());

  const monthYear = (() => {
    const first = days[0];
    const last = days[6];
    if (first.getMonth() === last.getMonth()) {
      return `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${MONTH_NAMES[first.getMonth()]} – ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  })();

  const today = formatDateKey(new Date());

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 capitalize">{monthYear}</h2>
          <p className="text-sm text-gray-400">
            Semaine du {days[0].getDate()} au {days[6].getDate()} {MONTH_NAMES[days[6].getMonth()]}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => navigateWeek(-1)}
            disabled={!canGoPrev}
            className={`p-2 rounded-lg transition-colors ${canGoPrev ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-200 cursor-not-allowed'}`}
            aria-label="Semaine précédente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateWeek(1)}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors ${canGoNext ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-200 cursor-not-allowed'}`}
            aria-label="Semaine suivante"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = formatDateKey(day);
          const daySlots = slotsByDate[key] || [];
          const isToday = key === today;
          const isPast = key < today;

          // Only show up to 2 past days, hide older ones
          if (isPast) {
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const diffMs = todayDate.getTime() - day.getTime();
            const diffDays = Math.round(diffMs / 86400000);
            if (diffDays > 2) return null;
          }

          return (
            <div
              key={key}
              className={`rounded-lg border px-1.5 py-1 ${
                isPast
                  ? 'hidden lg:block border-gray-100 bg-gray-50/30 opacity-40'
                  : isToday
                    ? 'border-[#1e3a8a]/30 bg-gradient-to-b from-[#1e3a8a]/5 to-white shadow-sm'
                    : daySlots.length > 0
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <div className="text-center mb-0.5">
                <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                  isToday ? 'text-[#1e3a8a]' : isPast ? 'text-gray-300' : 'text-gray-400'
                }`}>{DAY_NAMES[i]}</p>
                <p className={`text-base font-bold leading-tight ${
                  isToday ? 'text-[#1e3a8a]' : isPast ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  {day.getDate()}
                </p>
              </div>

              <div className="space-y-1">
                {isPast ? (
                  <p className="text-[10px] text-gray-300 text-center">Passé</p>
                ) : daySlots.length > 0 ? (
                  daySlots.map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      bookings={bookingsBySlot[slot.id] || []}
                      onBook={setSelectedSlot}
                    />
                  ))
                ) : (
                  <p className="text-[10px] text-gray-300 text-center py-0.5">Pas de créneau</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking modal */}
      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          planning={planning}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => {
            setSelectedSlot(null);
            setToast({ type: 'success', message: 'Votre visite a été réservée avec succès !' });
          }}
        />
      )}

      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
