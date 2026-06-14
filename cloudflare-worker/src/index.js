// ─── hanzzcreator.xyz Cloudflare Worker ───────────────────────────────────────
// Email receiver (via Email Routing) + REST API for bulk temp mail project

import PostalMime from 'postal-mime';

const DOMAIN = 'hanzzcreator.xyz';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateUsername(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// ─── Email Handler (catch-all from Email Routing) ─────────────────────────────

export default {
  async email(message, env, ctx) {
    const to = message.to;
    const from = message.from;
    const subject = message.headers.get('subject') || '(no subject)';

    console.log(`📧 Email received: ${from} → ${to} | Subject: ${subject}`);

    // Extract the local address (before @)
    const address = to.toLowerCase().trim();

    // Parse email using PostalMime
    let textBody = '';
    let htmlBody = '';
    let rawHeaders = '';

    try {
      // Read raw email as ArrayBuffer
      const rawEmail = await new Response(message.raw).arrayBuffer();

      // Parse with PostalMime
      const parser = new PostalMime();
      const parsed = await parser.parse(rawEmail);

      textBody = parsed.text || '';
      htmlBody = parsed.html || '';

      // Extract headers as JSON
      const headersObj = {};
      for (const [key, value] of message.headers) {
        headersObj[key] = value;
      }
      rawHeaders = JSON.stringify(headersObj);

      console.log(`📧 Parsed: text=${textBody.length} chars, html=${htmlBody.length} chars`);
    } catch (e) {
      console.error('Email parse error:', e.message);
      textBody = '(could not parse email body)';
      rawHeaders = JSON.stringify({ error: e.message });
    }

    // Ensure mailbox exists (auto-create for catch-all)
    await env.DB.prepare(
      `INSERT OR IGNORE INTO mailboxes (address) VALUES (?)`
    ).bind(address).run();

    // Store the message
    await env.DB.prepare(
      `INSERT INTO messages (mailbox_address, sender, subject, text_body, html_body, raw_headers)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(address, from, subject, textBody, htmlBody, rawHeaders).run();

    console.log(`✅ Stored message for ${address}`);
  },

  // ─── HTTP API Handler ───────────────────────────────────────────────────────

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // ─── POST /api/generate ────────────────────────────────────────────────
    if (path === '/api/generate' && request.method === 'POST') {
      const username = generateUsername(10);
      const address = `${username}@${DOMAIN}`;
      const expiresHours = 24;

      // Create mailbox
      await env.DB.prepare(
        `INSERT OR IGNORE INTO mailboxes (address, expires_at)
         VALUES (?, datetime('now', '+${expiresHours} hours'))`
      ).bind(address).run();

      return jsonResponse({
        code: 0,
        data: {
          address,
          mailId: username,
          endAt: new Date(Date.now() + expiresHours * 3600000).toISOString(),
        },
      });
    }

    // ─── POST /api/bulk-generate ───────────────────────────────────────────
    if (path === '/api/bulk-generate' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const count = Math.min(body.count || 1, 50); // max 50 at once
      const expiresHours = 24;
      const emails = [];

      for (let i = 0; i < count; i++) {
        const username = generateUsername(10);
        const address = `${username}@${DOMAIN}`;
        emails.push({
          address,
          mailId: username,
          endAt: new Date(Date.now() + expiresHours * 3600000).toISOString(),
        });

        await env.DB.prepare(
          `INSERT OR IGNORE INTO mailboxes (address, expires_at)
           VALUES (?, datetime('now', '+${expiresHours} hours'))`
        ).bind(address).run();
      }

      return jsonResponse({ code: 0, data: emails });
    }

    // ─── GET /api/inbox/:address ──────────────────────────────────────────
    if (path.startsWith('/api/inbox/') && request.method === 'GET') {
      const address = decodeURIComponent(path.replace('/api/inbox/', '')).toLowerCase();

      // Ensure mailbox exists
      await env.DB.prepare(
        `INSERT OR IGNORE INTO mailboxes (address) VALUES (?)`
      ).bind(address).run();

      const { results } = await env.DB.prepare(
        `SELECT id, sender, subject, received_at
         FROM messages
         WHERE mailbox_address = ?
         ORDER BY received_at DESC
         LIMIT 50`
      ).bind(address).all();

      return jsonResponse({
        code: 0,
        data: {
          rows: results.map((r) => ({
            id: r.id,
            from: r.sender,
            subject: r.subject,
            date: r.received_at,
          })),
        },
      });
    }

    // ─── GET /api/message/:id ─────────────────────────────────────────────
    if (path.startsWith('/api/message/') && request.method === 'GET') {
      const id = path.replace('/api/message/', '');

      const { results } = await env.DB.prepare(
        `SELECT * FROM messages WHERE id = ?`
      ).bind(id).all();

      if (!results.length) {
        return jsonResponse({ code: 1, error: 'Message not found' }, 404);
      }

      const msg = results[0];
      return jsonResponse({
        code: 0,
        data: {
          id: msg.id,
          from: msg.sender,
          subject: msg.subject,
          text: msg.text_body,
          html: msg.html_body,
          headers: msg.raw_headers,
          date: msg.received_at,
        },
      });
    }

    // ─── DELETE /api/mailbox/:address ─────────────────────────────────────
    if (path.startsWith('/api/mailbox/') && request.method === 'DELETE') {
      const address = decodeURIComponent(path.replace('/api/mailbox/', '')).toLowerCase();

      await env.DB.prepare(`DELETE FROM messages WHERE mailbox_address = ?`).bind(address).run();
      await env.DB.prepare(`DELETE FROM mailboxes WHERE address = ?`).bind(address).run();

      return jsonResponse({ code: 0, message: 'Mailbox deleted' });
    }

    // ─── GET /api/domains ─────────────────────────────────────────────────
    if (path === '/api/domains' && request.method === 'GET') {
      return jsonResponse({ code: 0, data: [DOMAIN] });
    }

    // ─── GET / (health check) ─────────────────────────────────────────────
    if (path === '/') {
      return jsonResponse({
        status: 'ok',
        domain: DOMAIN,
        endpoints: [
          'POST /api/generate',
          'POST /api/bulk-generate',
          'GET /api/inbox/:address',
          'GET /api/message/:id',
          'DELETE /api/mailbox/:address',
          'GET /api/domains',
        ],
      });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};
