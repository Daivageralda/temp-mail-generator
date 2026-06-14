// ─── Provider: temp-mail.io Routes ────────────────────────────────────────────

import { Router } from 'express';
import fetch from 'node-fetch';
import { TEMP_MAIL_IO_API } from '../config.js';

const router = Router();

// ─── Create new temp email ────────────────────────────────────────────────────

router.post('/new', async (req, res) => {
  try {
    const response = await fetch(`${TEMP_MAIL_IO_API}/email/new`, {
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

// ─── Get messages for an email ────────────────────────────────────────────────

router.get('/messages/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const token = req.headers['x-token'];
    const response = await fetch(
      `${TEMP_MAIL_IO_API}/email/${email}/messages`,
      { headers: token ? { 'Application-Token': String(token) } : {} }
    );
    const data = await response.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
