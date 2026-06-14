// ─── Provider: Custom Domain (hanzzcreator.xyz) Routes ───────────────────────

import { Router } from 'express';
import {
  generateEmail,
  bulkGenerate,
  getMessages,
  getMessage,
  deleteMailbox,
  getDomains,
  getWorkerUrl,
} from '../services/custom-domain.js';

const router = Router();

// ─── List available domains ──────────────────────────────────────────────────

router.get('/domains', async (req, res) => {
  try {
    const domains = await getDomains();
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Create new email ────────────────────────────────────────────────────────

router.post('/new', async (req, res) => {
  try {
    const data = await generateEmail();
    res.json({
      provider: 'custom',
      email: data.address,
      mailId: data.mailId,
      endAt: data.endAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Bulk create emails ──────────────────────────────────────────────────────

router.post('/bulk', async (req, res) => {
  try {
    const count = Math.min(req.body.count || 1, 50);
    const emails = await bulkGenerate(count);
    res.json({
      provider: 'custom',
      emails: emails.map((e) => ({
        email: e.address,
        mailId: e.mailId,
        endAt: e.endAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get messages for an address ─────────────────────────────────────────────

router.get('/messages/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const data = await getMessages(address);
    res.json(data.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get specific message ────────────────────────────────────────────────────

router.get('/message/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getMessage(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete mailbox ──────────────────────────────────────────────────────────

router.delete('/mailbox/:address', async (req, res) => {
  try {
    const { address } = req.params;
    await deleteMailbox(address);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Status ──────────────────────────────────────────────────────────────────

router.get('/status', (req, res) => {
  res.json({
    workerUrl: getWorkerUrl(),
    ready: true,
  });
});

export default router;
