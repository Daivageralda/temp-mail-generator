import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TempEmail, Message, Provider, ViewMode } from './types';
import { generateRandomEmails } from './api';
import { useInbox } from './hooks/useInbox';
import { LenisProvider } from './components/layout/LenisProvider';
import { GenerateControls } from './components/features/GenerateControls';
import { EmailList } from './components/features/EmailList';
import { InboxPanel } from './components/features/InboxPanel';
import { MessageViewer } from './components/features/MessageViewer';
import { SkeletonList } from './components/ui/Skeleton';

// Landing sections
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { Features } from './components/landing/Features';
import { HowItWorks } from './components/landing/HowItWorks';
import { Providers } from './components/landing/Providers';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';

/* ─── Backdrop overlay variants ───────────────────────────────────────────── */

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

/* ─── App ─────────────────────────────────────────────────────────────────── */

export default function App() {
  // ─── State ──────────────────────────────────────────────────────────────

  const [emails, setEmails] = useState<TempEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<TempEmail | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [count, setCount] = useState(5);
  const [provider, setProvider] = useState<Provider>('custom-domain');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('list');
  const [appOpen, setAppOpen] = useState(false);

  // ─── Hooks ──────────────────────────────────────────────────────────────

  const inbox = useInbox(appOpen && view === 'inbox' ? selectedEmail : null);

  // ─── Lock body scroll when modal is open ────────────────────────────────

  useEffect(() => {
    if (appOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [appOpen]);

  // Close on Escape
  useEffect(() => {
    if (!appOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view !== 'list') {
          goBack();
        } else {
          setAppOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOpen, view]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const openApp = useCallback(() => setAppOpen(true), []);
  const closeApp = useCallback(() => {
    setAppOpen(false);
    // Reset to list view after animation
    setTimeout(() => {
      setView('list');
      setSelectedEmail(null);
      setSelectedMessage(null);
    }, 300);
  }, []);

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

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <LenisProvider>
      <div className="min-h-screen bg-canvas text-body">
        {/* ═══ LANDING PAGE ═════════════════════════════════════════════════ */}
        <Navbar onLaunch={openApp} />
        <Hero onLaunch={openApp} />
        <Features />
        <HowItWorks />
        <Providers />
        <CTA onLaunch={openApp} />
        <Footer />

        {/* ═══ APP MODAL ════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {appOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                variants={backdrop}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={closeApp}
                className="fixed inset-0 z-50 bg-canvas/60 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                key="modal"
                variants={modal}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-x-0 top-[5vh] bottom-[5vh] z-50 flex items-start justify-center px-4 sm:px-6 pointer-events-none"
              >
                <div className="w-full max-w-2xl bg-canvas border border-hairline rounded-2xl shadow-2xl shadow-black/40 flex flex-col max-h-full pointer-events-auto overflow-hidden">
                  {/* ── Modal Header ─────────────────────────────────── */}
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-hairline shrink-0">
                    {view !== 'list' && (
                      <motion.button
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={goBack}
                        className="p-1 rounded-md hover:bg-surface-card transition-colors text-muted hover:text-ink"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-sm font-semibold text-ink tracking-tight">
                        {view === 'list' && 'BulkMail'}
                        {view === 'inbox' && (
                          <span className="font-mono text-xs">{selectedEmail?.fullAddress}</span>
                        )}
                        {view === 'message' && 'Message'}
                      </h2>
                    </div>

                    {view === 'list' && emails.length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto text-[11px] font-medium text-muted bg-surface-card px-2 py-0.5 rounded-full border border-hairline"
                      >
                        {emails.length}
                      </motion.span>
                    )}

                    {/* Close button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeApp}
                      className="p-1 rounded-md hover:bg-surface-card text-muted hover:text-ink transition-colors ml-auto"
                      title="Close (Esc)"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* ── Modal Body (scrollable) ──────────────────────── */}
                  <div className="flex-1 overflow-y-auto px-5 py-4" data-lenis-prevent>
                    <AnimatePresence mode="wait">
                      {/* List View */}
                      {view === 'list' && (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
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


                          {loading && emails.length === 0 && (
                            <SkeletonList count={count > 5 ? 5 : count} />
                          )}

                          <EmailList
                            emails={emails}
                            onOpen={openInbox}
                            onDelete={handleDeleteEmail}
                          />

                          {emails.length === 0 && !loading && (
                            <motion.div
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-center py-16"
                            >
                              <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                className="w-14 h-14 rounded-xl bg-surface-card border border-hairline flex items-center justify-center mx-auto mb-4"
                              >
                                <svg className="w-7 h-7 text-muted-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </motion.div>
                              <p className="text-sm font-medium text-body-strong">
                                Generate temporary emails
                              </p>
                              <p className="text-xs text-muted mt-1">
                                Select a provider and click Generate
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Inbox View */}
                      {view === 'inbox' && (
                        <motion.div
                          key="inbox"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <InboxPanel
                            messages={inbox.messages}
                            loading={inbox.loading}
                            onOpenMessage={openMessage}
                            onRefresh={inbox.refresh}
                            emailAddress={selectedEmail?.fullAddress ?? ''}
                          />
                        </motion.div>
                      )}

                      {/* Message View */}
                      {view === 'message' && selectedMessage && (
                        <motion.div
                          key="message"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <MessageViewer message={selectedMessage} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </LenisProvider>
  );
}
