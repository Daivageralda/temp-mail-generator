export type Provider = 'custom-domain' | 'temp-mail.io' | 'mail.tm' | 'guerrilla';

export interface TempEmail {
  login: string;
  domain: string;
  fullAddress: string;
  token: string;
  provider: Provider;
  mailId?: string;
  endAt?: string;
}

export interface Message {
  id: string | number;
  from: string;
  subject: string;
  date: string;
  body?: string;
  textBody?: string;
  htmlBody?: string;
}

export interface ProviderConfig {
  value: Provider;
  label: string;
  description: string;
}

export type ViewMode = 'list' | 'inbox' | 'message';
