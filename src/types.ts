export type Provider = 'temp-mail.io' | 'mail.tm' | 'guerrilla' | 'tempmail.la';

export interface TempEmail {
  login: string
  domain: string
  fullAddress: string
  token: string
  provider: Provider
  mailId?: string
  endAt?: string
}

export interface Message {
  id: string | number
  from: string
  subject: string
  date: string
  body?: string
  textBody?: string
  htmlBody?: string
}
