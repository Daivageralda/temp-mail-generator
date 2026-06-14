// ─── Express Application Entry Point ──────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

// ─── Route imports ────────────────────────────────────────────────────────────

import tempmailIoRoutes from './routes/tempmail-io.js';
import mailTmRoutes from './routes/mail-tm.js';
import guerrillaRoutes from './routes/guerrilla.js';
import customDomainRoutes from './routes/custom-domain.js';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

// ─── Mount Routes ─────────────────────────────────────────────────────────────

app.use('/api/tempmail', tempmailIoRoutes);
app.use('/api/mailtm', mailTmRoutes);
app.use('/api/guerrilla', guerrillaRoutes);
app.use('/api/custom', customDomainRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✓ Backend running at http://localhost:${PORT}`);
  console.log(`  Providers: temp-mail.io, mail.tm, guerrilla mail, hanzzcreator.xyz`);
});
