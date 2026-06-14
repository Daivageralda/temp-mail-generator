import type { Message } from '../types'

interface Props {
  messages: Message[]
  loading: boolean
  onOpenMessage: (msg: Message) => void
  onRefresh: () => void
  emailAddress: string
}

export function InboxPanel({ messages, loading, onOpenMessage, onRefresh, emailAddress }: Props) {
  const handleSendTest = async () => {
    // Use a free email testing service to send a test email
    const testSubject = `Test Email ${Date.now()}`
    const testBody = 'This is a test email to verify your inbox is working!'
    
    // Open mailto link (won't work in all browsers, but provides a fallback)
    window.open(`https://api.emailjs.com/api/v1.0/email/send?to_email=${encodeURIComponent(emailAddress)}&subject=${encodeURIComponent(testSubject)}&message=${encodeURIComponent(testBody)}`, '_blank')
    
    // Alternatively, you can use this free service:
    window.open(`https://www.emailondeck.com/two-step/?to=${encodeURIComponent(emailAddress)}&subject=${encodeURIComponent(testSubject)}&body=${encodeURIComponent(testBody)}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </h2>
          <span className="text-xs text-gray-600">Auto-refreshes every 5s</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendTest}
            className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
            title="Send a test email to verify inbox"
          >
            📧 Send Test
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {messages.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-600 space-y-3">
          <svg className="w-12 h-12 mx-auto opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <div>
            <p className="font-medium text-gray-400">No messages yet</p>
            <p className="text-sm mt-1">This inbox is empty. Emails will appear here when someone sends to:</p>
            <p className="text-sm font-mono text-indigo-400 mt-2">{emailAddress}</p>
          </div>
          <div className="text-xs text-gray-500 max-w-md mx-auto mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="font-medium text-gray-400 mb-2">💡 How to test:</p>
            <ul className="text-left space-y-1">
              <li>• Click "Send Test" button above</li>
              <li>• Use this email to sign up on a website</li>
              <li>• Send an email from another account</li>
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {messages.map(msg => (
          <button
            key={msg.id}
            onClick={() => onOpenMessage(msg)}
            className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{msg.subject || '(no subject)'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{msg.from}</p>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{msg.date}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
