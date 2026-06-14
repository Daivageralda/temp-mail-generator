// ─── Provider: Mail.tm Routes ─────────────────────────────────────────────────

import { Router } from 'express';
import fetch from 'node-fetch';
import { MAIL_TM_API } from '../config.js';

const router = Router();

// ─── Create new temp email ────────────────────────────────────────────────────

router.post('/new', async (req, res) => {
  try {
    // Get active domain
    const domainRes = await fetch(`${MAIL_TM_API}/domains`);
    const domainData = await domainRes.json();
    const domains = domainData['hydra:member'] || domainData;
    const active = domains.find((d) => d.isActive);
    if (!active) throw new Error('No active domain');

    const login = Math.random().toString(36).substring(2, 12);
    const password = Math.random().toString(36).substring(2, 16);
    const address = `${login}@${active.domain}`;

    // Create account
    const createRes = await fetch(`${MAIL_TM_API}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });
    const account = await createRes.json();
    if (!createRes.ok) throw new Error(`Account creation failed: ${JSON.stringify(account)}`);

    // Get token
    const tokenRes = await fetch(`${MAIL_TM_API}/token`, {
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

// ─── Get messages ─────────────────────────────────────────────────────────────

router.get('/messages', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(`${MAIL_TM_API}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data['hydra:member'] || data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get specific message ─────────────────────────────────────────────────────

router.get('/message/:id', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(`${MAIL_TM_API}/messages/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
