import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
