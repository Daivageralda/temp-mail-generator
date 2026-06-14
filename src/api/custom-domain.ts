import type { TempEmail, Message } from '../types';
import { apiRequest } from './client';

interface CustomCreateResponse {
  provider: string;
  email: string;
  mailId: string;
  endAt: string;
}

export async function createEmail(): Promise<TempEmail> {
  const data = await apiRequest<CustomCreateResponse>('/custom/new', {
    method: 'POST',
  });

  const [login, domain] = data.email.split('@');
  return {
    login,
    domain,
    fullAddress: data.email,
    token: '',
    provider: 'hanzzcreator.xyz',
    mailId: data.mailId,
    endAt: data.endAt,
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const data = await apiRequest<Message[]>(`/custom/messages/${encodeURIComponent(email.fullAddress)}`);
  return Array.isArray(data) ? data : [];
}

export async function getMessage(_email: TempEmail, id: string | number): Promise<Message> {
  const data = await apiRequest<{
    id: number;
    from: string;
    subject: string;
    text: string;
    html: string;
    date: string;
  }>(`/custom/message/${id}`);

  return {
    id: data.id,
    from: data.from,
    subject: data.subject,
    date: data.date,
    textBody: data.text || '',
    htmlBody: data.html || undefined,
  };
}
