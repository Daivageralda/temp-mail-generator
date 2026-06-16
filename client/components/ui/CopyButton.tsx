interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  copied?: boolean;
}

export function CopyButton({ text, onCopy, copied }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    onCopy?.();
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-surface-card text-muted hover:text-ink transition-all duration-150 shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
