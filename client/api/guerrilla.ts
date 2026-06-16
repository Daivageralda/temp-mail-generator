import type { TempEmail, Message } from '../types';
import { apiRequest } from './client';

interface GuerrillaCreateResponse {
  provider: string;
  email: string;
  token: string;
  timestamp: number;
}

export async function createEmail(): Promise<TempEmail> {
  const data = await apiRequest<GuerrillaCreateResponse>('/guerrilla/new');

  const [login, domain] = data.email.split('@');
  return {
    login,
    domain,
    fullAddress: data.email,
    token: data.token,
    provider: 'guerrilla',
  };
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  const data = await apiRequest<Message[]>('/guerrilla/messages', {
    headers: { 'x-token': email.token },
  });
  return Array.isArray(data) ? data : [];
}

export async function getMessage(email: TempEmail, id: string | number): Promise<Message> {
  return apiRequest<Message>(`/guerrilla/message/${id}`, {
    headers: { 'x-token': email.token },
  });
}
