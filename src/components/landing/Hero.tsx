import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingDown, ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';

const stats = [
  { label: 'Loans Managed', value: '₹1,200Cr+' },
  { label: 'Borrowers', value: '48,000+' },
  { label: 'AI Predictions', value: '2.1M+' },
  { label: 'Success Rate', value: '94%' },
];

const trustBadges = [
  'RBI Compliant',
  'Bank-Grade Encryption',
  'GDPR Ready',
  '24/7 Support',
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-bg pt-20">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="glow-orb w-[500px] h-[500px] bg-primary-600 -top-40 -left-40 animate-pulse-slow" />
      <div className="glow-orb w-[400px] h-[400px] bg-accent-600 top-1/2 -right-20 animate-pulse-slow" />
      <div className="glow-orb w-[300px] h-[300px] bg-primary-400 bottom-0 left-1/3 animate-float" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-secondary-200">Powered by Google Gemini AI</span>
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white text-balance">
            AI Powered Debt Relief &<br />
            <span className="gradient-text">Financial Recovery Platform</span>
          </h1>

          <p className="mt-6 text-lg text-secondary-300 max-w-xl mx-auto lg:mx-0 text-pretty">
            FinRelief AI analyzes your loans, predicts optimal settlement percentages,
            and generates professional negotiation letters — all powered by AI.
            Take control of your financial recovery today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="btn-primary text-base group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="btn-secondary text-base">
              Learn More
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-1.5 text-xs text-secondary-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                {badge}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center lg:text-left"
              >
                <div className="text-2xl lg:text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-secondary-400 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="glass-card p-6 relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary-300">Settlement Score</div>
                    <div className="text-2xl font-bold text-white">62%</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent-500/15 text-accent-300 text-xs font-medium">
                  Recommended
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Personal Loan', val: 68, color: 'bg-primary-500' },
                  { label: 'Credit Card', val: 55, color: 'bg-accent-500' },
                  { label: 'Auto Loan', val: 72, color: 'bg-warning-500' },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs text-secondary-300 mb-1">
                      <span>{b.label}</span>
                      <span>{b.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.val}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className={`h-full ${b.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="glass-card p-5 absolute -bottom-8 -left-8 z-20 w-56"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="text-xs text-secondary-300">Risk Level</div>
                  <div className="text-lg font-bold text-white">Low Risk</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
              className="glass-card p-5 absolute -top-6 -right-6 z-20 w-52"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-warning-400" />
                </div>
                <div>
                  <div className="text-xs text-secondary-300">Financial Health</div>
                  <div className="text-lg font-bold text-white">Good · 72</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-secondary-50 dark:from-secondary-950 to-transparent" />
    </section>
  );
}
