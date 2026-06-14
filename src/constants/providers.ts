import type { ProviderConfig } from '../types';

export const PROVIDERS: ProviderConfig[] = [
  {
    value: 'temp-mail.io',
    label: 'Temp-Mail.io',
    description: 'Clean domains, best for most services',
  },
  {
    value: 'mail.tm',
    label: 'Mail.tm',
    description: 'Reliable, good for testing',
  },
  {
    value: 'guerrilla',
    label: 'Guerrilla Mail',
    description: 'Classic provider, may be blocked',
  },
  {
    value: 'hanzzcreator.xyz',
    label: '🏠 hanzzcreator.xyz',
    description: 'Custom domain — your own email server',
  },
];

export const API_BASE = 'http://localhost:3001/api';
export const MAX_EMAIL_COUNT = 50;
export const EMAIL_GEN_DELAY = 200; // ms between requests
export const INBOX_REFRESH_INTERVAL = 5000; // ms
export const TURNSTILE_POLL_INTERVAL = 2000; // ms
