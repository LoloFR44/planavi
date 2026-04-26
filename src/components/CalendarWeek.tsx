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

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
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
  // Use midnight local time so `today` key is consistent with calendar day keys
  // (formatDateKey uses toISOString which shifts to UTC — both must start from midnight local)
  const today = useMemo(() => {
    const now = new Date();
    return formatDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // Index slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    for (const slot of timeSlots) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    return map;
  }, [timeSlots]);

  // Index bookings by slot ID
  const bookingsBySlot = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.timeSlotId]) map[b.timeSlotId] = [];
      map[b.timeSlotId].push(b);
    }
    return map;
  }, [bookings]);

  // Compute AM/PM slot rows — compact layout based on unique start times
  const ROW_GAP = 6; // px gap between rows

  const { amRows, pmRows, hasAm, hasPm } = useMemo(() => {
    const amStartTimes = new Set<string>();
    const pmStartTimes = new Set<string>();

    for (const day of days) {
      const key = formatDateKey(day);
      if (key < today) continue;
      for (const slot of slotsByDate[key] || []) {
        const start = timeToMin(slot.startTime);
        if (start < 780) {
          amStartTimes.add(slot.startTime);
        } else {
          pmStartTimes.add(slot.startTime);
        }
      }
    }

    const sortTimes = (times: Set<string>) =>
      Array.from(times).sort((a, b) => timeToMin(a) - timeToMin(b));

    return {
      amRows: sortTimes(amStartTimes),
      pmRows: sortTimes(pmStartTimes),
      hasAm: amStartTimes.size > 0,
      hasPm: pmStartTimes.size > 0,
    };
  }, [days, slotsByDate, today]);

  // Visible days: keep max 2 past days, today + future days
  const visibleDays = useMemo(() => {
    const allDays = days.map((day, i) => {
      const key = formatDateKey(day);
      const isPast = key < today;
      const isToday = key === today;
      return { day, key, index: i, isPast, isToday };
    });
    // On the current week, hide past days older than 2 days
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return allDays.filter(({ day, isPast }) => {
      if (!isPast) return true;
      const diffMs = todayDate.getTime() - day.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      return diffDays <= 2;
    });
  }, [days, today]);

  // Navigation limits
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
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => navigateWeek(-1)}
            disabled={!canGoPrev}
            className={`p-2 rounded-full transition-all ${canGoPrev ? 'bg-gradient-to-br from-[#1e3a8a] to-[#3db54a] text-white shadow-md hover:shadow-lg hover:scale-105' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            aria-label="Semaine précédente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateWeek(1)}
            disabled={!canGoNext}
            className={`p-2 rounded-full transition-all ${canGoNext ? 'bg-gradient-to-br from-[#1e3a8a] to-[#3db54a] text-white shadow-md hover:shadow-lg hover:scale-105' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            aria-label="Semaine suivante"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: timeline layout (lg+) */}
      <div className="hidden lg:block">
        {/* Day headers */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)` }}>
          {visibleDays.map(({ day, key, index, isPast, isToday }) => (
            <div key={key} className={`text-center rounded-lg px-1 py-1.5 ${
              isToday ? 'bg-gradient-to-b from-[#1e3a8a]/10 to-[#1e3a8a]/5'
              : isPast ? 'opacity-30' : ''
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                isToday ? 'text-[#1e3a8a]' : isPast ? 'text-gray-300' : 'text-gray-400'
              }`}>{DAY_NAMES[index]}</p>
              <p className={`text-base font-bold leading-tight ${
                isToday ? 'text-[#1e3a8a]' : isPast ? 'text-gray-300' : 'text-gray-800'
              }`}>{day.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Compact periods: Matin + Après-midi */}
        {([
          { key: 'am', label: 'Matin', rows: amRows, has: hasAm, filter: (s: TimeSlot) => timeToMin(s.startTime) < 780 },
          { key: 'pm', label: 'Après-midi', rows: pmRows, has: hasPm, filter: (s: TimeSlot) => timeToMin(s.startTime) >= 780 },
        ] as const).map(({ key: periodKey, label, rows, has, filter: filterFn }) => {
          if (!has) return null;

          return (
            <div key={periodKey} className="mb-2">
              {/* Period label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              {/* Compact rows with proportional spacing (quinconce) */}
              <div className="flex flex-col">
                {rows.map((startTime, rowIdx) => {
                  // Proportional gap: small for close times, larger for distant ones
                  let gap = 4; // default min gap
                  if (rowIdx > 0) {
                    const delta = timeToMin(startTime) - timeToMin(rows[rowIdx - 1]);
                    // 30 min → 8px, 60 min → 16px, 90 min → 24px, 120+ min → 28px
                    gap = Math.min(28, Math.max(4, Math.round(delta / 60 * 16)));
                  }

                  return (
                    <div
                      key={startTime}
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`, marginTop: rowIdx === 0 ? 0 : gap }}
                    >
                      {visibleDays.map(({ key: dateKey, isPast }) => {
                        const daySlots = (slotsByDate[dateKey] || [])
                          .filter((s) => filterFn(s) && s.startTime === startTime);

                        return (
                          <div key={dateKey} className={`min-w-0 ${isPast ? 'opacity-20 pointer-events-none' : ''}`}>
                            {daySlots.length > 0 ? (
                              daySlots.map((slot) => (
                                <TimeSlotCard
                                  key={slot.id}
                                  slot={slot}
                                  bookings={bookingsBySlot[slot.id] || []}
                                  onBook={setSelectedSlot}
                                />
                              ))
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked cards (sm, md) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-1">
        {visibleDays.map(({ day, key, index, isPast, isToday }) => {
          const daySlots = (slotsByDate[key] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div
              key={key}
              className={`rounded-lg border px-1.5 py-1 ${
                isPast
                  ? 'border-gray-100 bg-gray-50/30 opacity-40'
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
                }`}>{DAY_NAMES[index]}</p>
                <p className={`text-base font-bold leading-tight ${
                  isToday ? 'text-[#1e3a8a]' : isPast ? 'text-gray-300' : 'text-gray-800'
                }`}>{day.getDate()}</p>
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
