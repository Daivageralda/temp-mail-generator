import type { TurnstileStatus } from '../../types';
import { Button } from '../ui/Button';

interface TurnstileBannerProps {
  status: TurnstileStatus;
  refreshing: boolean;
  onRefresh: () => void;
}

export function TurnstileBanner({ status, refreshing, onRefresh }: TurnstileBannerProps) {
  const isReady = status.tokenReady;

  return (
    <div className={`rounded-xl p-4 border ${
      isReady
        ? 'bg-success/5 border-success/20'
        : 'bg-warning/5 border-warning/20'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${
          isReady ? 'bg-success animate-pulse-dot' : 'bg-warning animate-pulse-dot'
        }`} />

        <div className="flex-1">
          {isReady ? (
            <div>
              <p className="text-sm font-semibold text-success">Turnstile Ready</p>
              <p className="text-xs text-success/60 mt-0.5">
                Token obtained — you can generate emails now
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-warning">Turnstile Setup Required</p>
              <p className="text-xs text-warning/60 mt-0.5">
                {status.browserOpen
                  ? 'Chrome is open — click the Turnstile checkbox in the Chrome window'
                  : 'Click "Setup Turnstile" to open Chrome and solve the captcha'}
              </p>
            </div>
          )}
        </div>

        {!isReady && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Waiting for click...' : '🔓 Setup Turnstile'}
          </Button>
        )}
      </div>
    </div>
  );
}
