'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlanningFormData } from '@/types';

interface PlanningFormProps {
  initial?: Partial<PlanningFormData>;
  onSubmit: (data: PlanningFormData) => Promise<void>;
  submitLabel?: string;
}

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: Record<string, string>;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PlanningForm({ initial, onSubmit, submitLabel = 'Créer le planning' }: PlanningFormProps) {
  const [form, setForm] = useState<PlanningFormData>({
    slug: initial?.slug || '',
    title: initial?.title || '',
    residentName: initial?.residentName || '',
    residentFirstName: initial?.residentFirstName || '',
    residentType: initial?.residentType || 'home',
    locationName: initial?.locationName || '',
    address: initial?.address || '',
    room: initial?.room || '',
    publicNotes: initial?.publicNotes || '',
    privateNotes: initial?.privateNotes || '',
    adminMessage: initial?.adminMessage || '',
    defaultVisitDuration: initial?.defaultVisitDuration || 60,
    startDate: initial?.startDate || new Date().toISOString().split('T')[0],
    endDate: initial?.endDate || '',
    isActive: initial?.isActive ?? true,
    adminPassword: initial?.adminPassword || '',
    adminEmail: initial?.adminEmail || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const debouncedRequest = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const value = (form.address || '').trim();

    if (debouncedRequest.current) {
      clearTimeout(debouncedRequest.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsAddressLoading(false);
      return;
    }

    debouncedRequest.current = setTimeout(async () => {
      setIsAddressLoading(true);

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=fr&accept-language=fr&q=${encodeURIComponent(value)}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Planavi/1.0 (https://example.com)',
            'Accept-Language': 'fr',
          },
        });

        if (!res.ok) {
          throw new Error('Erreur de recherche d\'adresse');
        }

        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsAddressLoading(false);
      }
    }, 350);

    return () => {
      if (debouncedRequest.current) {
        clearTimeout(debouncedRequest.current);
      }
    };
  }, [form.address]);

  const selectSuggestion = (item: NominatimResult) => {
    setForm((prev) => ({ ...prev, address: item.display_name }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const updateField = (field: keyof PlanningFormData, value: string | number | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'residentName' && !initial?.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentName.trim() || !form.title.trim() || !form.slug.trim() || !form.adminPassword.trim()) {
      setError('Les champs nom, titre, slug et mot de passe admin sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const TYPE_OPTIONS = [
    { value: 'home', label: 'A domicile' },
    { value: 'hospital', label: 'Hôpital' },
    { value: 'nursing_home', label: 'EHPAD / Maison de retraite' },
    { value: 'other', label: 'Autre' },
  ];

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personne visitée */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Personne visitée</legend>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelClass}>Nom affiché *</label>
            <input type="text" value={form.residentName} onChange={(e) => updateField('residentName', e.target.value)} className={inputClass} placeholder="Dupont" required />
          </div>
          <div>
            <label className={labelClass}>Prénom</label>
            <input type="text" value={form.residentFirstName} onChange={(e) => updateField('residentFirstName', e.target.value)} className={inputClass} placeholder="Marie" />
          </div>
          <div>
            <label className={labelClass}>Type de lieu</label>
            <select value={form.residentType} onChange={(e) => updateField('residentType', e.target.value)} className={inputClass}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nom du lieu</label>
            <input type="text" value={form.locationName} onChange={(e) => updateField('locationName', e.target.value)} className={inputClass} placeholder="EHPAD Les Oliviers" />
          </div>
          <div className="sm:col-span-2 relative">
            <label className={labelClass}>Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => {
                updateField('address', e.target.value);
              }}
              className={inputClass}
              placeholder="12 rue des Lilas, 75020 Paris"
              autoComplete="off"
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
            />
            {isAddressLoading && (
              <div className="absolute right-2 top-10 text-xs text-gray-500">Recherche...</div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {suggestions.map((item) => (
                  <li
                    key={item.place_id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(item);
                    }}
                    className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-[#1e3a8a]/5"
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className={labelClass}>Chambre / étage / indications</label>
            <input type="text" value={form.room} onChange={(e) => updateField('room', e.target.value)} className={inputClass} placeholder="Chambre 204, 2ème étage" />
          </div>
        </div>
      </fieldset>

      {/* Configuration du planning */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Configuration</legend>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titre du planning *</label>
            <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} placeholder="Visites pour Marie Dupont" required />
          </div>
          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">/planning/</span>
              <input type="text" value={form.slug} onChange={(e) => updateField('slug', slugify(e.target.value))} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Mot de passe admin *</label>
            <input type="password" value={form.adminPassword} onChange={(e) => updateField('adminPassword', e.target.value)} className={inputClass} placeholder="Mot de passe pour gérer ce planning" required />
          </div>
          <div>
            <label className={labelClass}>Email admin (notifications)</label>
            <input type="email" value={form.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} className={inputClass} placeholder="admin@email.fr" />
            <p className="text-xs text-gray-400 mt-1">Recevez un email à chaque nouvelle réservation</p>
          </div>
          <div>
            <label className={labelClass}>Durée par défaut (min)</label>
            <input type="number" min={15} step={15} value={form.defaultVisitDuration} onChange={(e) => updateField('defaultVisitDuration', parseInt(e.target.value) || 60)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date de début</label>
            <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date de fin (optionnel)</label>
            <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Notes et messages</legend>
        <div className="space-y-4 mt-3">
          <div>
            <label className={labelClass}>Message public (affiché aux visiteurs)</label>
            <textarea value={form.adminMessage} onChange={(e) => updateField('adminMessage', e.target.value)} className={inputClass} rows={2} placeholder="Message visible sur la page publique..." />
          </div>
          <div>
            <label className={labelClass}>Notes publiques</label>
            <textarea value={form.publicNotes} onChange={(e) => updateField('publicNotes', e.target.value)} className={inputClass} rows={2} placeholder="Informations pratiques pour les visiteurs..." />
          </div>
          <div>
            <label className={labelClass}>Notes privées (admin uniquement)</label>
            <textarea value={form.privateNotes} onChange={(e) => updateField('privateNotes', e.target.value)} className={inputClass} rows={2} placeholder="Notes internes..." />
          </div>
        </div>
      </fieldset>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
      >
        {loading ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}
