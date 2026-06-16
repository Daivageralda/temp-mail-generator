// ─── Provider: Guerrilla Mail Routes ──────────────────────────────────────────

import { Router } from 'express';
import fetch from 'node-fetch';
import { GUERRILLA_API } from '../config.js';

const router = Router();

// ─── Create new temp email ────────────────────────────────────────────────────

router.get('/new', async (req, res) => {
  try {
    const response = await fetch(`${GUERRILLA_API}?f=get_email_address`);
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

// ─── Get messages ─────────────────────────────────────────────────────────────

router.get('/messages', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(
      `${GUERRILLA_API}?f=check_email&seq=0&sid_token=${token}`
    );
    const data = await response.json();
    res.json(data.list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get specific message ─────────────────────────────────────────────────────

router.get('/message/:id', async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const response = await fetch(
      `${GUERRILLA_API}?f=fetch_email&email_id=${req.params.id}&sid_token=${token}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
