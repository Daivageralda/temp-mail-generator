import { motion } from 'framer-motion';
import type { Message } from '../../types';

interface MessageViewerProps {
  message: Message;
}

export function MessageViewer({ message }: MessageViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-card border border-hairline rounded-xl p-5 space-y-3"
      >
        <h2 className="text-lg font-semibold text-ink tracking-tight">
          {message.subject || '(no subject)'}
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-soft text-xs uppercase tracking-wider font-medium">From</span>
            <span className="text-body">{message.from}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-soft text-xs uppercase tracking-wider font-medium">Date</span>
            <span className="text-body font-mono text-xs">{message.date}</span>
          </div>
        </div>
      </motion.div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-card border border-hairline rounded-xl p-5 min-h-[200px]"
      >
        {message.htmlBody ? (
          <iframe
            srcDoc={message.htmlBody}
            className="w-full min-h-[400px] bg-white rounded-lg"
            sandbox=""
            title="Email content"
          />
        ) : message.textBody ? (
          <pre className="text-sm text-body whitespace-pre-wrap font-sans leading-relaxed">
            {message.textBody}
          </pre>
        ) : message.body ? (
          <pre className="text-sm text-body whitespace-pre-wrap font-sans leading-relaxed">
            {message.body}
          </pre>
        ) : (
          <p className="text-muted text-center py-10 text-sm">No message body</p>
        )}
      </motion.div>
    </motion.div>
  );
}
