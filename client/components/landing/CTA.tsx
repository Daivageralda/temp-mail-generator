import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface CTAProps {
  onLaunch: () => void;
}

export function CTA({ onLaunch }: CTAProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12">
      <div ref={ref} className="relative w-full">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 bg-surface-card border border-hairline rounded-3xl p-10 sm:p-16 lg:p-20 text-center overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            Ready to generate?
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto mb-10">
            No sign-up required. No limits. Just disposable emails when you need them.
          </p>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunch}
            className="px-10 py-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-primary-active transition-colors glow-primary"
          >
            Launch BulkMail →
          </motion.button>

          <p className="text-xs text-muted-soft mt-6">
            Free and open-source. No account needed.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
