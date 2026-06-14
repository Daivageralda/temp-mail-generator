// ─── Provider: TempMail.la Routes (Stealth Domains) ───────────────────────────

import { Router } from 'express';
import { TEMPLA_DOMAINS } from '../config.js';
import {
  getTurnstileToken,
  refreshTurnstileToken,
  tempLaRequest,
  getStatus,
  consumeTestEmail,
  getTestEmail,
  getToken,
} from '../services/puppeteer-pool.js';

const router = Router();

// ─── List available stealth domains ───────────────────────────────────────────

router.get('/domains', (req, res) => {
  res.json(TEMPLA_DOMAINS);
});

// ─── Create new stealth email ─────────────────────────────────────────────────

router.post('/new', async (req, res) => {
  try {
    const token = await getTurnstileToken();
    if (!token) {
      await refreshTurnstileToken();
      const newToken = await getTurnstileToken();
      if (!newToken) {
        throw new Error(
          'Could not obtain Turnstile token. Click "Setup Turnstile" and check the Chrome window.'
        );
      }
    }

    const domain = req.body.domain || TEMPLA_DOMAINS[Math.floor(Math.random() * TEMPLA_DOMAINS.length)];

    // If we have a pre-created test email, use it for the first request
    const testEmail = consumeTestEmail();
    if (testEmail) {
      return res.json({
        provider: 'tempmail.la',
        email: testEmail.address,
        mailId: testEmail.mailId,
        endAt: testEmail.endAt,
      });
    }

    // Create email — in DIRECT_MODE, omit the turnstile field
    const currentToken = getToken();
    const body = currentToken === 'DIRECT_MODE'
      ? { domain }
      : { domain, turnstile: currentToken };

    const result = await tempLaRequest('/api/mail/create', body);

    if (result.code !== 0) {
      // Token might be expired, refresh and retry once
      console.log('  [templla] create failed, refreshing token...', JSON.stringify(result).substring(0, 150));
      await refreshTurnstileToken();
      const retryToken = getToken();
      const retryBody = retryToken === 'DIRECT_MODE'
        ? { domain }
        : { domain, turnstile: retryToken };
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

// ─── Get messages for an address ──────────────────────────────────────────────

router.get('/messages/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Fetch messages via /api/mail/box
    const result = await tempLaRequest('/api/mail/box', { address });

    let rows = [];
    if (result.code === 0 && result.data) {
      if (result.data.rows && Array.isArray(result.data.rows)) {
        rows = result.data.rows;
      } else if (Array.isArray(result.data)) {
        rows = result.data;
      }
    }

    console.log(`[templla] /api/mail/box for ${address}: ${rows.length} msgs`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get specific message ─────────────────────────────────────────────────────

router.get('/message/:mailId/:msgId', async (req, res) => {
  try {
    const { msgId } = req.params;

    const message = await tempLaRequest('/api/mail/read', { mailboxId: msgId });

    if (!message || message.code !== 0 || !message.data) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Status & Token Management ────────────────────────────────────────────────

router.get('/status', (req, res) => {
  res.json(getStatus());
});

router.post('/refresh-token', async (req, res) => {
  try {
    const token = await refreshTurnstileToken();
    res.json({ success: !!token, message: token ? 'Token obtained!' : 'Turnstile not solved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
