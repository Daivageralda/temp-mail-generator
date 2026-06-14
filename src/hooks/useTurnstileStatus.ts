import { useState, useEffect, useCallback } from 'react';
import type { TurnstileStatus } from '../types';
import { templla } from '../api';
import { TURNSTILE_POLL_INTERVAL } from '../constants/providers';

export function useTurnstileStatus(isActive: boolean) {
  const [status, setStatus] = useState<TurnstileStatus>({
    tokenReady: false,
    browserOpen: false,
    pageOpen: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const check = async () => {
      try {
        const data = await templla.getStatus();
        setStatus(data);
      } catch {
        // ignore
      }
    };

    check();
    const id = setInterval(check, TURNSTILE_POLL_INTERVAL);
    return () => clearInterval(id);
  }, [isActive]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await templla.refreshToken();
      const data = await templla.getStatus();
      setStatus(data);
    } catch {
      // ignore
    }
    setRefreshing(false);
  }, []);

  return { status, refreshing, handleRefresh };
}
