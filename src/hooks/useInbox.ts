import { useState, useEffect, useCallback, useRef } from 'react';
import type { TempEmail, Message } from '../types';
import { getMessages as fetchMessages, getMessage as fetchMessage } from '../api';
import { INBOX_REFRESH_INTERVAL } from '../constants/providers';

export function useInbox(email: TempEmail | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const msgs = await fetchMessages(email);
      setMessages(msgs);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [email]);

  // Auto-refresh
  useEffect(() => {
    if (!email) return;

    refresh(); // Initial fetch
    intervalRef.current = window.setInterval(refresh, INBOX_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [email, refresh]);

  const openMessage = useCallback(
    async (msg: Message) => {
      if (!email) return null;
      setLoading(true);
      try {
        const full = await fetchMessage(email, msg.id);
        return full;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return { messages, loading, refresh, openMessage };
}
