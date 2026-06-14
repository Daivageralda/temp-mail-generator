# hanzzcreator.xyz — Cloudflare Worker Setup

Email receiver + REST API untuk custom domain temp mail.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare account](https://dash.cloudflare.com) (free plan)
- Domain `hanzzcreator.xyz` sudah aktif di Cloudflare

## Step 1: Install Wrangler CLI

```bash
cd cloudflare-worker
npm install
npx wrangler login
```

Ini akan buka browser untuk login ke Cloudflare.

## Step 2: Buat D1 Database

```bash
npx wrangler d1 create hanzzcreator-db
```

Command ini akan output `database_id`. Copy ID-nya, lalu update `wrangler.toml`:

```toml
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

## Step 3: Jalankan Migration

```bash
# Untuk production
npx wrangler d1 execute hanzzcreator-db --remote --file=./schema.sql

# Untuk local testing
npx wrangler d1 execute hanzzcreator-db --local --file=./schema.sql
```

## Step 4: Deploy Worker

```bash
npx wrangler deploy
```

Setelah deploy, Worker akan punya URL seperti:
```
https://hanzzcreator-mail.<your-subdomain>.workers.dev
```

## Step 5: Setup Email Routing

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih domain `hanzzcreator.xyz`
3. Ke menu **Email** → **Email Routing**
4. Klik **Routing Rules** → **Catch-all**
5. Set action ke **Send to a Worker** → pilih `hanzzcreator-mail`
6. Save

## Step 6: Update .env di Project

Tambahkan di file `.env` project utama:

```env
WORKER_URL=https://hanzzcreator-mail.<your-subdomain>.workers.dev
```

## Step 7: Test!

```bash
# Test Worker API
curl https://hanzzcreator-mail.<your-subdomain>.workers.dev/api/domains

# Generate email
curl -X POST https://hanzzcreator-mail.<your-subdomain>.workers.dev/api/generate

# Cek inbox
curl https://hanzzcreator-mail.<your-subdomain>.workers.dev/api/inbox/test@hanzzcreator.xyz
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate random email address |
| POST | `/api/bulk-generate` | Generate multiple emails (`{ "count": 5 }`) |
| GET | `/api/inbox/:address` | List messages for an address |
| GET | `/api/message/:id` | Read specific message |
| DELETE | `/api/mailbox/:address` | Delete mailbox and messages |
| GET | `/api/domains` | List available domains |
