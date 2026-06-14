import type { TempEmail, Message } from '../types';
import { apiRequest } from './client';

interface MailTmCreateResponse {
  provider: string;
  email: string;
  token: string;
  accountId: string;
}

export async function createEmail(): Promise<TempEmail> {
  const data = await apiRequest<MailTmCreateResponse>('/mailtm/new', {
    method: 'POST',
  });

  const [login, domain] = data.email.split('@');
  return {
    login,
    domain,
    fullAddress: data.email,
    token: data.token,
    provider: 'mail.tm',
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const data = await apiRequest<Message[]>('/mailtm/messages', {
    headers: { 'x-token': email.token },
  });
  return Array.isArray(data) ? data : [];
}

export async function getMessage(email: TempEmail, id: string | number): Promise<Message> {
  return apiRequest<Message>(`/mailtm/message/${id}`, {
    headers: { 'x-token': email.token },
  });
}
