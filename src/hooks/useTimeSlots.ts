'use client';

import { useState, useEffect } from 'react';
import { subscribeToTimeSlots } from '@/services/timeSlots';
import type { TimeSlot } from '@/types';

export function useTimeSlots(planningId: string | undefined) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planningId) {
      setTimeSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToTimeSlots(planningId, (slots) => {
      setTimeSlots(slots);
      setLoading(false);
    });
    return unsubscribe;
  }, [planningId]);

  return { timeSlots, loading };
}
