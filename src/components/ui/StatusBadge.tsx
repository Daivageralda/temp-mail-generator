interface StatusBadgeProps {
  status: 'ready' | 'pending' | 'error';
  label: string;
  sublabel?: string;
}

const statusConfig = {
  ready: {
    dot: 'bg-success animate-pulse-dot',
    bg: 'bg-success/5 border-success/20',
    text: 'text-success',
    sub: 'text-success/60',
  },
  pending: {
    dot: 'bg-warning animate-pulse-dot',
    bg: 'bg-warning/5 border-warning/20',
    text: 'text-warning',
    sub: 'text-warning/60',
  },
  error: {
    dot: 'bg-error',
    bg: 'bg-error/5 border-error/20',
    text: 'text-error',
    sub: 'text-error/60',
  },
};

export function StatusBadge({ status, label, sublabel }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={`rounded-xl p-4 border ${config.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <div>
          <p className={`text-sm font-semibold ${config.text}`}>{label}</p>
          {sublabel && (
            <p className={`text-xs mt-0.5 ${config.sub}`}>{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
