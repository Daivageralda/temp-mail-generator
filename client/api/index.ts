import type { TempEmail, Message, Provider } from '../types';
import { EMAIL_GEN_DELAY } from '../constants/providers';
import * as tempmailIo from './tempmail-io';
import * as mailTm from './mail-tm';
import * as guerrilla from './guerrilla';
import * as customDomain from './custom-domain';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getProviderApi(provider: Provider) {
  switch (provider) {
    case 'custom-domain':
      return customDomain;
    case 'temp-mail.io':
      return tempmailIo;
    case 'mail.tm':
      return mailTm;
    case 'guerrilla':
      return guerrilla;
  }
}

export async function generateRandomEmails(
  count: number,
  provider: Provider = 'custom-domain'
): Promise<TempEmail[]> {
  const emails: TempEmail[] = [];
  const api = getProviderApi(provider);

  for (let i = 0; i < count; i++) {
    try {
      const email = await api.createEmail();
      emails.push(email);
      if (i < count - 1) await sleep(EMAIL_GEN_DELAY);
    } catch (error) {
      console.error(`Failed to create email ${i + 1}/${count}:`, error);
    }
  }

  return emails;
}

// Provider APIs return varying message shapes — normalize them
interface RawMessage {
  [key: string]: unknown;
}

function normalizeMessage(msg: RawMessage): Message {
  const str = (val: unknown, fallback = '') => (typeof val === 'string' ? val : fallback);

  return {
    id: str(msg.mailboxId || msg.id || msg._id || msg.mail_id) || String(Math.random()),
    from: str(msg.messageFrom || msg.fromAddress || msg.from || msg.sender || msg.mail_from || msg.fromName),
    subject: str(msg.subject || msg.mail_subject) || '(no subject)',
    date: str(msg.createdAt || msg.date || msg.created_at || msg.mail_date),
    textBody: str(msg.body_text || msg.text || msg.intro || msg.mail_excerpt || msg.textBody),
    htmlBody: str(msg.html || msg.body_html || msg.htmlBody || msg.content) || undefined,
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const api = getProviderApi(email.provider);
  // Provider APIs return varying shapes — normalize them all
  const rawMessages = await api.getMessages(email) as unknown[];
  return rawMessages.map(normalizeMessage);
}

export async function getMessage(
  email: TempEmail,
  id: string | number
): Promise<Message> {
  // For providers that don't have a direct getMessage endpoint,
  // fetch from the inbox list and find the matching message
  if (email.provider === 'temp-mail.io') {
    const messages = await getMessages(email);
    const msg = messages.find((m) => m.id === id);
    if (msg) return msg;
    throw new Error('Message not found');
  }

  const api = getProviderApi(email.provider) as typeof customDomain;
  if (typeof api.getMessage === 'function') {
    return api.getMessage(email, id) as Promise<Message>;
  }

  throw new Error(`getMessage not supported for provider: ${email.provider}`);
}

// Re-export provider-specific APIs
export { tempmailIo, mailTm, guerrilla, customDomain };
