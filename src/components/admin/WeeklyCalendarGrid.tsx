'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { TimeSlot, Booking, BookingFormData } from '@/types';

interface WeeklyCalendarGridProps {
  timeSlots: TimeSlot[];
  bookings: Booking[];
  onToggleSlot: (slotId: string, currentStatus: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onBulkDelete: (slotIds: string[]) => void;
  onAddBooking?: (data: BookingFormData) => Promise<void>;
}

const DAY_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export default function WeeklyCalendarGrid({
  timeSlots,
  bookings,
  onToggleSlot,
  onDeleteSlot,
  onBulkDelete,
  onAddBooking,
}: WeeklyCalendarGridProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const prevSlotCount = useRef(timeSlots.length);

  // Quick-add booking state
  const [addingToSlot, setAddingToSlot] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', count: 1 });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Auto-navigate to the week of the newest slot when slots are added
  useEffect(() => {
    if (timeSlots.length > prevSlotCount.current && timeSlots.length > 0) {
      // New slots were added — find the most recent one (highest createdAt)
      const newest = timeSlots.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
      const newestMonday = getMonday(new Date(newest.date + 'T00:00:00'));
      setWeekStart(newestMonday);
    }
    prevSlotCount.current = timeSlots.length;
  }, [timeSlots]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const weekEnd = weekDays[6];

  const slotsByDate = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    for (const slot of timeSlots) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    return map;
  }, [timeSlots]);

  const timeRanges = useMemo(() => {
    const rangeSet = new Set<string>();
    for (const day of weekDays) {
      const key = formatDateKey(day);
      const daySlots = slotsByDate[key] || [];
      for (const slot of daySlots) {
        rangeSet.add(`${slot.startTime}-${slot.endTime}`);
      }
    }
    return Array.from(rangeSet).sort();
  }, [weekDays, slotsByDate]);

  const bookingCountBySlot = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of bookings) {
      map[b.timeSlotId] = (map[b.timeSlotId] || 0) + b.visitorCount;
    }
    return map;
  }, [bookings]);

  const bookingNamesBySlot = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.timeSlotId]) map[b.timeSlotId] = [];
      map[b.timeSlotId].push(b);
    }
    return map;
  }, [bookings]);

  // Limits: current week and max 4 weeks ahead
  const currentMonday = useMemo(() => getMonday(new Date()), []);
  const maxMonday = useMemo(() => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 28);
    return d;
  }, [currentMonday]);

  const canGoPrev = weekStart.getTime() > currentMonday.getTime();
  const canGoNext = weekStart.getTime() < maxMonday.getTime();

  const prevWeek = () => {
    if (!canGoPrev) return;
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    setSelected(new Set());
  };
  const nextWeek = () => {
    if (!canGoNext) return;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    setSelected(new Set());
  };

  const weekLabel = `Semaine du ${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} — ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const findSlot = (dayKey: string, range: string): TimeSlot | undefined => {
    const daySlots = slotsByDate[dayKey] || [];
    return daySlots.find((s) => `${s.startTime}-${s.endTime}` === range);
  };

  const dayTotals = (dayKey: string): number => {
    const daySlots = slotsByDate[dayKey] || [];
    let total = 0;
    for (const s of daySlots) {
      total += bookingCountBySlot[s.id] || 0;
    }
    return total;
  };

  // Selection helpers
  const toggleSlotSelection = (slotId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  };

  const toggleDaySelection = (dayKey: string) => {
    const daySlots = slotsByDate[dayKey] || [];
    if (daySlots.length === 0) return;

    const dayIds = daySlots.map((s) => s.id);
    const allSelected = dayIds.every((id) => selected.has(id));

    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        dayIds.forEach((id) => next.delete(id));
      } else {
        dayIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllWeek = () => {
    const allIds: string[] = [];
    for (const day of weekDays) {
      const key = formatDateKey(day);
      const daySlots = slotsByDate[key] || [];
      daySlots.forEach((s) => allIds.push(s.id));
    }
    const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    onBulkDelete(Array.from(selected));
    setSelected(new Set());
  };

  const isDayFullySelected = (dayKey: string): boolean => {
    const daySlots = slotsByDate[dayKey] || [];
    return daySlots.length > 0 && daySlots.every((s) => selected.has(s.id));
  };

  // Delete all slots for a given day
  const deleteDay = (dayKey: string) => {
    const daySlots = slotsByDate[dayKey] || [];
    if (daySlots.length === 0) return;
    onBulkDelete(daySlots.map((s) => s.id));
  };

  // Delete all slots for a given time range across the visible week
  const deleteTimeRange = (range: string) => {
    const ids: string[] = [];
    for (const day of weekDays) {
      const key = formatDateKey(day);
      const slot = findSlot(key, range);
      if (slot) ids.push(slot.id);
    }
    if (ids.length === 0) return;
    onBulkDelete(ids);
  };

  const handleQuickAdd = async (slot: TimeSlot) => {
    if (!onAddBooking || !addForm.firstName.trim() || !addForm.lastName.trim()) {
      setAddError('Prénom et nom requis.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await onAddBooking({
        planningId: slot.planningId,
        timeSlotId: slot.id,
        visitorFirstName: addForm.firstName.trim(),
        visitorLastName: addForm.lastName.trim(),
        visitorCount: addForm.count,
        visitorRelation: '',
        visitorPhone: '',
        visitorEmail: '',
        comment: 'Ajouté par le gestionnaire',
      });
      setAddingToSlot(null);
      setAddForm({ firstName: '', lastName: '', count: 1 });
    } catch {
      setAddError('Erreur lors de l\'ajout.');
    } finally {
      setAddLoading(false);
    }
  };

  const hasSlots = timeRanges.length > 0;

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 bg-[#1e3a8a]/5 rounded-xl px-4 py-3">
        <button
          onClick={prevWeek}
          disabled={!canGoPrev}
          className={`text-sm font-semibold ${canGoPrev ? 'text-[#1e3a8a] hover:text-[#1e3a8a]/70' : 'text-gray-300 cursor-not-allowed'}`}
        >
          &larr; Préc.
        </button>
        <h3 className="text-sm font-bold text-gray-900">{weekLabel}</h3>
        <button
          onClick={nextWeek}
          disabled={!canGoNext}
          className={`text-sm font-semibold ${canGoNext ? 'text-[#3db54a] hover:text-[#3db54a]/70' : 'text-gray-300 cursor-not-allowed'}`}
        >
          Suiv. &rarr;
        </button>
      </div>

      {/* Selection action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-3">
          <span className="text-sm font-medium text-red-700">
            {selected.size} créneau{selected.size > 1 ? 'x' : ''} sélectionné{selected.size > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="py-2 px-1 text-left text-xs font-medium text-gray-400 w-[80px]">
                {hasSlots && (
                  <button
                    onClick={selectAllWeek}
                    className="text-[10px] text-[#1e3a8a] hover:underline font-medium"
                    title="Tout sélectionner / désélectionner"
                  >
                    Tout
                  </button>
                )}
              </th>
              {weekDays.map((day, i) => {
                const today = isToday(day);
                const dayKey = formatDateKey(day);
                const hasSlotsThisDay = (slotsByDate[dayKey] || []).length > 0;
                const daySelected = isDayFullySelected(dayKey);
                return (
                  <th
                    key={i}
                    className={`py-2 px-1 text-center border-l border-gray-100 cursor-pointer select-none ${
                      today ? 'bg-[#3db54a]/10' : ''
                    } ${daySelected ? 'bg-red-50/50' : ''}`}
                    onClick={() => toggleDaySelection(dayKey)}
                    title={hasSlotsThisDay ? 'Cliquer pour sélectionner tous les créneaux de ce jour' : ''}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider ${
                      today ? 'text-[#3db54a]' : 'text-gray-500'
                    }`}>
                      {DAY_LABELS[i]}
                    </div>
                    <div className={`text-lg font-bold ${
                      today ? 'text-[#3db54a]' : hasSlotsThisDay ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className={`text-xs ${
                      today ? 'text-[#3db54a]' : 'text-gray-400'
                    }`}>
                      {MONTH_NAMES[day.getMonth()].slice(0, 4)}.
                    </div>
                    {hasSlotsThisDay && (
                      <div className="mt-1 flex items-center justify-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={daySelected}
                          onChange={() => toggleDaySelection(dayKey)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-gray-300 accent-red-500 cursor-pointer"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteDay(dayKey); }}
                          className="text-[9px] text-red-400 hover:text-red-600"
                          title="Supprimer tous les créneaux de ce jour"
                        >
                          suppr.
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!hasSlots ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-sm text-gray-400">
                  Aucun créneau cette semaine
                </td>
              </tr>
            ) : (
              <>
                {timeRanges.map((range) => {
                  const [start, end] = range.split('-');
                  const label = `${start.replace(':', 'h')}-${end.replace(':', 'h')}`;
                  return (
                    <tr key={range} className="border-t border-gray-100">
                      <td className="py-3 px-1 text-xs font-medium text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{label}</span>
                          <button
                            onClick={() => deleteTimeRange(range)}
                            className="text-[9px] text-red-400 hover:text-red-600"
                            title={`Supprimer tous les créneaux ${label}`}
                          >
                            suppr.
                          </button>
                        </div>
                      </td>
                      {weekDays.map((day, i) => {
                        const dayKey = formatDateKey(day);
                        const slot = findSlot(dayKey, range);
                        const today = isToday(day);
                        const count = slot ? (bookingCountBySlot[slot.id] || 0) : 0;

                        if (!slot) {
                          return (
                            <td
                              key={i}
                              className={`py-3 px-1 text-center border-l border-gray-100 ${
                                today ? 'bg-[#3db54a]/5' : ''
                              }`}
                            >
                              <span className="text-gray-200">&mdash;</span>
                            </td>
                          );
                        }

                        const isClosed = slot.status !== 'available';
                        const isFull = slot.capacity > 0 && count >= slot.capacity;
                        const isSelected = selected.has(slot.id);
                        const slotBookings = bookingNamesBySlot[slot.id] || [];
                        const tooltipText = slotBookings.length > 0
                          ? slotBookings.map((b) => `${b.visitorFirstName} ${b.visitorLastName}${b.visitorCount > 1 ? ` (+${b.visitorCount - 1})` : ''}${b.visitorRelation ? ` — ${b.visitorRelation}` : ''}`).join('\n')
                          : '';

                        return (
                          <td
                            key={i}
                            className={`py-2 px-1 text-center border-l border-gray-100 cursor-pointer relative group ${
                              today ? 'bg-[#3db54a]/5' : ''
                            } ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleSlotSelection(slot.id)}
                          >
                            <div className="flex items-start justify-between px-0.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSlotSelection(slot.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3 h-3 mt-0.5 rounded border-gray-300 accent-red-500 cursor-pointer"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); onToggleSlot(slot.id, slot.status); }}
                                className={`px-1 py-0 text-[9px] font-medium rounded ${
                                  slot.status === 'available'
                                    ? 'text-[#3db54a] hover:bg-[#3db54a]/10'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title={slot.status === 'available' ? 'Fermer' : 'Ouvrir'}
                              >
                                {slot.status === 'available' ? 'Ouvert' : 'Fermé'}
                              </button>
                            </div>
                            {slotBookings.length > 0 ? (
                              <div className="mt-0.5 space-y-0.5">
                                {slotBookings.map((b) => (
                                  <div
                                    key={b.id}
                                    className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${
                                      isClosed
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-[#1e3a8a]/10 text-[#1e3a8a]'
                                    }`}
                                    title={`${b.visitorFirstName} ${b.visitorLastName}${b.visitorRelation ? ` — ${b.visitorRelation}` : ''}${b.visitorCount > 1 ? ` (${b.visitorCount} pers.)` : ''}`}
                                  >
                                    {b.visitorFirstName} {b.visitorLastName.charAt(0)}.
                                    {b.visitorCount > 1 && ` +${b.visitorCount - 1}`}
                                  </div>
                                ))}
                                {slot.capacity > 0 && (
                                  <div className={`text-[9px] font-medium ${isFull ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {isFull ? 'Complet' : `${slot.capacity - count} place${slot.capacity - count > 1 ? 's' : ''}`}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`inline-flex flex-col items-center rounded-lg px-2 py-1 mt-0.5 ${
                                isClosed
                                  ? 'bg-gray-100 text-gray-400'
                                  : 'bg-[#3db54a]/10 text-[#3db54a]'
                              }`}>
                                <span className="text-[10px]">
                                  {isClosed ? 'Fermé' : slot.capacity > 0 ? `${slot.capacity} place${slot.capacity > 1 ? 's' : ''}` : 'Disponible'}
                                </span>
                              </div>
                            )}
                            {/* Quick-add visitor button */}
                            {onAddBooking && !isClosed && !isFull && addingToSlot !== slot.id && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setAddingToSlot(slot.id); setAddForm({ firstName: '', lastName: '', count: 1 }); setAddError(''); }}
                                className="mt-1 text-[9px] text-[#3db54a] hover:text-[#3db54a]/80 font-medium flex items-center gap-0.5 mx-auto"
                                title="Ajouter un visiteur manuellement"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Ajouter
                              </button>
                            )}
                            {/* Quick-add inline form */}
                            {addingToSlot === slot.id && (
                              <div className="mt-1 bg-white border border-[#1e3a8a]/20 rounded-lg p-1.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  placeholder="Prénom"
                                  value={addForm.firstName}
                                  onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                                  className="w-full px-1.5 py-1 border border-gray-200 rounded text-[10px] mb-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  placeholder="Nom"
                                  value={addForm.lastName}
                                  onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(slot)}
                                  className="w-full px-1.5 py-1 border border-gray-200 rounded text-[10px] mb-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                                />
                                {addError && <p className="text-[9px] text-red-500 mb-1">{addError}</p>}
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleQuickAdd(slot)}
                                    disabled={addLoading}
                                    className="flex-1 py-1 text-[9px] font-semibold text-white rounded hover:shadow-sm disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
                                  >
                                    {addLoading ? '...' : 'OK'}
                                  </button>
                                  <button
                                    onClick={() => setAddingToSlot(null)}
                                    className="px-2 py-1 text-[9px] text-gray-400 border border-gray-200 rounded hover:bg-gray-50"
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Total row */}
                <tr className="border-t-2 border-gray-200">
                  <td className="py-2 px-1 text-xs font-bold text-gray-600">Total</td>
                  {weekDays.map((day, i) => {
                    const dayKey = formatDateKey(day);
                    const total = dayTotals(dayKey);
                    const daySlotCount = (slotsByDate[dayKey] || []).length;
                    const today = isToday(day);
                    return (
                      <td
                        key={i}
                        className={`py-2 px-1 text-center border-l border-gray-100 ${
                          today ? 'bg-[#3db54a]/5' : ''
                        }`}
                      >
                        {daySlotCount > 0 ? (
                          <span className="text-xs font-bold text-gray-700">
                            {total}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-200">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
