import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types';
import { Button } from '../ui/Button';
import { SkeletonInbox } from '../ui/Skeleton';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {/* Email Header */}
      <div className="bg-surface-card border border-hairline rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-mono text-ink truncate">{emailAddress}</p>
          <p className="text-xs text-muted mt-0.5">
            {messages.length} message{messages.length !== 1 ? 's' : ''} · Auto-refreshes every 5s
          </p>
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

      {/* Loading state */}
      {loading && messages.length === 0 && (
        <SkeletonInbox count={3} />
      )}

      {/* Messages */}
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <motion.button
            key={msg.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => onOpenMessage(msg)}
            className="w-full text-left bg-surface-card border border-hairline rounded-xl p-4 hover:border-hairline-strong transition-colors block"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-info/10 text-info flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                {(msg.from?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm font-medium text-ink truncate">{msg.from}</span>
                  <span className="text-[11px] text-muted-soft shrink-0 font-mono">{msg.date}</span>
                </div>
                <p className="text-sm text-body-strong truncate">{msg.subject || '(no subject)'}</p>
                {msg.textBody && (
                  <p className="text-xs text-muted mt-1 truncate">{msg.textBody.slice(0, 100)}</p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {messages.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
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
            <p>• Messages auto-refresh every 5 seconds</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
