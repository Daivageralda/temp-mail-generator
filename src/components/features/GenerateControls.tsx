import { motion } from 'framer-motion';
import type { Provider } from '../../types';
import { PROVIDERS, MAX_EMAIL_COUNT } from '../../constants/providers';
import { Button } from '../ui/Button';

interface GenerateControlsProps {
  provider: Provider;
  count: number;
  loading: boolean;
  emailCount: number;
  onProviderChange: (provider: Provider) => void;
  onCountChange: (count: number) => void;
  onGenerate: () => void;
  onCopyAll: () => void;
}

export function GenerateControls({
  provider,
  count,
  loading,
  emailCount,
  onProviderChange,
  onCountChange,
  onGenerate,
  onCopyAll,
}: GenerateControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-end gap-3 bg-surface-card rounded-xl p-4 border border-hairline"
    >
      {/* Provider Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as Provider)}
          className="bg-surface-elevated border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary transition-colors font-sans"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Count Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Count
        </label>
        <input
          type="number"
          min={1}
          max={MAX_EMAIL_COUNT}
          value={count}
          onChange={(e) =>
            onCountChange(Math.min(MAX_EMAIL_COUNT, Math.max(1, Number(e.target.value))))
          }
          className="w-20 bg-surface-elevated border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary transition-colors font-mono"
        />
      </div>

      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Emails'
        )}
      </Button>

      {/* Copy All */}
      {emailCount > 0 && (
        <Button variant="ghost" onClick={onCopyAll} className="ml-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy All
        </Button>
      )}
    </motion.div>
  );
}
