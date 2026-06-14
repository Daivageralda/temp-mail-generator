import type { TempEmail, Message, Provider } from './types'

const API_BASE = 'http://localhost:3001/api'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function generateRandomEmails(count: number, provider: Provider = 'temp-mail.io'): Promise<TempEmail[]> {
  const emails: TempEmail[] = []

  for (let i = 0; i < count; i++) {
    try {
      let endpoint = ''
      let body: any = undefined

      if (provider === 'temp-mail.io') {
        endpoint = '/tempmail/new'
        body = { min_name_length: 8, max_name_length: 12 }
      } else if (provider === 'mail.tm') {
        endpoint = '/mailtm/new'
      } else if (provider === 'guerrilla') {
        endpoint = '/guerrilla/new'
      } else if (provider === 'tempmail.la') {
        endpoint = '/templla/new'
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create email')
      }

      const data = await response.json()
      const [login, domain] = data.email.split('@')

      emails.push({
        login,
        domain,
        fullAddress: data.email,
        token: data.token || data.accountId || data.mailId || '',
        provider: data.provider,
        mailId: data.mailId,
        endAt: data.endAt,
      })

      if (i < count - 1) await sleep(200)
    } catch (error) {
      console.error(`Failed to create email ${i + 1}/${count}:`, error)
    }
  }

  return emails
}

export async function getMessages(email: TempEmail): Promise<Message[]> {
  let endpoint = ''
  const headers: Record<string, string> = {
    'x-token': email.token,
  }

  if (email.provider === 'temp-mail.io') {
    endpoint = `/tempmail/messages/${email.fullAddress}`
  } else if (email.provider === 'mail.tm') {
    endpoint = '/mailtm/messages'
  } else if (email.provider === 'guerrilla') {
    endpoint = '/guerrilla/messages'
  } else if (email.provider === 'tempmail.la') {
    endpoint = `/templla/messages/${email.fullAddress}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { headers })
  if (!response.ok) return []

  const data = await response.json()
  if (!Array.isArray(data)) return []

  return data.map((msg: any) => ({
    id: msg.mailboxId || msg.id || msg._id || msg.mail_id || Math.random(),
    from: msg.messageFrom || msg.fromAddress || msg.from || msg.sender || msg.mail_from || msg.fromName || '',
    subject: msg.subject || msg.mail_subject || '(no subject)',
    date: msg.createdAt || msg.date || msg.created_at || msg.mail_date || '',
    textBody: msg.body_text || msg.text || msg.intro || msg.mail_excerpt || msg.textBody || '',
    htmlBody: msg.html || msg.body_html || msg.htmlBody || msg.content || undefined,
  }))
}

export async function getMessage(email: TempEmail, id: string | number): Promise<Message> {
  if (email.provider === 'temp-mail.io') {
    const messages = await getMessages(email)
    const msg = messages.find(m => m.id === id)
    if (msg) return msg
    throw new Error('Message not found')
  }

  if (email.provider === 'tempmail.la') {
    // Use getMessages which already has html from /api/mail/box
    const messages = await getMessages(email)
    const msg = messages.find(m => m.id === id)
    if (msg) return msg
    // Fallback: fetch from server
    const endpoint = `/templla/message/${email.mailId}/${id}`
    const response = await fetch(`${API_BASE}${endpoint}`)
    if (!response.ok) throw new Error('Failed to fetch message')
    const raw = await response.json()
    return {
      id: raw.mailboxId || raw.id || id,
      from: raw.messageFrom || raw.from || raw.sender || '',
      subject: raw.subject || '(no subject)',
      date: raw.createdAt || raw.date || '',
      textBody: raw.text || raw.body_text || '',
      htmlBody: raw.html || raw.body_html || undefined,
    }
  }

  let endpoint = ''
  const headers: Record<string, string> = {
    'x-token': email.token,
  }

  if (email.provider === 'mail.tm') {
    endpoint = `/mailtm/message/${id}`
  } else if (email.provider === 'guerrilla') {
    endpoint = `/guerrilla/message/${id}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { headers })
  if (!response.ok) throw new Error('Failed to fetch message')

  const msg = await response.json()
  return {
    id: msg.id || msg.mail_id || id,
    from: msg.from ? (msg.from[0]?.address || '') : (msg.mail_from || ''),
    subject: msg.subject || msg.mail_subject || '(no subject)',
    date: msg.date || msg.created_at || msg.mail_date || '',
    textBody: msg.body_text || msg.text || msg.mail_body || '',
    htmlBody: msg.body_html || msg.html || msg.mail_html || undefined,
  }
}
