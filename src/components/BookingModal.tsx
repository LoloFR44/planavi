'use client';

import { useState } from 'react';
import { createBooking } from '@/services/bookings';
import { downloadIcs } from '@/utils/ics';
import type { TimeSlot, Planning } from '@/types';

interface BookingModalProps {
  slot: TimeSlot;
  planning: Planning;
  onClose: () => void;
  onSuccess: () => void;
}

const RELATIONS = [
  { value: '', label: 'Sélectionner (optionnel)' },
  { value: 'fils', label: 'Fils / Fille' },
  { value: 'conjoint', label: 'Conjoint(e)' },
  { value: 'petit-enfant', label: 'Petit-enfant' },
  { value: 'frere-soeur', label: 'Frère / Soeur' },
  { value: 'ami', label: 'Ami(e)' },
  { value: 'voisin', label: 'Voisin(e)' },
  { value: 'aidant', label: 'Aidant(e)' },
  { value: 'autre', label: 'Autre' },
];

export default function BookingModal({ slot, planning, onClose, onSuccess }: BookingModalProps) {
  const [form, setForm] = useState({
    visitorFirstName: '',
    visitorLastName: '',
    visitorPhone: '',
    visitorEmail: '',
    visitorCount: 1,
    visitorRelation: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitorFirstName.trim() || !form.visitorLastName.trim()) {
      setError('Le prénom et le nom sont requis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBooking({
        planningId: slot.planningId,
        timeSlotId: slot.id,
        visitorFirstName: form.visitorFirstName.trim(),
        visitorLastName: form.visitorLastName.trim(),
        visitorPhone: form.visitorPhone.trim() || '',
        visitorEmail: form.visitorEmail.trim() || '',
        visitorCount: form.visitorCount,
        visitorRelation: form.visitorRelation || '',
        comment: form.comment.trim() || '',
      });

      // Send email notification to admin (fire and forget)
      if (planning.adminEmail) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: planning.adminEmail,
            residentName: planning.residentName,
            planningTitle: planning.title,
            visitorFirstName: form.visitorFirstName.trim(),
            visitorLastName: form.visitorLastName.trim(),
            visitorRelation: form.visitorRelation || '',
            visitorCount: form.visitorCount,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            comment: form.comment.trim() || '',
            planningSlug: planning.slug,
          }),
        }).catch(() => {});
      }

      // Send confirmation email to visitor (fire and forget)
      if (form.visitorEmail.trim()) {
        fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.visitorEmail.trim(),
            visitorFirstName: form.visitorFirstName.trim(),
            visitorLastName: form.visitorLastName.trim(),
            residentName: planning.residentName,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            visitorCount: form.visitorCount,
            locationName: planning.locationName || '',
            address: planning.address || '',
            planningSlug: planning.slug,
          }),
        }).catch(() => {});
      }

      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success screen */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#3db54a]/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-[#3db54a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Visite confirmée !</h2>
            <p className="text-sm text-gray-500 mb-6">
              {formatDate(slot.date)} de {slot.startTime} à {slot.endTime}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  downloadIcs({
                    title: `Visite - ${planning.residentName}`,
                    description: `Visite auprès de ${planning.residentName} via Planavi`,
                    location: [planning.locationName, planning.address].filter(Boolean).join(', ') || undefined,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  });
                }}
                className="w-full py-2.5 text-sm font-medium text-[#1e3a8a] bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ajouter au calendrier
              </button>
              <button
                onClick={() => { onSuccess(); }}
                className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
              >
                Fermer
              </button>
            </div>
            {form.visitorEmail.trim() && (
              <p className="text-xs text-gray-400 mt-3">
                Un email de confirmation a été envoyé à {form.visitorEmail.trim()}
              </p>
            )}
          </div>
        ) : (
        <>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Réserver un créneau</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(slot.date)} &middot; {slot.startTime} - {slot.endTime}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                value={form.visitorFirstName}
                onChange={(e) => setForm({ ...form, visitorFirstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="Jean"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={form.visitorLastName}
                onChange={(e) => setForm({ ...form, visitorLastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien avec la personne</label>
            <select
              value={form.visitorRelation}
              onChange={(e) => setForm({ ...form, visitorRelation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={form.visitorPhone}
                onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="06 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.visitorEmail}
                onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                placeholder="jean@email.fr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de visiteurs
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.visitorCount}
              onChange={(e) => setForm({ ...form, visitorCount: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
              rows={2}
              placeholder="Un message pour la famille ou le résident..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              {loading ? 'Réservation...' : 'Confirmer'}
            </button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
}
