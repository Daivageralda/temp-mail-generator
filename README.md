<p align="center">
  <img src="https://img.shields.io/github/license/Daivageralda/temp-mail-generator?style=flat-square&color=blue" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/pnpm-9%2B-orange?style=flat-square&logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
</p>

<h1 align="center">📧 Bulk Temp Mail Generator</h1>

<p align="center">
  <strong>A powerful bulk temporary email generator with multi-provider support, real-time inbox monitoring, and custom domain capabilities.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-reference">API</a> •
  <a href="#self-hosting">Self-Hosting</a>
</p>

---

## ✨ Features

- **🔥 Bulk Generation** — Generate up to 50 temporary email addresses at once
- **🔄 4 Providers** — Choose the best provider for your needs:
  - **🏠 Custom Domain** — Your own email server via Cloudflare Worker (full control, no blocking)
  - **Temp-Mail.io** — Clean domains, works with most services
  - **Mail.tm** — Reliable provider, great for testing
  - **Guerrilla Mail** — Classic provider with wide compatibility
- **📬 Real-Time Inbox** — Auto-refreshing inbox (every 5 seconds) with full message rendering
- **📋 Clipboard Integration** — One-click copy individual emails or bulk copy all addresses
- **🌙 Dark Theme UI** — Modern, responsive landing page + app interface
- **📨 HTML Email Rendering** — Full HTML email content in sandboxed iframes
- **🌐 Open Source** — Self-host everything, including your own email domain

## 🛠️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS v4 |
| Backend    | Express.js 5, Node.js                 |
| Worker     | Cloudflare Workers + D1 (optional)    |
| Build Tool | Vite 6                                |
| Package Mgr| pnpm                                  |

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Daivageralda/temp-mail-generator.git
cd temp-mail-generator
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. (Optional) Configure Custom Domain

If you want to use the **Custom Domain** provider, copy the environment template and set your Cloudflare Worker URL:

```bash
cp .env.example .env
# Edit .env and set WORKER_URL to your deployed worker URL
```

> See [Self-Hosting](#self-hosting) for deploying your own Cloudflare Worker.

### 4. Start the Application

```bash
pnpm dev
```

This starts both services concurrently:

| Service    | URL                     | Description              |
|------------|-------------------------|--------------------------|
| **Client** | `http://localhost:5174` | Vite dev server (React)  |
| **API**    | `http://localhost:3001` | Express backend          |

### 5. Open in Browser

Navigate to [http://localhost:5174](http://localhost:5174) to start using the app.

## 📖 Usage

### Generating Temporary Emails

1. **Select a Provider** from the dropdown:
   - 🏠 **Custom Domain** — Your own email server (requires Worker setup)
   - **Temp-Mail.io** — Clean domains, works for most services
   - **Mail.tm** — Reliable and consistent
   - **Guerrilla Mail** — Classic provider, may be blocked by some services

2. **Set the Count** (1–50) — How many emails to generate at once

3. **Click "Generate Emails"** — Emails will appear in the list below

4. **Copy emails** individually or use **"📋 Copy All"** to copy all addresses

### Viewing Inbox

1. **Click on any email** in the list to open its inbox
2. Inbox **auto-refreshes every 5 seconds**
3. Click **Refresh** to manually check for new messages

### Reading Messages

1. **Click on any message** in the inbox to view full content
2. HTML emails are rendered in a sandboxed iframe
3. Plain text emails are displayed as formatted text
4. Use the **back arrow** (←) to navigate back

## 🏗️ Project Structure

```
bulk-temp-mail/
├── client/                     # React frontend
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Main application component
│   ├── api/                    # API client (frontend → backend)
│   ├── components/             # React components
│   │   ├── features/           # App features (EmailList, Inbox, etc.)
│   │   ├── landing/            # Landing page sections
│   │   ├── layout/             # Layout providers (Lenis smooth scroll)
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # App constants & provider config
├── api/                        # Express backend
│   ├── index.js                # Server entry point (port 3001)
│   ├── config.js               # Centralized configuration
│   ├── routes/                 # API route handlers
│   │   ├── custom-domain.js    # Custom domain provider
│   │   ├── tempmail-io.js      # Temp-Mail.io provider
│   │   ├── mail-tm.js          # Mail.tm provider
│   │   └── guerrilla.js        # Guerrilla Mail provider
│   └── services/               # Business logic
│       └── custom-domain.js    # Cloudflare Worker API client
├── cloudflare-worker/          # Cloudflare Worker (optional)
│   ├── src/                    # Worker source code (modular)
│   ├── wrangler.toml.example   # Worker config template
│   ├── schema.sql              # D1 database schema
│   └── README.md               # Worker deployment guide
├── public/                     # Static assets & fonts
├── .env.example                # Environment template
├── package.json                # Root dependencies & scripts
└── vite.config.ts              # Vite configuration
```

## 📡 API Reference

The backend runs on `http://localhost:3001`.

### Provider Discovery

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| `GET`  | `/api/providers`  | List available providers       |

### Custom Domain

| Method | Endpoint                                   | Description              |
|--------|--------------------------------------------|--------------------------|
| `POST` | `/api/custom/new`                          | Create a new email       |
| `GET`  | `/api/custom/messages/:address`            | Get inbox messages       |
| `GET`  | `/api/custom/message/:id`                  | Get a specific message   |

### Temp-Mail.io

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `POST` | `/api/tempmail/new`                   | Create a new email       |
| `GET`  | `/api/tempmail/messages/:email`       | Get inbox messages       |

### Mail.tm

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `POST` | `/api/mailtm/new`                     | Create a new email       |
| `GET`  | `/api/mailtm/messages`                | Get inbox messages       |
| `GET`  | `/api/mailtm/message/:id`             | Get a specific message   |

> **Headers:** `x-token: <jwt_token>` (required for Mail.tm)

### Guerrilla Mail

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `GET`  | `/api/guerrilla/new`                  | Create a new email       |
| `GET`  | `/api/guerrilla/messages`             | Get inbox messages       |
| `GET`  | `/api/guerrilla/message/:id`          | Get a specific message   |

> **Headers:** `x-token: <sid_token>` (required for Guerrilla)

### Available Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `pnpm dev`        | Start both client and API concurrently           |
| `pnpm dev:server` | Start only the API server (port 3001)            |
| `pnpm dev:client` | Start only the Vite dev server                   |
| `pnpm build`      | Build for production                             |
| `pnpm preview`    | Preview the production build                     |

## ⚙️ Configuration

### Environment Variables

| Variable       | Description                              | Default                          |
|----------------|------------------------------------------|----------------------------------|
| `VITE_API_URL` | Frontend API base URL                    | `http://localhost:3001/api`      |
| `WORKER_URL`   | Cloudflare Worker URL (custom domain)    | *(empty — custom domain disabled)* |
| `PORT`         | API server port                          | `3001`                           |

Example `.env`:

```bash
VITE_API_URL=http://localhost:3001/api
WORKER_URL=https://your-worker.your-subdomain.workers.dev
PORT=3001
```

## 🌐 Self-Hosting

### Deploy Custom Domain Worker (Optional)

The **Custom Domain** provider lets you use your own email domain via Cloudflare. This is optional — the other 3 providers work without any setup.

See [cloudflare-worker/README.md](cloudflare-worker/README.md) for the complete deployment guide.

**Quick version:**

```bash
cd cloudflare-worker
pnpm install

# 1. Create D1 database
wrangler d1 create my-temp-mail-db

# 2. Configure
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml: set DOMAIN and database_id

# 3. Setup database tables
pnpm db:migrate

# 4. Deploy
pnpm deploy
```

Then set `WORKER_URL` in your root `.env` to the deployed worker URL.

### Deploy the Full App

```bash
# Build frontend
pnpm build

# Serve with any static host (Vercel, Netlify, etc.)
# Point API requests to your Express server
```

## 🔧 Troubleshooting

### Port already in use

```bash
lsof -ti:3001 | xargs kill -9   # Kill API server
lsof -ti:5174 | xargs kill -9   # Kill Vite dev server
```

### Provider returns errors

Some providers may be temporarily unavailable or rate-limited. Try switching to a different provider.

### Custom Domain not working

1. Ensure `WORKER_URL` is set in `.env`
2. Verify the worker is deployed: `curl $WORKER_URL/api/providers`
3. Check Cloudflare Email Routing is configured for your domain

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

This tool is intended for **legitimate testing and privacy purposes only** (e.g., QA testing, signing up for services without exposing your real email). Use responsibly and in accordance with applicable laws and terms of service.

---

<p align="center">
  Built by <a href="https://github.com/Daivageralda">Daivageralda</a>
</p>
