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

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function PlanningForm({ initial, onSubmit, submitLabel = 'Créer le planning' }: PlanningFormProps) {
  const [form, setForm] = useState<PlanningFormData>({
    slug: initial?.slug || generateCode(),
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
    adminName: initial?.adminName || '',
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
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentName.trim() || !form.title.trim() || !form.slug.trim() || !form.adminPassword.trim() || !form.adminEmail?.trim() || !form.adminName?.trim()) {
      setError('Merci de remplir tous les champs marqués d\'une étoile *.');
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
      {/* Qui organisez-vous les visites ? */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Qui allez-vous visiter ?</legend>
        <p className="text-xs text-gray-400 mt-1 mb-3">Indiquez les informations de la personne que vos proches viendront voir.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nom de famille *</label>
            <input type="text" value={form.residentName} onChange={(e) => updateField('residentName', e.target.value)} className={inputClass} placeholder="ex : Dupont" required />
          </div>
          <div>
            <label className={labelClass}>Prénom</label>
            <input type="text" value={form.residentFirstName} onChange={(e) => updateField('residentFirstName', e.target.value)} className={inputClass} placeholder="ex : Marie" />
          </div>
          <div>
            <label className={labelClass}>Où se trouvent-ils ?</label>
            <select value={form.residentType} onChange={(e) => updateField('residentType', e.target.value)} className={inputClass}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nom de l&apos;établissement</label>
            <input type="text" value={form.locationName} onChange={(e) => updateField('locationName', e.target.value)} className={inputClass} placeholder="ex : EHPAD Les Oliviers, Hôpital Dupuytren..." />
            <p className="text-xs text-gray-400 mt-1">Laissez vide si c&apos;est à domicile</p>
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
              placeholder="ex : 12 rue des Lilas, 75020 Paris"
              autoComplete="off"
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
            />
            <p className="text-xs text-gray-400 mt-1">Commencez à taper, des suggestions apparaîtront</p>
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
            <label className={labelClass}>Chambre / étage / code</label>
            <input type="text" value={form.room} onChange={(e) => updateField('room', e.target.value)} className={inputClass} placeholder="ex : Chambre 204, 2ème étage, code 1234A" />
          </div>
        </div>
      </fieldset>

      {/* Vos informations */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Vos informations (organisateur)</legend>
        <p className="text-xs text-gray-400 mt-1 mb-3">Ces informations servent à vous identifier et à vous reconnecter.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Votre prénom *</label>
            <input type="text" value={form.adminName} onChange={(e) => updateField('adminName', e.target.value)} className={inputClass} placeholder="ex : Loic" required />
            <p className="text-xs text-gray-400 mt-1">Sera affiché sur la page comme &quot;Organisé par...&quot;</p>
          </div>
          <div>
            <label className={labelClass}>Votre email *</label>
            <input type="email" value={form.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} className={inputClass} placeholder="ex : loic@gmail.com" required />
            <p className="text-xs text-gray-400 mt-1">Pour vous reconnecter et recevoir les notifications</p>
          </div>
          <div>
            <label className={labelClass}>Choisissez un mot de passe *</label>
            <input type="text" value={form.adminPassword} onChange={(e) => updateField('adminPassword', e.target.value)} className={inputClass} placeholder="ex : mamandupont2026" required />
            <p className="text-xs text-gray-400 mt-1">Choisissez quelque chose de facile à retenir</p>
          </div>
        </div>
      </fieldset>

      {/* Configuration du planning */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Votre planning</legend>
        <p className="text-xs text-gray-400 mt-1 mb-3">Donnez un titre à votre planning et configurez les dates.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titre du planning *</label>
            <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} placeholder="ex : Visites pour Marie Dupont" required />
            <p className="text-xs text-gray-400 mt-1">C&apos;est le titre principal affiché en haut de la page</p>
          </div>
          <div>
            <label className={labelClass}>Code de votre planning</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">planning-visites.fr/planning/</span>
              <span className="text-lg font-mono font-bold text-[#1e3a8a]">{form.slug}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Ce code est généré automatiquement, il servira à accéder à votre planning</p>
          </div>
          <div>
            <label className={labelClass}>Durée d&apos;une visite</label>
            <input type="number" min={15} step={15} value={form.defaultVisitDuration} onChange={(e) => updateField('defaultVisitDuration', parseInt(e.target.value) || 60)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">En minutes (ex : 60 = 1 heure)</p>
          </div>
          <div>
            <label className={labelClass}>Date de début</label>
            <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date de fin (optionnel)</label>
            <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Laissez vide si vous ne savez pas encore</p>
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className="bg-white rounded-xl border border-gray-100 p-5">
        <legend className="text-sm font-semibold text-gray-900 px-2">Informations pour les visiteurs</legend>
        <p className="text-xs text-gray-400 mt-1 mb-3">Ces messages seront visibles par les personnes qui consultent le planning.</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Message important (affiché en évidence)</label>
            <textarea value={form.adminMessage} onChange={(e) => updateField('adminMessage', e.target.value)} className={inputClass} rows={3} placeholder={"ex : Code d'entrée 1234A\nKiné les lundis 13h-14h30\nNe pas venir entre 12h et 13h (repas)"} />
            <p className="text-xs text-gray-400 mt-1">Vous pouvez faire des retours à la ligne avec la touche Entrée</p>
          </div>
          <div>
            <label className={labelClass}>Informations complémentaires</label>
            <textarea value={form.publicNotes} onChange={(e) => updateField('publicNotes', e.target.value)} className={inputClass} rows={2} placeholder="ex : Parking gratuit devant la maison, sonner 2 fois..." />
          </div>
          <div>
            <label className={labelClass}>Notes privées (visibles uniquement par vous)</label>
            <textarea value={form.privateNotes} onChange={(e) => updateField('privateNotes', e.target.value)} className={inputClass} rows={2} placeholder="ex : Rappeler le médecin lundi, clé chez la voisine..." />
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
