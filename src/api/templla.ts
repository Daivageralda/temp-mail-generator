import type { TempEmail, Message, TurnstileStatus } from '../types';
import { apiRequest } from './client';

interface TempllaCreateResponse {
  provider: string;
  email: string;
  mailId: string;
  endAt: string;
}

export async function createEmail(domain?: string): Promise<TempEmail> {
  const data = await apiRequest<TempllaCreateResponse>('/templla/new', {
    method: 'POST',
    body: JSON.stringify(domain ? { domain } : {}),
  });

  const [login, dom] = data.email.split('@');
  return {
    login,
    domain: dom,
    fullAddress: data.email,
    token: data.mailId || '',
    provider: 'tempmail.la',
    mailId: data.mailId,
    endAt: data.endAt,
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const data = await apiRequest<Message[]>(
    `/templla/messages/${email.fullAddress}`
  );
  return Array.isArray(data) ? data : [];
}

export async function getMessage(email: TempEmail, id: string | number): Promise<Message> {
  return apiRequest<Message>(`/templla/message/${email.mailId}/${id}`);
}

export async function getStatus(): Promise<TurnstileStatus> {
  return apiRequest<TurnstileStatus>('/templla/status');
}

export async function refreshToken(): Promise<{ success: boolean; message: string }> {
  return apiRequest('/templla/refresh-token', { method: 'POST' });
}
