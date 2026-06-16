import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Choose a Provider',
    description: 'Select from 4 email providers — each with different domains and capabilities. Use custom domain for stricter services.',
    visual: (
      <div className="bg-surface-elevated rounded-lg p-3 border border-hairline">
        {['Temp-Mail.io', 'Mail.tm', 'Guerrilla Mail', '🏠 Custom'].map((p, i) => (
          <div key={p} className={`px-3 py-2 rounded-md text-sm ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted'} flex items-center gap-2`}>
            <span className="font-mono text-xs opacity-50">{i + 1}</span>
            {p}
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '02',
    title: 'Set Batch Size',
    description: 'Generate anywhere from 1 to 50 emails at once. Perfect for bulk account creation or mass testing scenarios.',
    visual: (
      <div className="bg-surface-elevated rounded-lg p-4 border border-hairline">
        <div className="text-xs text-muted mb-2 uppercase tracking-wider">Count</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-hairline rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
          </div>
          <span className="text-ink font-mono text-sm font-medium">30</span>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Generate & Use',
    description: 'Hit generate and get your emails instantly. Copy individually or export all. Each has a live inbox with auto-refresh.',
    visual: (
      <div className="bg-surface-elevated rounded-lg p-3 border border-hairline space-y-1.5">
        {['user_a3f@mail.io', 'test_8x2@guerrilla.im', 'dev_k91@custom.xyz'].map((email) => (
          <div key={email} className="flex items-center gap-2 px-3 py-2 bg-surface-card rounded-md">
            <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-mono">✓</span>
            <span className="text-sm text-ink font-mono truncate">{email}</span>
          </div>
        ))}
      </div>
    ),
  },
];

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
    >
      {/* Text */}
      <div className="flex-1 w-full">
        <span className="text-5xl font-bold text-hairline-strong tracking-tight">{step.number}</span>
        <h3 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight mt-2 mb-3">{step.title}</h3>
        <p className="text-muted text-base leading-relaxed">{step.description}</p>
      </div>

      {/* Visual */}
      <div className="flex-1 w-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-surface-card border border-hairline rounded-2xl p-6 lg:p-8"
        >
          {step.visual}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 px-6 lg:px-12">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">How it Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight mb-4">
            Three simple steps
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            From zero to disposable emails in under 10 seconds.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-20 lg:space-y-28">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
