// ─── Service: Custom Domain (hanzzcreator.xyz via Cloudflare Worker) ─────────

const WORKER_URL = process.env.WORKER_URL || 'https://hanzzcreator-mail.daivageralda831.workers.dev';

async function workerFetch(path, options = {}) {
  const url = `${WORKER_URL}${path}`;
  const resp = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!resp.ok) {
    throw new Error(`Worker API error: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateEmail() {
  const result = await workerFetch('/api/generate', { method: 'POST' });
  if (result.code !== 0) throw new Error(result.error || 'Generate failed');
  return result.data;
}

export async function bulkGenerate(count = 1) {
  const result = await workerFetch('/api/bulk-generate', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });
  if (result.code !== 0) throw new Error(result.error || 'Bulk generate failed');
  return result.data;
}

export async function getMessages(address) {
  const result = await workerFetch(`/api/inbox/${encodeURIComponent(address)}`);
  if (result.code !== 0) throw new Error(result.error || 'Fetch inbox failed');
  return result.data;
}

export async function getMessage(id) {
  const result = await workerFetch(`/api/message/${id}`);
  if (result.code !== 0) throw new Error(result.error || 'Fetch message failed');
  return result.data;
}

export async function deleteMailbox(address) {
  const result = await workerFetch(`/api/mailbox/${encodeURIComponent(address)}`, {
    method: 'DELETE',
  });
  return result;
}

export async function getDomains() {
  const result = await workerFetch('/api/domains');
  if (result.code !== 0) return [];
  return result.data;
}

export function getWorkerUrl() {
  return WORKER_URL;
}
