import type { TempEmail, Message, Provider } from '../types';
import { EMAIL_GEN_DELAY } from '../constants/providers';
import * as tempmailIo from './tempmail-io';
import * as mailTm from './mail-tm';
import * as guerrilla from './guerrilla';
import * as customDomain from './custom-domain';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getProviderApi(provider: Provider) {
  switch (provider) {
    case 'temp-mail.io':
      return tempmailIo;
    case 'mail.tm':
      return mailTm;
    case 'guerrilla':
      return guerrilla;
    case 'hanzzcreator.xyz':
      return customDomain;
  }
}

export async function generateRandomEmails(
  count: number,
  provider: Provider = 'temp-mail.io'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMessage(msg: any): Message {
  return {
    id: msg.mailboxId || msg.id || msg._id || msg.mail_id || String(Math.random()),
    from: msg.messageFrom || msg.fromAddress || msg.from || msg.sender || msg.mail_from || msg.fromName || '',
    subject: msg.subject || msg.mail_subject || '(no subject)',
    date: msg.createdAt || msg.date || msg.created_at || msg.mail_date || '',
    textBody: msg.body_text || msg.text || msg.intro || msg.mail_excerpt || msg.textBody || '',
    htmlBody: msg.html || msg.body_html || msg.htmlBody || msg.content || undefined,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiWithGetMessage = getProviderApi(email.provider) as any;
  if (typeof apiWithGetMessage.getMessage === 'function') {
    return apiWithGetMessage.getMessage(email, id) as Promise<Message>;
  }

  throw new Error(`getMessage not supported for provider: ${email.provider}`);
}

// Re-export provider-specific APIs
export { tempmailIo, mailTm, guerrilla, customDomain };
