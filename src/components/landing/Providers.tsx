import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const providers = [
  {
    name: 'Temp-Mail.io',
    emoji: '✉️',
    badge: 'Most Popular',
    description: 'Clean domains, reliable for most services. Great all-around choice.',
    features: ['Clean domains', 'Fast generation', 'Wide compatibility'],
    highlighted: true,
  },
  {
    name: 'Mail.tm',
    emoji: '📬',
    badge: 'Reliable',
    description: 'Stable and reliable. Perfect for testing environments.',
    features: ['RESTful API', 'Stable uptime', 'Good for testing'],
    highlighted: false,
  },
  {
    name: 'Guerrilla Mail',
    emoji: '🦎',
    badge: 'Classic',
    description: 'The OG temp mail service. May be blocked by some services.',
    features: ['Well-known', 'Simple API', 'Legacy support'],
    highlighted: false,
  },
  {
    name: 'Custom Server',
    emoji: '🏠',
    badge: 'Self-hosted',
    description: 'Your own email server with custom domain. Full control.',
    features: ['Custom domain', 'Full control', 'No blocking'],
    highlighted: false,
  },
];

export function Providers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="providers" className="relative py-24 lg:py-32 px-6 lg:px-12">
      <div className="w-full" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Providers</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            Choose your source
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Four providers with different strengths. Mix and match based on your needs.
          </p>
        </motion.div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                provider.highlighted
                  ? 'bg-primary/[0.03] border-primary/20 lg:col-span-1'
                  : 'bg-surface-card border-hairline hover:border-hairline-strong'
              }`}
            >
              {provider.highlighted && (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Recommended</span>
                </div>
              )}

              <div className="text-3xl mb-4">{provider.emoji}</div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-ink">{provider.name}</h3>
                {!provider.highlighted && (
                  <span className="text-[10px] font-medium text-muted bg-surface-elevated px-2 py-0.5 rounded-full">
                    {provider.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted mb-4 leading-relaxed">{provider.description}</p>

              <div className="space-y-2">
                {provider.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-body-strong">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
