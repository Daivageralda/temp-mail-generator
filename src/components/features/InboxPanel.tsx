import type { Message } from '../../types';
import { Button } from '../ui/Button';

interface InboxPanelProps {
  messages: Message[];
  loading: boolean;
  onOpenMessage: (msg: Message) => void;
  onRefresh: () => void;
  emailAddress: string;
}

export function InboxPanel({
  messages,
  loading,
  onOpenMessage,
  onRefresh,
  emailAddress,
}: InboxPanelProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-body-strong">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-muted-soft">
            Auto-refreshes every 5s
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          <svg
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {messages.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface-card border border-hairline flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-muted-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-body-strong">No messages yet</p>
          <p className="text-xs text-muted mt-1.5">
            Emails will appear here when sent to:
          </p>
          <code className="inline-block mt-2 text-xs font-mono text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg">
            {emailAddress}
          </code>
          <div className="text-xs text-muted max-w-sm mx-auto mt-6 p-4 bg-surface-card rounded-xl border border-hairline text-left space-y-1.5">
            <p className="font-medium text-body-strong mb-2">How to test:</p>
            <p>• Use this email to sign up on a website</p>
            <p>• Send an email from another account</p>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="space-y-1.5">
        {messages.map((msg) => (
          <button
            key={msg.id}
            onClick={() => onOpenMessage(msg)}
            className="w-full text-left bg-surface-card border border-hairline rounded-xl px-4 py-3 hover:border-hairline-strong transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">
                  {msg.subject || '(no subject)'}
                </p>
                <p className="text-xs text-muted truncate mt-0.5">{msg.from}</p>
              </div>
              <span className="text-xs text-muted-soft whitespace-nowrap font-mono">
                {msg.date}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
