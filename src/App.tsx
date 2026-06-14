import { useState, useCallback, useRef, useEffect } from 'react'
import type { TempEmail, Message, Provider } from './types'
import { generateRandomEmails, getMessages, getMessage } from './api'
import { EmailList } from './components/EmailList'
import { InboxPanel } from './components/InboxPanel'
import { MessageViewer } from './components/MessageViewer'

type View = 'list' | 'inbox' | 'message'

const providers: { value: Provider; label: string; description: string }[] = [
  { value: 'tempmail.la', label: '🔥 TempMail.la', description: 'Stealth domains — best for services that block temp emails (Qoder, etc.)' },
  { value: 'temp-mail.io', label: 'Temp-Mail.io', description: 'Clean domains, best for most services' },
  { value: 'mail.tm', label: 'Mail.tm', description: 'Reliable, good for testing' },
  { value: 'guerrilla', label: 'Guerrilla Mail', description: 'Classic provider, may be blocked' },
]

export default function App() {
  const [emails, setEmails] = useState<TempEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<TempEmail | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [count, setCount] = useState(5)
  const [provider, setProvider] = useState<Provider>('tempmail.la')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [view, setView] = useState<View>('list')
  const [turnstileStatus, setTurnstileStatus] = useState<{ tokenReady: boolean; browserOpen: boolean }>({ tokenReady: false, browserOpen: false })
  const [refreshingToken, setRefreshingToken] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // Poll Turnstile status every 2 seconds when using tempmail.la
  useEffect(() => {
    if (provider !== 'tempmail.la') return
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/templla/status')
        const data = await res.json()
        setTurnstileStatus(data)
      } catch {}
    }
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [provider])

  const handleRefreshToken = async () => {
    setRefreshingToken(true)
    try {
      await fetch('http://localhost:3001/api/templla/refresh-token', { method: 'POST' })
      // Re-check status after refresh
      const res = await fetch('http://localhost:3001/api/templla/status')
      const data = await res.json()
      setTurnstileStatus(data)
    } catch {}
    setRefreshingToken(false)
  }

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    const newEmails = await generateRandomEmails(count, provider)
    setEmails(prev => [...newEmails, ...prev])
    setLoading(false)
  }, [count, provider])

  const openInbox = useCallback(async (email: TempEmail) => {
    setSelectedEmail(email)
    setView('inbox')
    setRefreshing(true)
    try {
      const msgs = await getMessages(email)
      setMessages(msgs)
    } catch {
      setMessages([])
    }
    setRefreshing(false)
  }, [])

  const openMessage = useCallback(async (msg: Message) => {
    if (!selectedEmail) return
    setRefreshing(true)
    try {
      const full = await getMessage(selectedEmail, msg.id)
      setSelectedMessage(full)
      setView('message')
    } catch {
      // ignore
    }
    setRefreshing(false)
  }, [selectedEmail])

  const goBack = useCallback(() => {
    if (view === 'message') {
      setSelectedMessage(null)
      setView('inbox')
    } else if (view === 'inbox') {
      setSelectedEmail(null)
      setView('list')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [view])

  // Auto-refresh inbox every 5s when viewing inbox
  useEffect(() => {
    if (view === 'inbox' && selectedEmail) {
      intervalRef.current = window.setInterval(async () => {
        try {
          const msgs = await getMessages(selectedEmail)
          setMessages(msgs)
        } catch {
          // ignore
        }
      }, 5000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [view, selectedEmail])

  const handleDeleteEmail = useCallback((email: TempEmail) => {
    setEmails(prev => prev.filter(e => e.fullAddress !== email.fullAddress))
    if (selectedEmail?.fullAddress === email.fullAddress) {
      setSelectedEmail(null)
      setView('list')
    }
  }, [selectedEmail])

  const handleCopyAll = useCallback(() => {
    const all = emails.map(e => e.fullAddress).join('\n')
    navigator.clipboard.writeText(all)
  }, [emails])

  const handleRefreshInbox = useCallback(async () => {
    if (!selectedEmail) return
    setRefreshing(true)
    try {
      const msgs = await getMessages(selectedEmail)
      setMessages(msgs)
    } catch {
      // ignore
    }
    setRefreshing(false)
  }, [selectedEmail])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={goBack}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h1 className="text-lg font-semibold">
              {view === 'list' && 'Bulk Temp Mail'}
              {view === 'inbox' && selectedEmail?.fullAddress}
              {view === 'message' && 'Message'}
            </h1>
          </div>
          {view === 'list' && emails.length > 0 && (
            <span className="ml-auto text-sm text-gray-500">{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* List View */}
        {view === 'list' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Provider:</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value as Provider)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {providers.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Count:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={e => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition mt-auto"
              >
                {loading ? 'Generating...' : 'Generate Emails'}
              </button>
              {emails.length > 0 && (
                <button
                  onClick={handleCopyAll}
                  className="ml-auto text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                >
                  📋 Copy All
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 px-2">
              {providers.find(p => p.value === provider)?.description}
            </p>

            {/* Turnstile Status Banner (tempmail.la only) */}
            {provider === 'tempmail.la' && (
              <div className={`rounded-xl p-4 border ${turnstileStatus.tokenReady ? 'bg-green-900/20 border-green-800' : 'bg-amber-900/20 border-amber-800'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${turnstileStatus.tokenReady ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                  <div className="flex-1">
                    {turnstileStatus.tokenReady ? (
                      <div>
                        <p className="text-sm font-medium text-green-300">✅ Turnstile Ready</p>
                        <p className="text-xs text-green-400/70">Token obtained — you can generate emails now!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-amber-300">⏳ Turnstile Setup Required</p>
                        <p className="text-xs text-amber-400/70">
                          {turnstileStatus.browserOpen
                            ? 'Chrome is open — click the Turnstile checkbox in the Chrome window!'
                            : 'Click "Setup Turnstile" to open Chrome and solve the captcha'}
                        </p>
                      </div>
                    )}
                  </div>
                  {!turnstileStatus.tokenReady && (
                    <button
                      onClick={handleRefreshToken}
                      disabled={refreshingToken}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
                    >
                      {refreshingToken ? '⏳ Waiting for click...' : '🔓 Setup Turnstile'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Email List */}
            <EmailList
              emails={emails}
              onOpen={openInbox}
              onDelete={handleDeleteEmail}
            />

            {emails.length === 0 && !loading && (
              <div className="text-center py-20 text-gray-600">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">Generate temporary emails to get started</p>
                <p className="text-sm mt-1">Emails are powered by 1secmail.com</p>
              </div>
            )}
          </div>
        )}

        {/* Inbox View */}
        {view === 'inbox' && (
          <InboxPanel
            messages={messages}
            loading={refreshing}
            onOpenMessage={openMessage}
            onRefresh={handleRefreshInbox}            emailAddress={selectedEmail?.fullAddress ?? ''}          />
        )}

        {/* Message View */}
        {view === 'message' && selectedMessage && (
          <MessageViewer message={selectedMessage} />
        )}
      </main>
    </div>
  )
}
