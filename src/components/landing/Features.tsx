import { motion } from 'framer-motion';
import {
  Brain, TrendingDown, Mail, BarChart3, LayoutDashboard, ShieldCheck, ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Financial Health Analysis',
    desc: 'AI evaluates your income, expenses, debts, and savings to compute a holistic financial health score with actionable insights.',
    color: 'from-primary-500 to-primary-700',
  },
  {
    icon: TrendingDown,
    title: 'Settlement Prediction',
    desc: 'Predict optimal settlement percentages and recommended amounts based on loan type, overdue months, and risk profile.',
    color: 'from-accent-500 to-accent-700',
  },
  {
    icon: Mail,
    title: 'AI Negotiation Letter',
    desc: 'Generate professional, polite settlement request emails to lenders with editable templates and PDF export.',
    color: 'from-warning-500 to-warning-700',
  },
  {
    icon: BarChart3,
    title: 'Debt Analytics',
    desc: 'Interactive charts for loan distribution, outstanding amounts, debt-to-income ratio, and monthly surplus trends.',
    color: 'from-primary-400 to-primary-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Borrower Dashboard',
    desc: 'A premium dashboard with financial score, debt stress, EMI ratio, risk level, and recent activity at a glance.',
    color: 'from-accent-400 to-accent-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    desc: 'JWT-based authentication with protected routes, password validation, and encrypted session management.',
    color: 'from-danger-500 to-danger-700',
  },
];

const statsBar = [
  { value: '94%', label: 'Settlement Success' },
  { value: '48K+', label: 'Active Borrowers' },
  { value: '₹1,200Cr+', label: 'Loans Managed' },
  { value: '2.1M+', label: 'AI Predictions' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white text-balance">
            Everything you need to recover financially
          </h2>
          <p className="mt-4 text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto text-pretty">
            A complete suite of AI-powered tools designed to help you negotiate, settle, and rebuild your financial future.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="card p-6 group cursor-default relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsBar.map((s) => (
            <div key={s.label} className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/10">
              <div className="text-3xl lg:text-4xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
