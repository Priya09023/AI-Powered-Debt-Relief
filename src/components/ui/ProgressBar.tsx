import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'primary' | 'accent' | 'warning' | 'danger';
  showValue?: boolean;
}

const colorMap = {
  primary: 'from-primary-500 to-primary-400',
  accent: 'from-accent-500 to-accent-400',
  warning: 'from-warning-500 to-warning-400',
  danger: 'from-danger-500 to-danger-400',
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  color = 'primary',
  showValue = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-600 dark:text-secondary-300">{label}</span>
          {showValue && (
            <span className="font-semibold text-secondary-900 dark:text-white">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className="h-2 rounded-full bg-secondary-200 dark:bg-secondary-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
        />
      </div>
    </div>
  );
}
