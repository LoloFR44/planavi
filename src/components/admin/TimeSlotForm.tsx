'use client';

import { useState } from 'react';
import { bulkCreateTimeSlots } from '@/services/timeSlots';
import type { TimeSlotFormData } from '@/types';

interface TimeSlotFormProps {
  planningId: string;
  defaultDuration: number;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { key: 1, label: 'Lun', full: 'Lundi' },
  { key: 2, label: 'Mar', full: 'Mardi' },
  { key: 3, label: 'Mer', full: 'Mercredi' },
  { key: 4, label: 'Jeu', full: 'Jeudi' },
  { key: 5, label: 'Ven', full: 'Vendredi' },
  { key: 6, label: 'Sam', full: 'Samedi' },
  { key: 0, label: 'Dim', full: 'Dimanche' },
];

export default function TimeSlotForm({ planningId, defaultDuration, onSuccess }: TimeSlotFormProps) {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '11:00',
    capacity: 0,
    publicNote: '',
    splitSlots: false,
    slotDuration: defaultDuration,
    selectedDays: [1, 2, 3, 4, 5, 6, 0] as number[], // tous les jours cochés par défaut
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (dayKey: number) => {
    setForm((prev) => {
      const days = prev.selectedDays.includes(dayKey)
        ? prev.selectedDays.filter((d) => d !== dayKey)
        : [...prev.selectedDays, dayKey];
      return { ...prev, selectedDays: days };
    });
  };

  const selectWeekdays = () => {
    setForm((prev) => ({ ...prev, selectedDays: [1, 2, 3, 4, 5] }));
  };

  const selectAllDays = () => {
    setForm((prev) => ({ ...prev, selectedDays: [1, 2, 3, 4, 5, 6, 0] }));
  };

  const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  // Compute how many matching days in the range
  const countMatchingDays = (): number => {
    if (!form.startDate) return 0;
    const start = new Date(form.startDate + 'T00:00:00');
    const end = form.endDate ? new Date(form.endDate + 'T00:00:00') : start;
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (form.selectedDays.includes(d.getDay())) count++;
    }
    return count;
  };

  // Auto-select the day of week when a single date is chosen (no end date)
  const handleStartDateChange = (value: string) => {
    const updated = { ...form, startDate: value };
    if (value && !form.endDate) {
      const dayOfWeek = new Date(value + 'T00:00:00').getDay();
      if (!form.selectedDays.includes(dayOfWeek)) {
        updated.selectedDays = [...form.selectedDays, dayOfWeek];
      }
    }
    setForm(updated);
  };

  // Helper: what day is the start date
  const startDayLabel = form.startDate
    ? DAY_NAMES[new Date(form.startDate + 'T00:00:00').getDay()]
    : '';

  // Compute preview of what will be created
  const computePreview = (): string => {
    if (!form.startTime || !form.endTime) return '';
    const [sH, sM] = form.startTime.split(':').map(Number);
    const [eH, eM] = form.endTime.split(':').map(Number);
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    if (endMin <= startMin) return '';

    const days = countMatchingDays();
    if (days === 0) {
      if (!form.endDate) {
        return `Le ${form.startDate.split('-').reverse().join('/')} est un ${startDayLabel}. Cochez ce jour dans la liste ci-dessus.`;
      }
      return 'Aucun jour coché ne tombe dans la période sélectionnée.';
    }

    if (!form.splitSlots) {
      const fmtStart = form.startTime.replace(':', 'h');
      const fmtEnd = form.endTime.replace(':', 'h');
      return `${days} créneau${days > 1 ? 'x' : ''} de ${fmtStart} à ${fmtEnd}`;
    } else {
      const count = Math.floor((endMin - startMin) / form.slotDuration);
      if (count <= 0) return 'Durée trop longue pour cette plage';
      const total = count * days;
      return `${total} créneau${total > 1 ? 'x' : ''} de ${form.slotDuration} min sur ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.startTime || !form.endTime) {
      setError('La date, l\'heure de début et l\'heure de fin sont requises.');
      return;
    }

    if (form.selectedDays.length === 0) {
      setError('Sélectionnez au moins un jour de la semaine.');
      return;
    }

    const [sH, sM] = form.startTime.split(':').map(Number);
    const [eH, eM] = form.endTime.split(':').map(Number);
    if (eH * 60 + eM <= sH * 60 + sM) {
      setError('L\'heure de fin doit être après l\'heure de début.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slots: TimeSlotFormData[] = [];
      const start = new Date(form.startDate + 'T00:00:00');
      const end = form.endDate ? new Date(form.endDate + 'T00:00:00') : start;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Ne créer que pour les jours cochés
        if (!form.selectedDays.includes(d.getDay())) continue;

        const dateStr = d.toISOString().split('T')[0];

        if (form.splitSlots && form.slotDuration > 0) {
          const startMinutes = sH * 60 + sM;
          const endMinutes = eH * 60 + eM;

          for (let t = startMinutes; t + form.slotDuration <= endMinutes; t += form.slotDuration) {
            const slotStart = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
            const slotEnd = `${String(Math.floor((t + form.slotDuration) / 60)).padStart(2, '0')}:${String((t + form.slotDuration) % 60).padStart(2, '0')}`;
            slots.push({
              planningId,
              date: dateStr,
              startTime: slotStart,
              endTime: slotEnd,
              capacity: form.capacity,
              status: 'available',
              publicNote: form.publicNote || '',
            });
          }
        } else {
          slots.push({
            planningId,
            date: dateStr,
            startTime: form.startTime,
            endTime: form.endTime,
            capacity: form.capacity,
            status: 'available',
            publicNote: form.publicNote || '',
          });
        }
      }

      if (slots.length === 0) {
        setError('Aucun créneau à créer avec ces paramètres. Vérifiez les jours sélectionnés.');
        return;
      }

      await bulkCreateTimeSlots(slots);
      setForm({ ...form, startDate: '', endDate: '', publicNote: '' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création des créneaux.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent';
  const selectClass = 'px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent bg-white';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const getH = (t: string) => t.split(':')[0] || '09';
  const getM = (t: string) => {
    const m = t.split(':')[1] || '00';
    const n = parseInt(m);
    if (n <= 7) return '00';
    if (n <= 22) return '15';
    if (n <= 37) return '30';
    return '45';
  };

  const setTime = (field: 'startTime' | 'endTime', h: string, m: string) => {
    setForm({ ...form, [field]: `${h}:${m}` });
  };

  const preview = form.startDate && form.startTime && form.endTime ? computePreview() : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dates */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date de début *</label>
          <input type="date" value={form.startDate} onChange={(e) => handleStartDateChange(e.target.value)} className={inputClass} required />
          {startDayLabel && (
            <p className="text-xs text-[#1e3a8a] mt-1 font-medium">
              {startDayLabel.charAt(0).toUpperCase() + startDayLabel.slice(1)} {form.startDate.split('-').reverse().join('/')}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Date de fin (optionnel)</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Laissez vide pour un seul jour</p>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Jours de la semaine</label>
          <div className="flex gap-2">
            <button type="button" onClick={selectWeekdays} className="text-xs text-[#1e3a8a] hover:underline font-medium">
              Lun-Ven
            </button>
            <button type="button" onClick={selectAllDays} className="text-xs text-[#1e3a8a] hover:underline font-medium">
              Tous
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">Cochez les jours où vous souhaitez créer des créneaux</p>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = form.selectedDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Times */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Heure de début *</label>
          <div className="flex items-center gap-1">
            <select value={getH(form.startTime)} onChange={(e) => setTime('startTime', e.target.value, getM(form.startTime))} className={selectClass}>
              {hours.map((h) => (<option key={h} value={h}>{h}h</option>))}
            </select>
            <span className="text-gray-400 font-bold">:</span>
            <select value={getM(form.startTime)} onChange={(e) => setTime('startTime', getH(form.startTime), e.target.value)} className={selectClass}>
              {minutes.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Heure de fin *</label>
          <div className="flex items-center gap-1">
            <select value={getH(form.endTime)} onChange={(e) => setTime('endTime', e.target.value, getM(form.endTime))} className={selectClass}>
              {hours.map((h) => (<option key={h} value={h}>{h}h</option>))}
            </select>
            <span className="text-gray-400 font-bold">:</span>
            <select value={getM(form.endTime)} onChange={(e) => setTime('endTime', getH(form.endTime), e.target.value)} className={selectClass}>
              {minutes.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Split option */}
      <div className="bg-gray-50 rounded-lg p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.splitSlots}
            onChange={(e) => setForm({ ...form, splitSlots: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 accent-[#1e3a8a]"
          />
          <span className="text-sm font-medium text-gray-700">Découper en sous-créneaux</span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-6">Ex : un créneau 9h-12h découpé en 3 créneaux de 1h</p>
        {form.splitSlots && (
          <div className="mt-2 ml-6">
            <label className={labelClass}>Durée de chaque sous-créneau</label>
            <select
              value={form.slotDuration}
              onChange={(e) => setForm({ ...form, slotDuration: parseInt(e.target.value) })}
              className={selectClass}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
              <option value={120}>2h</option>
            </select>
          </div>
        )}
      </div>

      {/* Capacity */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.capacity === 0}
            onChange={(e) => setForm({ ...form, capacity: e.target.checked ? 0 : 1 })}
            className="w-4 h-4 rounded border-gray-300 accent-[#1e3a8a]"
          />
          <span className="text-sm font-medium text-gray-700">Pas de limite de places</span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-6">Décochez pour limiter le nombre de visiteurs par créneau</p>
        {form.capacity > 0 && (
          <div className="mt-2 ml-6">
            <label className={labelClass}>Nombre de places par créneau</label>
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Math.max(1, parseInt(e.target.value) || 1) })} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent" />
          </div>
        )}
      </div>

      {/* Note */}
      <div>
        <label className={labelClass}>Note publique</label>
        <textarea value={form.publicNote} onChange={(e) => setForm({ ...form, publicNote: e.target.value })} className={inputClass} rows={2} placeholder="ex : Apporter un masque, sonner en arrivant..." />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-[#1e3a8a]/5 text-[#1e3a8a] text-sm px-3 py-2.5 rounded-lg font-medium">
          {preview}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
      >
        {loading ? 'Création en cours...' : 'Ajouter les créneaux'}
      </button>
    </form>
  );
}
