import type { TempEmail, Message } from '../types';
import { apiRequest } from './client';

interface TempMailIoResponse {
  provider: string;
  email: string;
  token: string;
}

export async function createEmail(): Promise<TempEmail> {
  const data = await apiRequest<TempMailIoResponse>('/tempmail/new', {
    method: 'POST',
    body: JSON.stringify({ min_name_length: 8, max_name_length: 12 }),
  });

  const [login, domain] = data.email.split('@');
  return {
    login,
    domain,
    fullAddress: data.email,
    token: data.token,
    provider: 'temp-mail.io',
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const data = await apiRequest<Message[]>(
    `/tempmail/messages/${email.fullAddress}`,
    { headers: { 'x-token': email.token } }
  );
  return Array.isArray(data) ? data : [];
}
