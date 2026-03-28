'use client';

import { useState, useEffect } from 'react';
import { subscribeToMessages } from '@/services/messages';
import type { Message } from '@/types';

export function useMessages(planningId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planningId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToMessages(planningId, (m) => {
      setMessages(m);
      setLoading(false);
    });
    return unsubscribe;
  }, [planningId]);

  return { messages, loading };
}
