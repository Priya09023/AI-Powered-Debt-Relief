import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Is FinRelief AI free to use?',
    a: 'Yes, you can create an account and access the core dashboard, loan management, settlement prediction, and negotiation letter generation at no cost during the beta period.',
  },
  {
    q: 'How accurate are the AI settlement predictions?',
    a: 'Our AI engine uses a weighted model considering your outstanding amount, income, expenses, overdue months, EMI ratio, and debt-to-income ratio. Predictions are recommendations — final settlement is at the lender\'s discretion.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Absolutely. We use Supabase row-level security with JWT authentication. Your data is encrypted in transit and at rest, and only you can access your own records.',
  },
  {
    q: 'Can I edit the AI-generated negotiation letter?',
    a: 'Yes. The generated letter is fully editable in the negotiation letter page. You can also copy it to your clipboard or download it as a PDF.',
  },
  {
    q: 'Does FinRelief AI provide legal advice?',
    a: 'No. FinRelief AI provides financial analysis and tools to assist with debt settlement. For legal advice, please consult a qualified attorney or credit counselor.',
  },
  {
    q: 'Which loan types are supported?',
    a: 'Personal loans, credit card debt, auto loans, home loans, education loans, business loans, and more. You can categorize each loan by type and priority.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-secondary-100/50 dark:bg-secondary-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-white">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-secondary-900 dark:text-white">{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }}>
                  <ChevronDown className="w-5 h-5 text-primary-500 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
