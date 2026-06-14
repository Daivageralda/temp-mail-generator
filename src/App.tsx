import { useState, useCallback } from 'react';
import type { TempEmail, Message, Provider, ViewMode } from './types';
import { generateRandomEmails } from './api';
import { useTurnstileStatus } from './hooks/useTurnstileStatus';
import { useInbox } from './hooks/useInbox';
import { GenerateControls } from './components/features/GenerateControls';
import { TurnstileBanner } from './components/features/TurnstileBanner';
import { EmailList } from './components/features/EmailList';
import { InboxPanel } from './components/features/InboxPanel';
import { MessageViewer } from './components/features/MessageViewer';

export default function App() {
  // ─── State ──────────────────────────────────────────────────────────────────

  const [emails, setEmails] = useState<TempEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<TempEmail | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [count, setCount] = useState(5);
  const [provider, setProvider] = useState<Provider>('tempmail.la');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('list');

  // ─── Hooks ──────────────────────────────────────────────────────────────────

  const turnstile = useTurnstileStatus(provider === 'tempmail.la');
  const inbox = useInbox(view === 'inbox' ? selectedEmail : null);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    const newEmails = await generateRandomEmails(count, provider);
    setEmails((prev) => [...newEmails, ...prev]);
    setLoading(false);
  }, [count, provider]);

  const openInbox = useCallback((email: TempEmail) => {
    setSelectedEmail(email);
    setView('inbox');
  }, []);

  const openMessage = useCallback(async (msg: Message) => {
    const full = await inbox.openMessage(msg);
    if (full) {
      setSelectedMessage(full);
      setView('message');
    }
  }, [inbox]);

  const goBack = useCallback(() => {
    if (view === 'message') {
      setSelectedMessage(null);
      setView('inbox');
    } else if (view === 'inbox') {
      setSelectedEmail(null);
      setView('list');
    }
  }, [view]);

  const handleDeleteEmail = useCallback(
    (email: TempEmail) => {
      setEmails((prev) => prev.filter((e) => e.fullAddress !== email.fullAddress));
      if (selectedEmail?.fullAddress === email.fullAddress) {
        setSelectedEmail(null);
        setView('list');
      }
    },
    [selectedEmail]
  );

  const handleCopyAll = useCallback(() => {
    const all = emails.map((e) => e.fullAddress).join('\n');
    navigator.clipboard.writeText(all);
  }, [emails]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-canvas text-body">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-hairline bg-canvas/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={goBack}
              className="p-1.5 rounded-lg hover:bg-surface-card transition-colors text-muted hover:text-ink"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-ink tracking-tight">
              {view === 'list' && 'Bulk Temp Mail'}
              {view === 'inbox' && (
                <span className="font-mono text-sm">{selectedEmail?.fullAddress}</span>
              )}
              {view === 'message' && 'Message'}
            </h1>
          </div>

          {view === 'list' && emails.length > 0 && (
            <span className="ml-auto text-xs font-medium text-muted bg-surface-card px-2.5 py-1 rounded-full border border-hairline">
              {emails.length} email{emails.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* List View */}
        {view === 'list' && (
          <div className="space-y-6">
            <GenerateControls
              provider={provider}
              count={count}
              loading={loading}
              emailCount={emails.length}
              onProviderChange={setProvider}
              onCountChange={setCount}
              onGenerate={handleGenerate}
              onCopyAll={handleCopyAll}
            />

            {/* Turnstile Banner (tempmail.la only) */}
            {provider === 'tempmail.la' && (
              <TurnstileBanner
                status={turnstile.status}
                refreshing={turnstile.refreshing}
                onRefresh={turnstile.handleRefresh}
              />
            )}

            <EmailList
              emails={emails}
              onOpen={openInbox}
              onDelete={handleDeleteEmail}
            />

            {/* Empty State */}
            {emails.length === 0 && !loading && (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-surface-card border border-hairline flex items-center justify-center mx-auto mb-5">
                  <svg className="w-9 h-9 text-muted-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-body-strong">
                  Generate temporary emails to get started
                </p>
                <p className="text-xs text-muted mt-1.5">
                  Select a provider and click Generate
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inbox View */}
        {view === 'inbox' && (
          <InboxPanel
            messages={inbox.messages}
            loading={inbox.loading}
            onOpenMessage={openMessage}
            onRefresh={inbox.refresh}
            emailAddress={selectedEmail?.fullAddress ?? ''}
          />
        )}

        {/* Message View */}
        {view === 'message' && selectedMessage && (
          <MessageViewer message={selectedMessage} />
        )}
      </main>
    </div>
  );
}
