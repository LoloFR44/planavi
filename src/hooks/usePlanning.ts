'use client';

import { useState, useEffect } from 'react';
import { subscribeToPlanningBySlug, subscribeToPlannings } from '@/services/plannings';
import type { Planning } from '@/types';

export function usePlanningBySlug(slug: string) {
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPlanningBySlug(slug, (p) => {
      setPlanning(p);
      setLoading(false);
    });
    return unsubscribe;
  }, [slug]);

  return { planning, loading, error };
}

export function usePlannings() {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPlannings((p) => {
      setPlannings(p);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { plannings, loading };
}
