'use client';

import { useState } from 'react';
import { bulkCreateTimeSlots } from '@/services/timeSlots';
import type { TimeSlotFormData } from '@/types';

interface TimeSlotFormProps {
  planningId: string;
  defaultDuration: number;
  onSuccess: () => void;
}

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute preview of what will be created
  const computePreview = (): string => {
    if (!form.startTime || !form.endTime) return '';
    const [sH, sM] = form.startTime.split(':').map(Number);
    const [eH, eM] = form.endTime.split(':').map(Number);
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    if (endMin <= startMin) return '';

    const days = form.endDate && form.endDate !== form.startDate
      ? Math.ceil((new Date(form.endDate + 'T00:00:00').getTime() - new Date(form.startDate + 'T00:00:00').getTime()) / 86400000) + 1
      : 1;
    const dayLabel = days > 1 ? ` x ${days} jours` : '';

    if (!form.splitSlots) {
      const fmtStart = form.startTime.replace(':', 'h');
      const fmtEnd = form.endTime.replace(':', 'h');
      return `${days} créneau${days > 1 ? 'x' : ''} de ${fmtStart} à ${fmtEnd}${dayLabel}`;
    } else {
      const count = Math.floor((endMin - startMin) / form.slotDuration);
      if (count <= 0) return 'Durée trop longue pour cette plage';
      const total = count * days;
      return `${total} créneau${total > 1 ? 'x' : ''} de ${form.slotDuration} min${dayLabel}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.startTime || !form.endTime) {
      setError('La date, l\'heure de début et l\'heure de fin sont requises.');
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
        const dateStr = d.toISOString().split('T')[0];

        if (form.splitSlots && form.slotDuration > 0) {
          // Split into sub-slots
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
          // One single slot per day
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
        setError('Aucun créneau à créer avec ces paramètres.');
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
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Date de fin (optionnel)</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Laissez vide pour un seul jour</p>
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
        {form.splitSlots && (
          <div className="mt-2">
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
        {form.capacity > 0 && (
          <div className="mt-2">
            <label className={labelClass}>Nombre de places</label>
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Math.max(1, parseInt(e.target.value) || 1) })} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent" />
          </div>
        )}
      </div>

      {/* Note */}
      <div>
        <label className={labelClass}>Note publique</label>
        <textarea value={form.publicNote} onChange={(e) => setForm({ ...form, publicNote: e.target.value })} className={inputClass} rows={3} placeholder="Note visible par les visiteurs" />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-[#1e3a8a]/5 text-[#1e3a8a] text-sm px-3 py-2 rounded-lg font-medium">
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
        {loading ? 'Création...' : 'Ajouter les créneaux'}
      </button>
    </form>
  );
}
