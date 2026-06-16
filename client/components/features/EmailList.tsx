import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TempEmail } from '../../types';
import { CopyButton } from '../ui/CopyButton';

interface EmailListProps {
  emails: TempEmail[];
  onOpen: (email: TempEmail) => void;
  onDelete: (email: TempEmail) => void;
}

export function EmailList({ emails, onOpen, onDelete }: EmailListProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (emails.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {emails.map((email, idx) => (
          <motion.div
            key={email.fullAddress}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97, height: 0, marginBottom: 0, paddingBottom: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 bg-surface-card border border-hairline rounded-xl px-4 py-3 hover:border-hairline-strong transition-colors group"
          >
            {/* Index */}
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-medium shrink-0">
              {idx + 1}
            </div>

            {/* Email Address */}
            <button
              onClick={() => onOpen(email)}
              className="flex-1 text-left min-w-0"
            >
              <span className="text-sm font-medium text-ink truncate block hover:text-primary transition-colors font-mono">
                {email.fullAddress}
              </span>
            </button>

            {/* Provider badge */}
            <span className="hidden sm:inline text-[10px] text-muted-soft bg-surface-elevated px-2 py-0.5 rounded-full shrink-0">
              {email.provider}
            </span>

            {/* Copy */}
            <CopyButton
              text={email.fullAddress}
              onCopy={() => {
                setCopiedIdx(idx);
                setTimeout(() => setCopiedIdx(null), 1500);
              }}
              copied={copiedIdx === idx}
            />

            {/* Open Inbox */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpen(email)}
              className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted hover:text-primary transition-all duration-150"
              title="Open inbox"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2.0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.button>

            {/* Delete */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(email)}
              className="p-1.5 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-all duration-150"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
