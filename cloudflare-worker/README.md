# Cloudflare Worker — Temp Mail Backend

Deploy this worker to get a fully functional temp mail API with your own domain.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- A domain added to Cloudflare with [Email Routing](https://developers.cloudflare.com/email-routing/) enabled
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Daivageralda/temp-mail-generator.git
cd temp-mail-generator/cloudflare-worker
pnpm install
```

### 2. Create D1 Database

```bash
pnpm wrangler d1 create my-temp-mail-db
```

Copy the `database_id` from the output.

### 3. Configure

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml`:
- Set `name` to your worker name
- Set `DOMAIN` to your domain (must match Cloudflare Email Routing)
- Set `database_id` to the ID from step 2

### 4. Setup Database Schema

```bash
pnpm db:migrate
```

### 5. Setup Email Routing (Catch-All)

In your Cloudflare dashboard:
1. Go to **Email Routing** → **Routing Rules**
2. Under **Catch-all address**, click **Edit**
3. Set action to **Send to a Worker**
4. Select your deployed worker
5. Save

### 6. Deploy

```bash
pnpm deploy
```

Your API is now live at `https://your-worker-name.your-subdomain.workers.dev`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate a random temp email |
| `POST` | `/api/bulk-generate` | Generate multiple emails (body: `{"count": 10}`, max 50) |
| `GET` | `/api/inbox/:address` | Get inbox messages for an address |
| `GET` | `/api/message/:id` | Get full message content |
| `DELETE` | `/api/mailbox/:address` | Delete a mailbox and all its messages |
| `GET` | `/api/domains` | List available domain |

## Local Development

```bash
pnpm dev
```

This starts the worker locally at `http://localhost:8787` with a local D1 instance.

For local DB setup:
```bash
pnpm db:migrate:local
```

## Configuration Reference

| Setting | Where | Description |
|---------|-------|-------------|
| `DOMAIN` | `wrangler.toml` → `[vars]` | Your email domain (e.g., `mydomain.com`) |
| `database_id` | `wrangler.toml` → `[[d1_databases]]` | D1 database ID |
| Worker name | `wrangler.toml` → `name` | Cloudflare Worker name |

## License

MIT
