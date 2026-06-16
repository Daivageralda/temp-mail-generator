import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary font-semibold hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted disabled:cursor-not-allowed',
  secondary:
    'bg-surface-card text-ink border border-hairline hover:border-hairline-strong hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-muted hover:text-ink hover:bg-surface-card disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'text-muted hover:text-error hover:bg-error/10 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {icon}
      {children}
    </motion.button>
  );
}
