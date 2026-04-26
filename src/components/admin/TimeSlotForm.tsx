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
  { key: 1, label: 'Lun' },
  { key: 2, label: 'Mar' },
  { key: 3, label: 'Mer' },
  { key: 4, label: 'Jeu' },
  { key: 5, label: 'Ven' },
  { key: 6, label: 'Sam' },
  { key: 0, label: 'Dim' },
];

const TIME_PRESETS = [
  { id: 'morning', label: 'Matin', icon: '☀', startTime: '10:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Après-midi', icon: '🌤', startTime: '14:00', endTime: '18:00' },
  { id: 'custom', label: 'Personnalisé', icon: '✏', startTime: '', endTime: '' },
];

const DEFAULT_WEEKS = 4;

export default function TimeSlotForm({ planningId, defaultDuration, onSuccess }: TimeSlotFormProps) {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '12:00',
    capacity: 2,
    publicNote: '',
    splitSlots: false,
    slotDuration: defaultDuration,
    selectedDays: [1, 2, 3, 4, 5, 6, 0] as number[],
    selectedPresets: ['morning'] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Day selection
  const toggleDay = (dayKey: number) => {
    setForm((prev) => {
      const days = prev.selectedDays.includes(dayKey)
        ? prev.selectedDays.filter((d) => d !== dayKey)
        : [...prev.selectedDays, dayKey];
      return { ...prev, selectedDays: days };
    });
  };

  const selectWeekdays = () => setForm((prev) => ({ ...prev, selectedDays: [1, 2, 3, 4, 5] }));
  const selectWeekend = () => setForm((prev) => ({ ...prev, selectedDays: [6, 0] }));
  const selectAllDays = () => setForm((prev) => ({ ...prev, selectedDays: [1, 2, 3, 4, 5, 6, 0] }));

  // Check which shortcut is active
  const isWeekdays = form.selectedDays.length === 5 && [1, 2, 3, 4, 5].every((k) => form.selectedDays.includes(k));
  const isWeekend = form.selectedDays.length === 2 && [6, 0].every((k) => form.selectedDays.includes(k));
  const isAll = form.selectedDays.length === 7;

  // Preset selection
  const togglePreset = (presetId: string) => {
    setForm((prev) => {
      if (presetId === 'custom') {
        // Custom replaces all presets
        return { ...prev, selectedPresets: ['custom'], startTime: prev.startTime || '09:00', endTime: prev.endTime || '11:00' };
      }
      // Toggle preset, remove custom if selecting a named preset
      let presets = prev.selectedPresets.filter((p) => p !== 'custom');
      if (presets.includes(presetId)) {
        presets = presets.filter((p) => p !== presetId);
      } else {
        presets = [...presets, presetId];
      }
      if (presets.length === 0) presets = [presetId];
      return { ...prev, selectedPresets: presets };
    });
  };

  const isCustomMode = form.selectedPresets.includes('custom');

  // Compute effective end date
  const getEffectiveEnd = (): Date | null => {
    if (!form.startDate) return null;
    if (form.endDate) return new Date(form.endDate + 'T00:00:00');
    const d = new Date(form.startDate + 'T00:00:00');
    d.setDate(d.getDate() + DEFAULT_WEEKS * 7 - 1);
    return d;
  };

  const formatDateFr = (d: Date): string =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  // Count matching days
  const countMatchingDays = (): number => {
    if (!form.startDate) return 0;
    const start = new Date(form.startDate + 'T00:00:00');
    const end = getEffectiveEnd()!;
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (form.selectedDays.includes(d.getDay())) count++;
    }
    return count;
  };

  // Compute total slots
  const computeTotalSlots = (): number => {
    const days = countMatchingDays();
    if (days === 0) return 0;

    if (isCustomMode) {
      if (!form.startTime || !form.endTime) return 0;
      if (form.splitSlots && form.slotDuration > 0) {
        const [sH, sM] = form.startTime.split(':').map(Number);
        const [eH, eM] = form.endTime.split(':').map(Number);
        const count = Math.floor((eH * 60 + eM - (sH * 60 + sM)) / form.slotDuration);
        return Math.max(0, count) * days;
      }
      return days;
    }

    // Presets: count slots per preset per day
    let slotsPerDay = 0;
    for (const presetId of form.selectedPresets) {
      const preset = TIME_PRESETS.find((p) => p.id === presetId);
      if (!preset) continue;
      if (form.splitSlots && form.slotDuration > 0) {
        const [sH, sM] = preset.startTime.split(':').map(Number);
        const [eH, eM] = preset.endTime.split(':').map(Number);
        slotsPerDay += Math.max(0, Math.floor((eH * 60 + eM - (sH * 60 + sM)) / form.slotDuration));
      } else {
        slotsPerDay += 1;
      }
    }
    return slotsPerDay * days;
  };

  const totalSlots = form.startDate ? computeTotalSlots() : 0;
  const effectiveEnd = getEffectiveEnd();
  const weeks = form.startDate && effectiveEnd
    ? Math.ceil((effectiveEnd.getTime() - new Date(form.startDate + 'T00:00:00').getTime()) / (7 * 86400000))
    : 0;

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate) {
      setError('La date de début est requise.');
      return;
    }
    if (form.selectedDays.length === 0) {
      setError('Sélectionnez au moins un jour.');
      return;
    }
    if (totalSlots === 0) {
      setError('Aucun créneau à créer avec ces paramètres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slots: TimeSlotFormData[] = [];
      const start = new Date(form.startDate + 'T00:00:00');
      const end = getEffectiveEnd()!;

      // Determine time ranges to create
      const timeRanges: { startTime: string; endTime: string }[] = [];
      if (isCustomMode) {
        if (form.splitSlots && form.slotDuration > 0) {
          const [sH, sM] = form.startTime.split(':').map(Number);
          const [eH, eM] = form.endTime.split(':').map(Number);
          for (let t = sH * 60 + sM; t + form.slotDuration <= eH * 60 + eM; t += form.slotDuration) {
            timeRanges.push({
              startTime: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
              endTime: `${String(Math.floor((t + form.slotDuration) / 60)).padStart(2, '0')}:${String((t + form.slotDuration) % 60).padStart(2, '0')}`,
            });
          }
        } else {
          timeRanges.push({ startTime: form.startTime, endTime: form.endTime });
        }
      } else {
        for (const presetId of form.selectedPresets) {
          const preset = TIME_PRESETS.find((p) => p.id === presetId);
          if (!preset) continue;
          if (form.splitSlots && form.slotDuration > 0) {
            const [sH, sM] = preset.startTime.split(':').map(Number);
            const [eH, eM] = preset.endTime.split(':').map(Number);
            for (let t = sH * 60 + sM; t + form.slotDuration <= eH * 60 + eM; t += form.slotDuration) {
              timeRanges.push({
                startTime: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
                endTime: `${String(Math.floor((t + form.slotDuration) / 60)).padStart(2, '0')}:${String((t + form.slotDuration) % 60).padStart(2, '0')}`,
              });
            }
          } else {
            timeRanges.push({ startTime: preset.startTime, endTime: preset.endTime });
          }
        }
      }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (!form.selectedDays.includes(d.getDay())) continue;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        for (const range of timeRanges) {
          slots.push({
            planningId,
            date: dateStr,
            startTime: range.startTime,
            endTime: range.endTime,
            capacity: form.capacity,
            status: 'available',
            publicNote: form.publicNote || '',
          });
        }
      }

      if (slots.length === 0) {
        setError('Aucun créneau à créer.');
        return;
      }

      await bulkCreateTimeSlots(slots);
      setForm({ ...form, startDate: '', endDate: '', publicNote: '' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Période */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Période</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Date de début *</p>
          </div>
          <div>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Jusqu&apos;au {form.endDate ? '' : `(défaut : ${DEFAULT_WEEKS} semaines)`}
            </p>
          </div>
        </div>
      </div>

      {/* Jours */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Jours</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button
            type="button"
            onClick={selectWeekdays}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isWeekdays
                ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] ring-1 ring-[#1e3a8a]/30'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            Lun-Ven
          </button>
          <button
            type="button"
            onClick={selectWeekend}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isWeekend
                ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] ring-1 ring-[#1e3a8a]/30'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            Week-end
          </button>
          <button
            type="button"
            onClick={selectAllDays}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isAll
                ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] ring-1 ring-[#1e3a8a]/30'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            Tous
          </button>
        </div>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = form.selectedDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-300 border border-gray-100 hover:border-gray-200 hover:text-gray-400'
                }`}
              >
                {day.label}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1 w-4 h-4 bg-[#3db54a] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Créneaux horaires */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Créneau horaire</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {TIME_PRESETS.map((preset) => {
            const isSelected = form.selectedPresets.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => togglePreset(preset.id)}
                className={`py-3 px-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-[#1e3a8a] bg-[#1e3a8a]/5'
                    : 'border border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <span className="text-base">{preset.icon}</span>
                <p className={`text-sm font-semibold mt-0.5 ${isSelected ? 'text-[#1e3a8a]' : 'text-gray-600'}`}>
                  {preset.label}
                </p>
                {preset.startTime && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {preset.startTime.replace(':', 'h')} - {preset.endTime.replace(':', 'h')}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom time inputs */}
        {isCustomMode && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <select
                value={getH(form.startTime)}
                onChange={(e) => setTime('startTime', e.target.value, getM(form.startTime))}
                className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                {hours.map((h) => (<option key={h} value={h}>{h}h</option>))}
              </select>
              <span className="text-gray-300">:</span>
              <select
                value={getM(form.startTime)}
                onChange={(e) => setTime('startTime', getH(form.startTime), e.target.value)}
                className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                {minutes.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex items-center gap-1">
              <select
                value={getH(form.endTime)}
                onChange={(e) => setTime('endTime', e.target.value, getM(form.endTime))}
                className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                {hours.map((h) => (<option key={h} value={h}>{h}h</option>))}
              </select>
              <span className="text-gray-300">:</span>
              <select
                value={getM(form.endTime)}
                onChange={(e) => setTime('endTime', getH(form.endTime), e.target.value)}
                className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                {minutes.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Découper en sous-créneaux */}
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
        <p className="text-xs text-gray-400 mt-1 ml-6">Ex : Après-midi 14h-18h → 2 créneaux de 2h</p>
        {form.splitSlots && (
          <div className="mt-2 ml-6">
            <select
              value={form.slotDuration}
              onChange={(e) => setForm({ ...form, slotDuration: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            >
              <option value={30}>30 min</option>
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
              <option value={120}>2h</option>
            </select>
          </div>
        )}
      </div>

      {/* Places par créneau */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Places par créneau</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, capacity: Math.max(0, form.capacity - 1) })}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-colors"
          >
            −
          </button>
          <span className="text-xl font-semibold text-gray-800 min-w-[2rem] text-center">
            {form.capacity === 0 ? '∞' : form.capacity}
          </span>
          <button
            type="button"
            onClick={() => setForm({ ...form, capacity: form.capacity + 1 })}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-colors"
          >
            +
          </button>
          <span className="text-xs text-gray-400">
            {form.capacity === 0 ? 'Pas de limite' : `${form.capacity} visiteur${form.capacity > 1 ? 's' : ''} max`}
          </span>
        </div>
      </div>

      {/* Note publique */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Note publique</p>
        <textarea
          value={form.publicNote}
          onChange={(e) => setForm({ ...form, publicNote: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
          rows={2}
          placeholder="ex : Apporter un masque, sonner en arrivant..."
        />
      </div>

      {/* Preview */}
      {form.startDate && totalSlots > 0 && (
        <div className="bg-[#1e3a8a]/5 text-[#1e3a8a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg font-bold">{totalSlots}</span>
          <span className="font-medium">
            créneau{totalSlots > 1 ? 'x' : ''} seront créés sur {weeks} semaine{weeks > 1 ? 's' : ''}
            {effectiveEnd && !form.endDate && (
              <span className="text-xs text-[#1e3a8a]/60 ml-1">(jusqu&apos;au {formatDateFr(effectiveEnd)})</span>
            )}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || totalSlots === 0}
        className="w-full py-3 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
      >
        {loading ? 'Création en cours...' : `Créer ${totalSlots > 0 ? totalSlots : 'les'} créneau${totalSlots > 1 ? 'x' : ''}`}
      </button>
    </form>
  );
}
