export type Provider = 'temp-mail.io' | 'mail.tm' | 'guerrilla' | 'hanzzcreator.xyz';

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
