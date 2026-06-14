import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Puppeteer Browser Pool for tempmail.la ──────────────────────────────────
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

async function findChrome() {
  const fs = await import('fs');
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Chrome not found. Set CHROME_PATH env var.`);
}

const TEMPLA_DOMAINS = [
  'compressjpg.io', 'aiphotoeditor.io', 'gagcalculator.me',
  'pinkgreengenerator.me', 'aiphotoenhancer.me', 'lovecalculatorname.org',
  'whitehousecalculator.com', 'wplacetools.com', 'lordofmysteries.org',
  'sorawatermarkadder.org', 'deshnetarchadacalculator.one',
];

let browserInstance = null;
let turnstilePage = null;
let turnstileToken = null;
let tokenRefreshPromise = null;
let tokenReady = false; // true when user has solved Turnstile

function bringWindowToFront() {
  // On macOS, bring Chrome to front using AppleScript
  try {
    execSync(`osascript -e 'tell application "Google Chrome" to activate'`, { timeout: 3000 });
    console.log('  [templla] Brought Chrome to front — please click the Turnstile checkbox!');
  } catch {}
}

async function getBrowser() {
  if (browserInstance && browserInstance.connected) return browserInstance;
  const chromePath = await findChrome();
  console.log(`  [templla] Chrome: ${chromePath}`);
  browserInstance = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,900',
    ],
    defaultViewport: { width: 1280, height: 900 },
  });
  return browserInstance;
}

async function pollForToken(page, maxSeconds = 120) {
  for (let i = 0; i < maxSeconds; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const token = await page.evaluate(() => {
        // Method 1: hidden input
        const el = document.querySelector('[name="cf-turnstile-response"]');
        if (el && el.value) return el.value;

        // Method 2: turnstile JS API
        if (window.turnstile && typeof window.turnstile.getResponse === 'function') {
          const resp = window.turnstile.getResponse();
          if (resp) return resp;
        }

        // Method 3: search all hidden inputs for long token-like strings
        const inputs = document.querySelectorAll('input[type="hidden"]');
        for (const inp of inputs) {
          if (inp.value && inp.value.length > 100 && inp.value.includes('.')) {
            return inp.value;
          }
        }

        return null;
      });
      if (token) return token;
    } catch {
      return null; // Page closed
    }
    // Bring window to front every 15 seconds to remind user
    if (i > 0 && i % 15 === 0) {
      console.log(`  [templla] Waiting for Turnstile... ${i}s`);
      bringWindowToFront();
    }
  }
  return null;
}

async function refreshTurnstileToken() {
  if (tokenRefreshPromise) return tokenRefreshPromise;
  tokenRefreshPromise = (async () => {
    try {
      const browser = await getBrowser();

      // Reload or reuse existing page
      if (turnstilePage && !turnstilePage.isClosed()) {
        try {
          console.log('  [templla] Reloading tempmail.la page...');
          await turnstilePage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch {
          try { await turnstilePage.close(); } catch {}
          turnstilePage = null;
        }
      }

      if (!turnstilePage || turnstilePage.isClosed()) {
        turnstilePage = await browser.newPage();

        // Stealth patches
        await turnstilePage.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
          window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){} };
        });

        await turnstilePage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        console.log('  [templla] Navigating to tempmail.la...');
        await turnstilePage.goto('https://tempmail.la/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      }

      // Wait for JS to render (SPA needs time)
      await new Promise(r => setTimeout(r, 5000));

      // Check if we're on challenge page or normal page
      const title = await turnstilePage.title();
      console.log(`  [templla] Page title: "${title}"`);

      if (title.includes('Just a moment') || title.includes('Attention Required') || title.includes('Cloudflare')) {
        // Cloudflare challenge page — need user to click
        bringWindowToFront();
        console.log('  [templla] ⏳ Cloudflare challenge detected — CLICK THE CHECKBOX in Chrome!');
        const token = await pollForToken(turnstilePage, 120);
        if (token) {
          turnstileToken = token;
          tokenReady = true;
          console.log(`  ✓ [templla] Turnstile token obtained!`);
          return token;
        }
        console.error('  ✗ [templla] Turnstile timeout.');
        return null;
      }

      // Normal page — Turnstile widget might be embedded, wait for it
      console.log('  [templla] Page loaded normally (no challenge). Looking for Turnstile token...');

      // Wait longer for SPA to fully render Turnstile widget
      const token = await pollForToken(turnstilePage, 30);
      if (token) {
        turnstileToken = token;
        tokenReady = true;
        console.log(`  ✓ [templla] Turnstile token found in page! (${token.substring(0, 20)}...)`);
        return token;
      }

      // No token found in DOM — try to get it via turnstile.render()
      console.log('  [templla] No token in DOM, trying turnstile.render()...');
      try {
        const renderedToken = await turnstilePage.evaluate(() => {
          return new Promise((resolve) => {
            if (window.turnstile) {
              // Try to render an invisible turnstile widget
              const container = document.createElement('div');
              container.style.display = 'none';
              document.body.appendChild(container);
              window.turnstile.render(container, {
                sitekey: document.querySelector('[data-sitekey]')?.dataset?.sitekey || '0x4AAAAAAAGjFkqhSbOPgxmK',
                callback: (token) => resolve(token),
                'error-callback': () => resolve(null),
                'timeout-callback': () => resolve(null),
              });
              // Timeout after 20 seconds
              setTimeout(() => resolve(null), 20000);
            } else {
              resolve(null);
            }
          });
        });
        if (renderedToken) {
          turnstileToken = renderedToken;
          tokenReady = true;
          console.log(`  ✓ [templla] Turnstile token rendered! (${renderedToken.substring(0, 20)}...)`);
          return renderedToken;
        }
      } catch (e) {
        console.log('  [templla] turnstile.render() failed:', e.message);
      }

      // Last resort: page is loaded and has cookies, try creating email without explicit token
      // The page's fetch might automatically include the Turnstile token
      console.log('  [templla] Trying to create email directly from page context...');
      try {
        const testResult = await turnstilePage.evaluate(async (domains) => {
          const domain = domains[Math.floor(Math.random() * domains.length)];
          // Try without token first
          const resp = await fetch('/api/mail/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
          });
          return await resp.json();
        }, TEMPLA_DOMAINS);

        if (testResult.code === 0 && testResult.data) {
          console.log(`  ✓ [templla] Direct create worked! Email: ${testResult.data.address}`);
          // It works without explicit token! Set a dummy token so the flow continues
          turnstileToken = 'DIRECT_MODE';
          tokenReady = true;
          // Store the test email for later use
          turnstileTestEmail = testResult.data;
          return 'DIRECT_MODE';
        } else {
          console.log('  [templla] Direct create result:', JSON.stringify(testResult).substring(0, 200));
        }
      } catch (e) {
        console.log('  [templla] Direct create failed:', e.message);
      }

      // If nothing worked, bring Chrome to front and wait for user interaction
      console.log('  [templla] No automatic token found. Bringing Chrome to front...');
      console.log('  [templla] If you see a checkbox on the page, click it!');
      bringWindowToFront();
      const manualToken = await pollForToken(turnstilePage, 60);
      if (manualToken) {
        turnstileToken = manualToken;
        tokenReady = true;
        console.log(`  ✓ [templla] Turnstile token obtained after manual click!`);
        return manualToken;
      }

      console.error('  ✗ [templla] Could not obtain Turnstile token.');
      return null;
    } catch (err) {
      console.error('  ✗ [templla] Error:', err.message);
      return null;
    } finally {
      tokenRefreshPromise = null;
    }
  })();
  return tokenRefreshPromise;
}

let turnstileTestEmail = null; // Store test email from direct create

async function getTurnstileToken() {
  if (turnstileToken) return turnstileToken;
  return await refreshTurnstileToken();
}

async function tempLaRequest(path, body) {
  if (!turnstilePage || turnstilePage.isClosed()) {
    await refreshTurnstileToken();
  }
  if (!turnstilePage || turnstilePage.isClosed()) {
    throw new Error('Browser page not available. Click "Refresh Token" to try again.');
  }
  const result = await turnstilePage.evaluate(async (url, requestBody) => {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    return await resp.json();
  }, `https://tempmail.la${path}`, body);
  return result;
}

// Initialize on startup (non-blocking)
setTimeout(() => {
  console.log('  [templla] Opening Chrome for Turnstile setup...');
  refreshTurnstileToken().catch(err => console.error('  [templla] Setup failed:', err.message));
}, 3000);

// ─── Provider 1: temp-mail.io ───────────────────────────────────────────────
app.post('/api/tempmail/new', async (req, res) => {
  try {
    const response = await fetch('https://api.internal.temp-mail.io/api/v3/email/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_name_length: 8, max_name_length: 12 }),
    });
    const data = await response.json();
    res.json({ provider: 'temp-mail.io', email: data.email, token: data.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tempmail/messages/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const token = req.headers['x-token'];
    const response = await fetch(
      `https://api.internal.temp-mail.io/api/v3/email/${email}/messages`,
      { headers: token ? { 'Application-Token': String(token) } : {} }
    );
    const data = await response.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Provider 2: Mail.tm ────────────────────────────────────────────────────
app.post('/api/mailtm/new', async (req, res) => {
  try {
    // Get active domain
    const domainRes = await fetch('https://api.mail.tm/domains');
    const domainData = await domainRes.json();
    const domains = domainData['hydra:member'] || domainData;
    const active = domains.find(d => d.isActive);
    if (!active) throw new Error('No active domain');

    const login = Math.random().toString(36).substring(2, 12);
    const password = Math.random().toString(36).substring(2, 16);
    const address = `${login}@${active.domain}`;

    // Create account
    const createRes = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });
    const account = await createRes.json();
    if (!createRes.ok) throw new Error(`Account creation failed: ${JSON.stringify(account)}`);

    // Get token
    const tokenRes = await fetch('https://api.mail.tm/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });
    const tokenData = await tokenRes.json();

    res.json({
      provider: 'mail.tm',
      email: address,
      token: tokenData.token,
      accountId: account.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mailtm/messages', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch('https://api.mail.tm/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data['hydra:member'] || data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mailtm/message/:id', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(`https://api.mail.tm/messages/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Provider 3: Guerrilla Mail ──────────────────────────────────────────────
app.get('/api/guerrilla/new', async (req, res) => {
  try {
    const response = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
    const data = await response.json();
    res.json({
      provider: 'guerrilla',
      email: data.email_addr,
      token: data.sid_token,
      timestamp: data.email_timestamp,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/guerrilla/messages', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(
      `https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${token}`
    );
    const data = await response.json();
    res.json(data.list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/guerrilla/message/:id', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(
      `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${req.params.id}&sid_token=${token}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Provider 4: tempmail.la (stealth domains) ──────────────────────────────
app.get('/api/templla/domains', (req, res) => {
  res.json(TEMPLA_DOMAINS);
});

app.post('/api/templla/new', async (req, res) => {
  try {
    const token = await getTurnstileToken();
    if (!token) {
      // Try to refresh
      await refreshTurnstileToken();
      const newToken = await getTurnstileToken();
      if (!newToken) throw new Error('Could not obtain Turnstile token. Click "Setup Turnstile" and check the Chrome window.');
    }

    const domain = req.body.domain || TEMPLA_DOMAINS[Math.floor(Math.random() * TEMPLA_DOMAINS.length)];

    // If we have a pre-created test email, use it for the first request
    if (turnstileTestEmail) {
      const data = turnstileTestEmail;
      turnstileTestEmail = null; // Use it once
      return res.json({
        provider: 'tempmail.la',
        email: data.address,
        mailId: data.mailId,
        endAt: data.endAt,
      });
    }

    // Create email — in DIRECT_MODE, omit the turnstile field
    const body = turnstileToken === 'DIRECT_MODE'
      ? { domain }
      : { domain, turnstile: turnstileToken };

    const result = await tempLaRequest('/api/mail/create', body);

    if (result.code !== 0) {
      // Token might be expired, refresh and retry once
      console.log('  [templla] create failed, refreshing token...', JSON.stringify(result).substring(0, 150));
      turnstileToken = null;
      await refreshTurnstileToken();
      const retryBody = turnstileToken === 'DIRECT_MODE'
        ? { domain }
        : { domain, turnstile: turnstileToken };
      const retryResult = await tempLaRequest('/api/mail/create', retryBody);
      if (retryResult.code !== 0) {
        throw new Error(`tempmail.la error: ${JSON.stringify(retryResult)}`);
      }
      const data = retryResult.data;
      return res.json({
        provider: 'tempmail.la',
        email: data.address,
        mailId: data.mailId,
        endAt: data.endAt,
      });
    }

    const data = result.data;
    res.json({
      provider: 'tempmail.la',
      email: data.address,
      mailId: data.mailId,
      endAt: data.endAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/templla/messages/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!turnstilePage || turnstilePage.isClosed()) {
      await refreshTurnstileToken();
    }

    // Fetch messages via /api/mail/box (the correct endpoint)
    const result = await turnstilePage.evaluate(async (addr) => {
      try {
        const resp = await fetch('/api/mail/box', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: addr }),
        });
        const data = await resp.json();
        if (data.code === 0 && data.data) {
          // Response has data.rows array
          if (data.data.rows && Array.isArray(data.data.rows)) return { rows: data.data.rows, raw: JSON.stringify(data).substring(0, 500) };
          if (Array.isArray(data.data)) return { rows: data.data, raw: JSON.stringify(data).substring(0, 500) };
        }
        return { rows: [], raw: JSON.stringify(data).substring(0, 500) };
      } catch (e) {
        return { rows: [], raw: 'ERROR: ' + e.message };
      }
    }, address);

    console.log(`[templla] /api/mail/box for ${address}: ${result.rows.length} msgs | raw: ${result.raw}`);
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/templla/message/:mailId/:msgId', async (req, res) => {
  try {
    const { msgId } = req.params; // msgId is the mailboxId

    if (!turnstilePage || turnstilePage.isClosed()) {
      await refreshTurnstileToken();
    }

    // Read message via /api/mail/read
    const message = await turnstilePage.evaluate(async (mailboxId) => {
      try {
        const resp = await fetch('/api/mail/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mailboxId }),
        });
        const data = await resp.json();
        if (data.code === 0 && data.data) return data.data;
        return null;
      } catch (e) {
        return null;
      }
    }, msgId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── tempmail.la Status & Token Management ──────────────────────────────────
app.get('/api/templla/status', (req, res) => {
  res.json({
    tokenReady: !!turnstileToken,
    browserOpen: browserInstance?.connected || false,
    pageOpen: turnstilePage ? !turnstilePage.isClosed() : false,
  });
});

app.post('/api/templla/refresh-token', async (req, res) => {
  try {
    turnstileToken = null;
    const token = await refreshTurnstileToken();
    res.json({ success: !!token, message: token ? 'Token obtained!' : 'Turnstile not solved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Backend running at http://localhost:${PORT}`);
  console.log(`  Providers: temp-mail.io, mail.tm, guerrilla mail, tempmail.la`);
});
