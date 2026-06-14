// ─── Puppeteer Browser Pool & Turnstile Management ────────────────────────────

import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import fs from 'fs';
import {
  CHROME_PATHS,
  TEMPLA_DOMAINS,
  TURNSTILE_SITEKEY,
  TURNSTILE_POLL_INTERVAL,
  TURNSTILE_MAX_WAIT,
  TEMPMLA_BASE_URL,
} from '../config.js';

// ─── State ────────────────────────────────────────────────────────────────────

let browserInstance = null;
let turnstilePage = null;
let turnstileToken = null;
let tokenRefreshPromise = null;
let tokenReady = false;
let turnstileTestEmail = null;

// ─── Chrome Detection ─────────────────────────────────────────────────────────

async function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome not found. Set CHROME_PATH env var.');
}

// ─── Browser Management ───────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bringWindowToFront() {
  try {
    execSync(`osascript -e 'tell application "Google Chrome" to activate'`, { timeout: 3000 });
    console.log('  [templla] Brought Chrome to front — please click the Turnstile checkbox!');
  } catch {
    // Non-macOS or AppleScript not available
  }
}

async function pollForToken(page, maxSeconds = TURNSTILE_MAX_WAIT) {
  for (let i = 0; i < maxSeconds; i++) {
    await new Promise((r) => setTimeout(r, TURNSTILE_POLL_INTERVAL));
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

// ─── Token Management ─────────────────────────────────────────────────────────

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
          try { await turnstilePage.close(); } catch { /* ignore */ }
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

        await turnstilePage.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        );
        console.log('  [templla] Navigating to tempmail.la...');
        await turnstilePage.goto(`${TEMPMLA_BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      }

      // Wait for JS to render (SPA needs time)
      await new Promise((r) => setTimeout(r, 5000));

      // Check if we're on challenge page or normal page
      const title = await turnstilePage.title();
      console.log(`  [templla] Page title: "${title}"`);

      if (title.includes('Just a moment') || title.includes('Attention Required') || title.includes('Cloudflare')) {
        bringWindowToFront();
        console.log('  [templla] ⏳ Cloudflare challenge detected — CLICK THE CHECKBOX in Chrome!');
        const token = await pollForToken(turnstilePage, 120);
        if (token) {
          turnstileToken = token;
          tokenReady = true;
          console.log('  ✓ [templla] Turnstile token obtained!');
          return token;
        }
        console.error('  ✗ [templla] Turnstile timeout.');
        return null;
      }

      // Normal page — Turnstile widget might be embedded
      console.log('  [templla] Page loaded normally (no challenge). Looking for Turnstile token...');

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
        const renderedToken = await turnstilePage.evaluate((sitekey) => {
          return new Promise((resolve) => {
            if (window.turnstile) {
              const container = document.createElement('div');
              container.style.display = 'none';
              document.body.appendChild(container);
              window.turnstile.render(container, {
                sitekey: document.querySelector('[data-sitekey]')?.dataset?.sitekey || sitekey,
                callback: (t) => resolve(t),
                'error-callback': () => resolve(null),
                'timeout-callback': () => resolve(null),
              });
              setTimeout(() => resolve(null), 20000);
            } else {
              resolve(null);
            }
          });
        }, TURNSTILE_SITEKEY);

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
      console.log('  [templla] Trying to create email directly from page context...');
      try {
        const testResult = await turnstilePage.evaluate(async (domains) => {
          const domain = domains[Math.floor(Math.random() * domains.length)];
          const resp = await fetch('/api/mail/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
          });
          return await resp.json();
        }, TEMPLA_DOMAINS);

        if (testResult.code === 0 && testResult.data) {
          console.log(`  ✓ [templla] Direct create worked! Email: ${testResult.data.address}`);
          turnstileToken = 'DIRECT_MODE';
          tokenReady = true;
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
        console.log('  ✓ [templla] Turnstile token obtained after manual click!');
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
  }, `${TEMPMLA_BASE_URL}${path}`, body);
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getStatus() {
  return {
    tokenReady: !!turnstileToken,
    browserOpen: browserInstance?.connected || false,
    pageOpen: turnstilePage ? !turnstilePage.isClosed() : false,
  };
}

export function consumeTestEmail() {
  const email = turnstileTestEmail;
  turnstileTestEmail = null;
  return email;
}

export function getTestEmail() {
  return turnstileTestEmail;
}

export function getToken() {
  return turnstileToken;
}

export {
  getBrowser,
  getTurnstileToken,
  refreshTurnstileToken,
  tempLaRequest,
  bringWindowToFront,
};

// Initialize on startup (non-blocking)
setTimeout(() => {
  console.log('  [templla] Opening Chrome for Turnstile setup...');
  refreshTurnstileToken().catch((err) => console.error('  [templla] Setup failed:', err.message));
}, 3000);
