import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Scale, ShieldCheck, Lightbulb, Building2, HelpCircle,
  ChevronDown, FileText, Gavel, Landmark, AlertCircle, Search,
} from 'lucide-react';

const sections = [
  {
    icon: Scale,
    title: 'Borrower Rights',
    color: 'from-primary-500 to-primary-700',
    items: [
      'Right to receive a copy of the loan agreement and all terms in clear language.',
      'Right to be informed of all charges, fees, and interest rates upfront.',
      'Right to a 15-day notice before a loan is classified as NPA (Non-Performing Asset).',
      'Right to fair treatment and non-discrimination by lenders.',
      'Right to privacy — lenders cannot share your data without consent.',
      'Right to receive a No Objection Certificate (NOC) after loan closure.',
      'Right to approach the Banking Ombudsman for grievance redressal.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Debt Management Tips',
    color: 'from-accent-500 to-accent-700',
    items: [
      'Create a budget: track income, expenses, and debt obligations monthly.',
      'Prioritize high-interest debts (credit cards) for faster payoff.',
      'Build an emergency fund covering 3-6 months of expenses.',
      'Consider debt consolidation to lower overall interest burden.',
      'Never ignore lender communications — respond promptly.',
      'Request restructuring or moratorium during genuine hardship.',
      'Check your credit report (CIBIL) annually for errors.',
    ],
  },
  {
    icon: Building2,
    title: 'Government Guidelines',
    color: 'from-warning-500 to-warning-700',
    items: [
      'RBI Fair Practices Code mandates transparent lending practices.',
      'SARFAESI Act: lenders can seize collateral after 90 days default — but with notice.',
      'IBBI regulations govern insolvency and bankruptcy proceedings.',
      'RBI Restructuring guidelines allow banks to offer relief during crises.',
      'Pradhan Mantri Garib Kalyan schemes provide debt relief for specific sectors.',
      'Digital Lending Guidelines 2022 regulate online loan apps.',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Financial Education',
    color: 'from-primary-400 to-primary-600',
    items: [
      'Understand the difference between secured and unsecured loans.',
      'Learn how compound interest works — it can work for or against you.',
      'Maintain a credit utilization ratio below 30% of your limit.',
      'Diversify income sources to reduce dependency on a single stream.',
      'Invest in insurance (life, health, and asset) to protect against shocks.',
      'Use SIPs and mutual funds for long-term wealth creation.',
    ],
  },
];

const faqs = [
  {
    q: 'What is a one-time settlement (OTS)?',
    a: 'OTS is an agreement where the lender accepts a reduced lump-sum payment to close a loan account. It\'s typically offered when the borrower faces genuine hardship and the loan is overdue.',
  },
  {
    q: 'Will settlement affect my credit score?',
    a: 'Yes. A settled status appears on your credit report and may lower your score temporarily. However, it\'s better than continued default. The score rebuilds over time with responsible borrowing.',
  },
  {
    q: 'Can I negotiate interest rates with my bank?',
    a: 'Yes. You can request your lender to reduce interest rates, especially if you have a good repayment history or if market rates have fallen. Banks may consider on a case-by-case basis.',
  },
  {
    q: 'What happens if I default on a loan?',
    a: 'After 90 days of non-payment, the loan is classified as NPA. The lender can initiate recovery under SARFAESI Act for secured loans, or file a civil suit. Always communicate with the lender first.',
  },
  {
    q: 'How do I file a complaint against a lender?',
    a: 'First, file a complaint with the lender\'s grievance redressal officer. If unresolved within 30 days, approach the Banking Ombudsman at rbi.org.in or call 14448.',
  },
  {
    q: 'Is debt settlement legal in India?',
    a: 'Yes. RBI permits one-time settlements as a legitimate recovery mechanism. Both parties must agree in writing, and the settlement terms should be documented.',
  },
];

export default function KnowYourRights() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...sections.map((s) => s.title)];

  const filteredSections = useMemo(() => {
    if (activeCategory === 'All' && !search) return sections;
    let list = activeCategory === 'All' ? sections : sections.filter((s) => s.title === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (item) => item.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
          ),
        }))
        .filter((s) => s.items.length > 0);
    }
    return list;
  }, [activeCategory, search]);

  const filteredFaqs = useMemo(() => {
    if (!search) return faqs;
    const q = search.toLowerCase();
    return faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-500" /> Know Your Rights
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Educational resources on borrower rights, debt management, and financial regulations in India.
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rights, tips, guidelines, FAQs..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === c
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="glow-orb w-64 h-64 bg-primary-500 -top-20 -right-10" />
        <div className="relative">
          <Gavel className="w-12 h-12 text-primary-400 mb-4" />
          <h3 className="font-display text-2xl font-bold text-white max-w-2xl">
            Empower yourself with financial knowledge
          </h3>
          <p className="mt-2 text-secondary-300 max-w-xl">
            Understand your rights as a borrower, learn debt management strategies, and navigate financial regulations with confidence.
          </p>
        </div>
      </motion.div>

      {/* Sections */}
      {filteredSections.length === 0 ? (
        <div className="card p-10 text-center">
          <Search className="w-10 h-10 text-secondary-300 dark:text-secondary-700 mx-auto mb-3" />
          <p className="text-sm text-secondary-500">No results found for "{search}"</p>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 gap-6">
        {filteredSections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{s.title}</h3>
            </div>
            <ul className="space-y-3">
              {s.items.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + idx * 0.03 }}
                  className="flex items-start gap-2.5 text-sm text-secondary-600 dark:text-secondary-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Landmark, label: 'RBI Guidelines', href: '#' },
          { icon: FileText, label: 'SARFAESI Act 2002', href: '#' },
          { icon: AlertCircle, label: 'Banking Ombudsman', href: '#' },
        ].map((l, i) => (
          <motion.a
            key={i}
            href={l.href}
            whileHover={{ y: -4 }}
            className="card p-5 flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
              <l.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary-900 dark:text-white">{l.label}</span>
          </motion.a>
        ))}
      </div>

      {/* FAQ */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-500" /> Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-6">No FAQs match your search.</p>
          ) : filteredFaqs.map((f, i) => (
            <div key={i} className="border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-secondary-900 dark:text-white">{f.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                  <ChevronDown className="w-5 h-5 text-primary-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-5 border-l-4 border-l-warning-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            <span className="font-semibold">Disclaimer:</span> This information is for educational purposes only and does not constitute legal or financial advice. Please consult a qualified professional for advice specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}
