'use client';

import { useState, useEffect } from 'react';
import { subscribeToBookingsForPlanning } from '@/services/bookings';
import type { Booking } from '@/types';

export function useBookings(planningId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planningId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToBookingsForPlanning(planningId, (b) => {
      setBookings(b);
      setLoading(false);
    });
    return unsubscribe;
  }, [planningId]);

  return { bookings, loading };
}
