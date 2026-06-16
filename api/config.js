// ─── Application Configuration ────────────────────────────────────────────────

export const PORT = process.env.PORT || 3001;

// ─── Cloudflare Worker (Custom Domain Provider) ──────────────────────────────

export const WORKER_URL = process.env.WORKER_URL || '';

// ─── Provider Registry (order = priority, first = default) ───────────────────

export const PROVIDERS = [
  { id: 'custom-domain', name: 'Custom Domain', route: '/api/custom', primary: true },
  { id: 'tempmail-io', name: 'Temp-Mail.io', route: '/api/tempmail' },
  { id: 'mail-tm', name: 'Mail.tm', route: '/api/mailtm' },
  { id: 'guerrilla', name: 'Guerrilla Mail', route: '/api/guerrilla' },
];

// ─── External API Base URLs ──────────────────────────────────────────────────

export const TEMP_MAIL_IO_API = 'https://api.internal.temp-mail.io/api/v3';
export const MAIL_TM_API = 'https://api.mail.tm';
export const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';

// ─── Misc ────────────────────────────────────────────────────────────────────

export const INBOX_AUTO_REFRESH = 5000; // ms
