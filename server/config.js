// ─── Application Configuration ────────────────────────────────────────────────

export const PORT = process.env.PORT || 3001;

export const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

export const TEMPLA_DOMAINS = [
  'compressjpg.io',
  'aiphotoeditor.io',
  'gagcalculator.me',
  'pinkgreengenerator.me',
  'aiphotoenhancer.me',
  'lovecalculatorname.org',
  'whitehousecalculator.com',
  'wplacetools.com',
  'lordofmysteries.org',
  'sorawatermarkadder.org',
  'deshnetarchadacalculator.one',
];

export const TURNSTILE_SITEKEY = '0x4AAAAAAAGjFkqhSbOPgxmK';
export const TURNSTILE_POLL_INTERVAL = 1000; // ms
export const TURNSTILE_MAX_WAIT = 120; // seconds
export const INBOX_AUTO_REFRESH = 5000; // ms

export const TEMP_MAIL_IO_API = 'https://api.internal.temp-mail.io/api/v3';
export const MAIL_TM_API = 'https://api.mail.tm';
export const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';
export const TEMPMLA_BASE_URL = 'https://tempmail.la';
