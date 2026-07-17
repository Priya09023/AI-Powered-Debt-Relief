import { motion } from 'framer-motion';
import { UserPlus, FileSpreadsheet, Brain, Mail, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    desc: 'Sign up securely with email and password. Your data is protected with JWT authentication and row-level security.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Add Loans & Financial Profile',
    desc: 'Enter your loans, monthly income, expenses, savings, and existing debts to build your financial snapshot.',
  },
  {
    icon: Brain,
    title: 'AI Settlement Prediction',
    desc: 'Our AI engine analyzes your data and predicts the optimal settlement percentage, recommended amount, and risk category.',
  },
  {
    icon: Mail,
    title: 'Generate Negotiation Letter',
    desc: 'Get a professional, editable settlement request letter ready to send to your lender. Download as PDF instantly.',
  },
  {
    icon: CheckCircle2,
    title: 'Track & Recover',
    desc: 'Monitor your settlement history, track your financial health score, and rebuild your credit with confidence.',
  },
];

export default function Workflow() {
  return (
    <section id="workflow" className="py-24 bg-secondary-100/50 dark:bg-secondary-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-500 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white">
            Five steps to financial freedom
          </h2>
          <p className="mt-4 text-lg text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto">
            From sign-up to settlement, our guided workflow makes debt relief simple and stress-free.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-accent-500 to-primary-500 hidden md:block" />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1">
                  <div className={`card p-6 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center mb-4 shadow-lg ${i % 2 === 0 ? 'md:ml-auto' : ''}`}>
                      <s.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                      {i + 1}. {s.title}
                    </h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">{s.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-12 h-12 rounded-full bg-secondary-50 dark:bg-secondary-950 border-2 border-primary-500 items-center justify-center text-primary-500 font-bold text-lg z-10 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
