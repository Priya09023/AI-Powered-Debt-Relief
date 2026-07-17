import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, TrendingUp, TrendingDown, PiggyBank, AlertTriangle,
  ShieldCheck, Target, Wallet, Percent, CheckCircle2, ArrowRight,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import type { Loan, Profile } from '../../lib/types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface RecommendationsPanelProps {
  profile: Profile;
  loans: Loan[];
}

interface Recommendation {
  id: string;
  icon: typeof Lightbulb;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'savings' | 'debt' | 'income' | 'risk' | 'general';
  action?: string;
}

export default function RecommendationsPanel({ profile, loans }: RecommendationsPanelProps) {
  const income = Number(profile.monthly_income) || 0;
  const expenses = Number(profile.monthly_expenses) || 0;
  const savings = Number(profile.savings) || 0;
  const existingDebts = Number(profile.existing_debts) || 0;
  const dependents = Number(profile.dependents) || 0;

  const totalEMI = loans.reduce((sum, l) => sum + Number(l.emi), 0);
  const outstanding = loans.reduce((sum, l) => sum + Number(l.outstanding_amount), 0);
  const surplus = income - expenses;
  const emiRatio = income > 0 ? (totalEMI / income) * 100 : 0;
  const dti = income > 0 ? (outstanding / (income * 12)) * 100 : 0;
  const savingsCoverage = existingDebts > 0 ? (savings / existingDebts) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];

    if (surplus < 0) {
      recs.push({
        id: 'negative-surplus',
        icon: AlertTriangle,
        title: 'Urgent: Expenses exceed income',
        description: `Your monthly expenses (${formatINR(expenses)}) exceed your income (${formatINR(income)}). Reduce non-essential spending by at least 15% immediately to avoid further debt accumulation.`,
        priority: 'high',
        category: 'risk',
        action: 'Create a strict monthly budget',
      });
    } else if (surplus < income * 0.1) {
      recs.push({
        id: 'low-surplus',
        icon: TrendingDown,
        title: 'Low monthly surplus',
        description: `Your surplus is only ${formatINR(surplus)} (${Math.round((surplus / income) * 100)}% of income). Aim for a surplus of at least 20% to build savings and handle emergencies.`,
        priority: 'medium',
        category: 'savings',
        action: 'Cut discretionary expenses',
      });
    } else {
      recs.push({
        id: 'healthy-surplus',
        icon: TrendingUp,
        title: 'Healthy monthly surplus',
        description: `You maintain a surplus of ${formatINR(surplus)}. Allocate 50% to savings, 30% to debt prepayment, and 20% to investments for balanced growth.`,
        priority: 'low',
        category: 'savings',
        action: 'Set up automatic transfers',
      });
    }

    if (emiRatio > 50) {
      recs.push({
        id: 'high-emi',
        icon: AlertTriangle,
        title: 'Critical EMI burden',
        description: `Your EMI-to-income ratio is ${Math.round(emiRatio)}% — well above the safe 40% threshold. Consider loan consolidation, tenure extension, or partial settlement to reduce monthly burden.`,
        priority: 'high',
        category: 'debt',
        action: 'Request tenure extension',
      });
    } else if (emiRatio > 30) {
      recs.push({
        id: 'moderate-emi',
        icon: Percent,
        title: 'Moderate EMI burden',
        description: `Your EMI ratio is ${Math.round(emiRatio)}%. Avoid taking new loans and focus on prepaying high-interest debts to bring this below 30%.`,
        priority: 'medium',
        category: 'debt',
        action: 'Prepay high-interest loans',
      });
    }

    if (savingsCoverage < 20) {
      recs.push({
        id: 'low-savings',
        icon: PiggyBank,
        title: 'Insufficient savings buffer',
        description: `Your savings cover only ${Math.round(savingsCoverage)}% of your existing debts. Build an emergency fund covering 3-6 months of expenses before investing.`,
        priority: 'high',
        category: 'savings',
        action: 'Start a recurring deposit',
      });
    } else if (savingsCoverage >= 100) {
      recs.push({
        id: 'strong-savings',
        icon: ShieldCheck,
        title: 'Strong savings position',
        description: `Your savings fully cover your existing debts. Consider investing surplus in diversified mutual funds or SIPs for long-term wealth creation.`,
        priority: 'low',
        category: 'income',
        action: 'Consult a financial advisor',
      });
    }

    if (dti > 50) {
      recs.push({
        id: 'high-dti',
        icon: AlertTriangle,
        title: 'High debt-to-income ratio',
        description: `Your DTI is ${Math.round(dti)}%, indicating heavy leverage. Prioritize debt reduction over new investments. Use the snowball or avalanche method to pay off loans.`,
        priority: 'high',
        category: 'debt',
        action: 'Use avalanche method',
      });
    }

    if (expenseRatio > 70) {
      recs.push({
        id: 'high-expenses',
        icon: Wallet,
        title: 'High expense ratio',
        description: `Your expenses consume ${Math.round(expenseRatio)}% of your income. Review discretionary spending on dining, entertainment, and subscriptions.`,
        priority: 'medium',
        category: 'savings',
        action: 'Track expenses for 30 days',
      });
    }

    if (dependents > 0 && savings < expenses * 3) {
      recs.push({
        id: 'dependents-insurance',
        icon: ShieldCheck,
        title: 'Protect your dependents',
        description: `With ${dependents} dependent${dependents > 1 ? 's' : ''}, ensure you have life insurance (cover of 10x annual income) and health insurance for the family.`,
        priority: 'high',
        category: 'risk',
        action: 'Get term insurance',
      });
    }

    const overdueLoans = loans.filter((l) => Number(l.overdue_months) > 0);
    if (overdueLoans.length > 0) {
      recs.push({
        id: 'overdue-loans',
        icon: AlertTriangle,
        title: `${overdueLoans.length} overdue loan${overdueLoans.length > 1 ? 's' : ''}`,
        description: `You have ${overdueLoans.length} loan${overdueLoans.length > 1 ? 's' : ''} with overdue payments. Contact your lender${overdueLoans.length > 1 ? 's' : ''} immediately to negotiate a restructuring or one-time settlement.`,
        priority: 'high',
        category: 'debt',
        action: 'Use AI Negotiation Letter',
      });
    }

    recs.push({
      id: 'review-quarterly',
      icon: Target,
      title: 'Review your profile quarterly',
      description: 'Financial situations change. Revisit your profile every 3 months to keep your health score and AI predictions accurate.',
      priority: 'low',
      category: 'general',
    });

    return recs;
  }, [surplus, income, expenses, emiRatio, savingsCoverage, dti, expenseRatio, dependents, savings, loans]);

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const healthScore = useMemo(() => {
    return Math.round(
      Math.max(0, Math.min(100,
        50 +
        (surplus > 0 ? 15 : -15) +
        (emiRatio < 30 ? 15 : emiRatio < 50 ? 5 : -10) +
        (savings > existingDebts * 0.3 ? 10 : -5) +
        (loans.filter((l) => Number(l.overdue_months) < 2).length === loans.length ? 10 : -10)
      ))
    );
  }, [surplus, emiRatio, savings, existingDebts, loans]);

  const scoreData = [{
    name: 'Score',
    value: healthScore,
    fill: healthScore >= 60 ? '#22c55e' : healthScore >= 40 ? '#f59e0b' : '#ef4444',
  }];

  const categoryBars = useMemo(() => {
    const counts: Record<string, number> = { savings: 0, debt: 0, income: 0, risk: 0, general: 0 };
    recommendations.forEach((r) => { counts[r.category]++; });
    return [
      { name: 'Savings', value: counts.savings, fill: '#22c55e' },
      { name: 'Debt', value: counts.debt, fill: '#ef4444' },
      { name: 'Income', value: counts.income, fill: '#2563eb' },
      { name: 'Risk', value: counts.risk, fill: '#f59e0b' },
      { name: 'General', value: counts.general, fill: '#06b6d4' },
    ];
  }, [recommendations]);

  const priorityVariant = { high: 'danger', medium: 'warning', low: 'accent' } as const;
  const priorityLabel = { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with score */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-warning-500/15 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-warning-500" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-white">Personalized AI Recommendations</h3>
            <p className="text-xs text-secondary-500">Tailored advice based on your financial profile</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Health score radial */}
          <div className="lg:col-span-1">
            <div className="h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={15} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-secondary-900 dark:text-white">{healthScore}</span>
                <span className="text-xs text-secondary-400">health score</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge variant={healthScore >= 60 ? 'accent' : healthScore >= 40 ? 'warning' : 'danger'}>
                {healthScore >= 75 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention'}
              </Badge>
            </div>
          </div>

          {/* Category distribution */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">Recommendations by Category</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBars} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryBars.map((b, i) => <Cell key={i} fill={b.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Surplus', value: formatINR(surplus), good: surplus >= 0 },
            { label: 'EMI Ratio', value: `${Math.round(emiRatio)}%`, good: emiRatio < 30 },
            { label: 'DTI', value: `${Math.round(dti)}%`, good: dti < 30 },
            { label: 'Savings Cover', value: `${Math.round(savingsCoverage)}%`, good: savingsCoverage >= 50 },
          ].map((m) => (
            <div key={m.label} className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <p className="text-xs text-secondary-500">{m.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${m.good ? 'text-accent-500' : 'text-danger-500'}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {sorted.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`card p-5 border-l-4 ${
              r.priority === 'high' ? 'border-l-danger-500' :
              r.priority === 'medium' ? 'border-l-warning-500' :
              'border-l-accent-500'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                r.priority === 'high' ? 'bg-danger-500/15 text-danger-500' :
                r.priority === 'medium' ? 'bg-warning-500/15 text-warning-500' :
                'bg-accent-500/15 text-accent-500'
              }`}>
                <r.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-secondary-900 dark:text-white">{r.title}</h4>
                  <Badge variant={priorityVariant[r.priority]} size="sm">
                    {priorityLabel[r.priority]}
                  </Badge>
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">{r.description}</p>
                {r.action && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-primary-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{r.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress overview */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Financial Health Breakdown</h3>
        <div className="space-y-4">
          <ProgressBar label="Savings Health" value={Math.min(100, savingsCoverage)} color={savingsCoverage >= 50 ? 'accent' : savingsCoverage >= 20 ? 'warning' : 'danger'} />
          <ProgressBar label="Surplus Margin" value={income > 0 ? Math.max(0, Math.min(100, (surplus / income) * 100)) : 0} color={surplus > 0 ? 'accent' : 'danger'} />
          <ProgressBar label="EMI Burden" value={emiRatio} color={emiRatio > 40 ? 'danger' : emiRatio > 30 ? 'warning' : 'accent'} />
          <ProgressBar label="Debt Leverage" value={Math.min(100, dti)} color={dti > 50 ? 'danger' : dti > 30 ? 'warning' : 'accent'} />
        </div>
      </div>
    </motion.div>
  );
}
