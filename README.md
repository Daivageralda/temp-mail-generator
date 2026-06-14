<p align="center">
  <img src="https://img.shields.io/github/license/Daivageralda/temp-mail-generator?style=flat-square&color=blue" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/pnpm-9%2B-orange?style=flat-square&logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/github/repo-size/Daivageralda/temp-mail-generator?style=flat-square" alt="Repo Size" />
</p>

<h1 align="center">📧 Bulk Temp Mail Generator</h1>

<p align="center">
  <strong>A powerful bulk temporary email generator with multi-provider support, real-time inbox monitoring, and stealth domain capabilities.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-reference">API</a> •
  <a href="#troubleshooting">Troubleshooting</a>
</p>

---

## ✨ Features

- **🔥 Bulk Generation** — Generate up to 50 temporary email addresses at once
- **🔄 Multi-Provider Support** — 4 providers with automatic fallback:
  - **TempMail.la** — Stealth domains that bypass services blocking temp emails
  - **Temp-Mail.io** — Clean domains, works with most services
  - **Mail.tm** — Reliable provider, great for testing
  - **Guerrilla Mail** — Classic provider with wide compatibility
- **📬 Real-Time Inbox** — Auto-refreshing inbox (every 5 seconds) with full message rendering
- **🛡️ Cloudflare Turnstile Bypass** — Puppeteer-powered browser automation for TempMail.la's stealth domains
- **📋 Clipboard Integration** — One-click copy individual emails or bulk copy all addresses
- **🌙 Dark Theme UI** — Modern, responsive interface built with Tailwind CSS
- **📨 HTML Email Rendering** — Full HTML email content displayed in sandboxed iframes

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS v4     |
| Backend    | Express.js 5, Node.js                     |
| Build Tool | Vite 6                                    |
| Automation | Puppeteer (Chrome/Chromium)               |
| Package Mgr| pnpm                                      |
| Concurrency| concurrently (dev server orchestration)   |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **Google Chrome** or **Chromium** (required for TempMail.la provider)

> [!NOTE]
> Chrome/Chromium is only required if you plan to use the **TempMail.la** provider. Other providers work without a browser.

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

### 3. Start the Application

```bash
pnpm dev
```

This command simultaneously starts:

| Service        | URL                      | Description          |
|----------------|--------------------------|----------------------|
| **Frontend**   | `http://localhost:5173`  | Vite dev server (React UI) |
| **Backend**    | `http://localhost:3001`  | Express API server   |

### 4. Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173) to start using the app.

## 📖 Usage

### Generating Temporary Emails

1. **Select a Provider** from the dropdown menu:
   - 🔥 **TempMail.la** — Best for services that block temp emails (e.g., Qoder, etc.)
   - **Temp-Mail.io** — Clean domains, works for most services
   - **Mail.tm** — Reliable and consistent
   - **Guerrilla Mail** — Classic provider, may be blocked by some services

2. **Set the Count** (1–50) — How many emails to generate at once

3. **Click "Generate Emails"** — Emails will appear in the list below

4. **Copy emails** individually (click the copy icon) or use **"📋 Copy All"** to copy all addresses at once

### Viewing Inbox

1. **Click on any email address** in the list to open its inbox
2. The inbox **auto-refreshes every 5 seconds** for new messages
3. You can also manually click the **Refresh** button
4. Use **"📧 Send Test"** to send a test email to verify the inbox works

### Reading Messages

1. **Click on any message** in the inbox to view its full content
2. HTML emails are rendered in a sandboxed iframe
3. Plain text emails are displayed as formatted text
4. Use the **back arrow** (←) to return to the inbox or email list

### Using TempMail.la (Stealth Domains)

TempMail.la requires solving a Cloudflare Turnstile challenge:

1. Select **🔥 TempMail.la** as the provider
2. If the Turnstile banner shows **"⏳ Turnstile Setup Required"**:
   - Click **"🔓 Setup Turnstile"**
   - A Chrome window will open automatically
   - **Click the Turnstile checkbox** in the Chrome window
3. Once the banner shows **"✅ Turnstile Ready"**, you can generate emails normally

> [!TIP]
> The Turnstile token persists for the session. You only need to solve it once per server start.

## 🏗️ Project Structure

```
temp-mail-generator/
├── index.html                  # HTML entry point
├── server.js                   # Express backend (API proxy + Puppeteer)
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # Lock file
├── pnpm-workspace.yaml         # pnpm workspace config
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── src/
│   ├── main.tsx                # React app entry point
│   ├── App.tsx                 # Main application component
│   ├── api.ts                  # API client (frontend ↔ backend)
│   ├── types.ts                # TypeScript type definitions
│   ├── index.css               # Global styles (Tailwind)
│   ├── vite-env.d.ts           # Vite type declarations
│   └── components/
│       ├── EmailList.tsx        # Email list display with actions
│       ├── InboxPanel.tsx       # Inbox view with auto-refresh
│       ├── MessageViewer.tsx    # Full email message renderer
│       └── CopyButton.tsx       # Reusable copy-to-clipboard button
├── dist/                       # Production build output
└── node_modules/               # Dependencies
```

## 📡 API Reference

The backend server runs on `http://localhost:3001` and exposes the following REST endpoints:

### Temp-Mail.io

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `POST` | `/api/tempmail/new`                   | Create a new temp email  |
| `GET`  | `/api/tempmail/messages/:email`       | Get messages for email   |

### Mail.tm

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `POST` | `/api/mailtm/new`                     | Create a new temp email  |
| `GET`  | `/api/mailtm/messages`                | Get inbox messages       |
| `GET`  | `/api/mailtm/message/:id`             | Get a specific message   |

> **Headers:** `x-token: <jwt_token>` (required for Mail.tm endpoints)

### Guerrilla Mail

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `GET`  | `/api/guerrilla/new`                  | Create a new temp email  |
| `GET`  | `/api/guerrilla/messages`             | Get inbox messages       |
| `GET`  | `/api/guerrilla/message/:id`          | Get a specific message   |

> **Headers:** `x-token: <sid_token>` (required for Guerrilla endpoints)

### TempMail.la (Stealth)

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| `GET`  | `/api/templla/domains`                    | List available stealth domains |
| `POST` | `/api/templla/new`                        | Create a new stealth email     |
| `GET`  | `/api/templla/messages/:address`          | Get inbox messages             |
| `GET`  | `/api/templla/message/:mailId/:msgId`     | Get a specific message         |
| `GET`  | `/api/templla/status`                     | Check Turnstile token status   |
| `POST` | `/api/templla/refresh-token`              | Manually refresh Turnstile     |

### Available Scripts

| Command           | Description                                          |
|-------------------|------------------------------------------------------|
| `pnpm dev`        | Start both frontend and backend concurrently         |
| `pnpm dev:server` | Start only the backend server (port 3001)            |
| `pnpm dev:client` | Start only the Vite dev server (port 5173)           |
| `pnpm build`      | Build for production (TypeScript compile + Vite)     |
| `pnpm preview`    | Preview the production build locally                 |

## ⚙️ Configuration

### Environment Variables

| Variable     | Description                           | Default                        |
|--------------|---------------------------------------|--------------------------------|
| `CHROME_PATH`| Custom path to Chrome/Chromium binary | Auto-detected (macOS paths)    |

Example:

```bash
CHROME_PATH=/usr/bin/google-chrome pnpm dev
```

### Chrome Detection

The server automatically searches for Chrome in these locations (macOS):

- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary`
- `/Applications/Chromium.app/Contents/MacOS/Chromium`

For Linux or custom installations, set the `CHROME_PATH` environment variable.

### Stealth Domains

TempMail.la provider uses the following stealth domains (configured in `server.js`):

```
compressjpg.io, aiphotoeditor.io, gagcalculator.me,
pinkgreengenerator.me, aiphotoenhancer.me, lovecalculatorname.org,
whitehousecalculator.com, wplacetools.com, lordofmysteries.org,
sorawatermarkadder.org, deshnetarchadacalculator.one
```

## 🔧 Troubleshooting

### Chrome not found

```
Error: Chrome not found. Set CHROME_PATH env var.
```

**Solution:** Install Google Chrome or set the `CHROME_PATH` environment variable to your Chrome binary path.

### Turnstile token expired / not working

If email generation fails with Turnstile errors:

1. Click **"🔓 Setup Turnstile"** in the UI
2. Wait for the Chrome window to open
3. Click the Turnstile checkbox in Chrome
4. Wait for the **"✅ Turnstile Ready"** banner

### Port already in use

If port 3001 or 5173 is occupied:

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Provider returns errors

Some providers may be temporarily unavailable or rate-limited. Try switching to a different provider from the dropdown.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please make sure to:
- Follow the existing code style
- Update documentation as needed
- Test your changes thoroughly

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2026 Raihan Daiva Geralda | Rehan
```

## ⚠️ Disclaimer

This tool is intended for **legitimate testing and privacy purposes only** (e.g., QA testing, signing up for services without exposing your real email). Please use responsibly and in accordance with applicable laws and terms of service.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Daivageralda">Raihan Daiva Geralda</a>
</p>
