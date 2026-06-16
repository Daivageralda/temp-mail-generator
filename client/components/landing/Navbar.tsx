import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onLaunch: () => void;
}

export function Navbar({ onLaunch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-canvas/70 backdrop-blur-2xl border-b border-hairline'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-ink tracking-tight">BulkMail</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm text-muted hover:text-ink transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="text-sm text-muted hover:text-ink transition-colors">
              How it Works
            </button>
            <button onClick={() => scrollTo('providers')} className="text-sm text-muted hover:text-ink transition-colors">
              Providers
            </button>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLaunch}
              className="px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-active transition-colors"
            >
              Launch App
            </motion.button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-canvas/95 backdrop-blur-2xl border-b border-hairline p-6 space-y-4 md:hidden"
          >
            <button onClick={() => scrollTo('features')} className="block text-sm text-body hover:text-ink transition-colors py-2">
              Features
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="block text-sm text-body hover:text-ink transition-colors py-2">
              How it Works
            </button>
            <button onClick={() => scrollTo('providers')} className="block text-sm text-body hover:text-ink transition-colors py-2">
              Providers
            </button>
            <button
              onClick={onLaunch}
              className="w-full mt-4 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-lg"
            >
              Launch App
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
