// ─── Express Application Entry Point ──────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import { PORT, PROVIDERS } from './config.js';

// ─── Route imports ────────────────────────────────────────────────────────────

import customDomainRoutes from './routes/custom-domain.js';
import tempmailIoRoutes from './routes/tempmail-io.js';
import mailTmRoutes from './routes/mail-tm.js';
import guerrillaRoutes from './routes/guerrilla.js';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

// ─── Mount Routes (custom domain first = default provider) ────────────────────

app.use('/api/custom', customDomainRoutes);
app.use('/api/tempmail', tempmailIoRoutes);
app.use('/api/mailtm', mailTmRoutes);
app.use('/api/guerrilla', guerrillaRoutes);

// ─── Provider Registry Endpoint ──────────────────────────────────────────────

app.get('/api/providers', (req, res) => {
  res.json({ providers: PROVIDERS });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error(`✗ ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✓ Backend running at http://localhost:${PORT}`);
  console.log(`  Default provider: ${PROVIDERS[0].name}`);
  console.log(`  Providers: ${PROVIDERS.map((p) => p.name).join(', ')}`);
});
