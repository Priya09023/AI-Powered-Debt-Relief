import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Brain, BarChart3 } from 'lucide-react';
import Logo from '../ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const highlights = [
  { icon: Brain, text: 'AI-powered settlement predictions' },
  { icon: ShieldCheck, text: 'Bank-grade security & encryption' },
  { icon: BarChart3, text: 'Real-time financial health analytics' },
  { icon: TrendingUp, text: '94% settlement success rate' },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - form */}
      <div className="flex flex-col p-6 sm:p-10 lg:p-16 bg-secondary-50 dark:bg-secondary-950">
        <Logo size="md" />
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <h1 className="font-display text-3xl font-bold text-secondary-900 dark:text-white mb-2">{title}</h1>
            <p className="text-secondary-500 dark:text-secondary-400 mb-8">{subtitle}</p>
            {children}
          </motion.div>
        </div>
        <p className="text-center text-xs text-secondary-400">
          © 2026 FinRelief AI. <Link to="/" className="hover:text-primary-500">Back to home</Link>
        </p>
      </div>

      {/* Right side - illustration */}
      <div className="hidden lg:flex relative gradient-bg items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="glow-orb w-[400px] h-[400px] bg-primary-600 -top-20 -right-20 animate-pulse-slow" />
        <div className="glow-orb w-[300px] h-[300px] bg-accent-600 bottom-0 left-0 animate-float" />

        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-white leading-tight mb-8"
          >
            Your path to <span className="gradient-text">financial freedom</span> starts here
          </motion.h2>
          <div className="space-y-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 glass-card p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  <h.icon className="w-5 h-5 text-primary-400" />
                </div>
                <span className="text-secondary-200">{h.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
