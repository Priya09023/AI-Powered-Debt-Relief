import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  to?: string;
}

export default function Logo({ size = 'md', showText = true, to = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <motion.div
        whileHover={{ rotate: -8, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`${s.icon} rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30`}
      >
        <TrendingUp className="w-1/2 h-1/2 text-white" strokeWidth={2.5} />
      </motion.div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-bold font-display tracking-tight text-secondary-900 dark:text-white`}>
            FinRelief<span className="text-primary-500"> AI</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-secondary-500 dark:text-secondary-400 font-medium tracking-wide">
              Debt Relief & Recovery
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
