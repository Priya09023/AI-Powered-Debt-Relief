import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

const variants = {
  primary: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
  accent: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
  warning: 'bg-warning-500/15 text-warning-300 border-warning-500/30',
  danger: 'bg-danger-500/15 text-danger-300 border-danger-500/30',
  neutral: 'bg-secondary-500/15 text-secondary-300 border-secondary-500/30',
};

export default function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const sizes = { sm: 'px-2.5 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
