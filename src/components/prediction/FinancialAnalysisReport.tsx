import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Cell,
} from 'recharts';
import {
  FileText, TrendingDown, AlertTriangle, ShieldCheck, Gauge,
  IndianRupee, Calendar, CheckCircle2, Brain,
} from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import type { Loan, Profile, SettlementPrediction } from '../../lib/types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface FinancialAnalysisReportProps {
  loan: Loan;
  profile: Profile;
  prediction: SettlementPrediction;
}

export default function FinancialAnalysisReport({ loan, profile, prediction }: FinancialAnalysisReportProps) {
  const outstanding = Number(loan.outstanding_amount);
  const emi = Number(loan.emi);
  const income = Number(profile.monthly_income);
  const expenses = Number(profile.monthly_expenses);
  const savings = Number(profile.savings);
  const overdue = Number(loan.overdue_months);

  const surplus = income - expenses;
  const dti = income > 0 ? (outstanding / (income * 12)) * 100 : 0;
  const emiRatio = income > 0 ? (emi / income) * 100 : 0;
  const savingsCoverage = outstanding > 0 ? (savings / outstanding) * 100 : 0;

  const radarData = useMemo(() => [
    { factor: 'Repayment', value: Math.max(0, 100 - emiRatio) },
    { factor: 'Savings', value: Math.min(100, savingsCoverage) },
    { factor: 'Stability', value: surplus > 0 ? 80 : 30 },
    { factor: 'Discipline', value: Math.max(0, 100 - overdue * 10) },
    { factor: 'Liquidity', value: savings > expenses * 3 ? 90 : 40 },
    { factor: 'Risk', value: Math.max(0, 100 - dti) },
  ], [emiRatio, savingsCoverage, surplus, overdue, dti]);

  const emiProjection = useMemo(() => {
    const months = ['Now', '+3m', '+6m', '+9m', '+12m'];
    return months.map((m, i) => ({
      month: m,
      outstanding: Math.max(0, Math.round(outstanding - emi * i * 3)),
      recommended: Math.round((outstanding * prediction.settlement_percentage) / 100),
    }));
  }, [outstanding, emi, prediction.settlement_percentage]);

  const factorBars = useMemo(() => [
    { name: 'Outstanding', value: outstanding, fill: '#2563eb' },
    { name: 'Recommended', value: prediction.recommended_amount, fill: '#22c55e' },
    { name: 'Savings', value: savings, fill: '#f59e0b' },
    { name: 'Annual Income', value: income * 12, fill: '#06b6d4' },
  ], [outstanding, prediction.recommended_amount, savings, income]);

  const riskFactors = [
    { label: 'EMI to Income', value: Math.round(emiRatio), max: 100, danger: emiRatio > 40, warn: emiRatio > 25 },
    { label: 'Debt to Income', value: Math.round(dti), max: 100, danger: dti > 50, warn: dti > 30 },
    { label: 'Overdue Severity', value: Math.min(100, overdue * 10), max: 100, danger: overdue > 3, warn: overdue > 0 },
    { label: 'Savings Coverage', value: Math.min(100, savingsCoverage), max: 100, danger: savingsCoverage < 20, warn: savingsCoverage < 50, invert: true },
  ];

  const summaryStats = [
    { icon: IndianRupee, label: 'Outstanding', value: formatINR(outstanding), color: 'text-primary-500' },
    { icon: TrendingDown, label: 'Settlement', value: `${prediction.settlement_percentage}%`, color: 'text-accent-500' },
    { icon: Gauge, label: 'Health', value: prediction.financial_health, color: 'text-primary-500' },
    { icon: ShieldCheck, label: 'Risk', value: prediction.risk_category, color: prediction.risk_category === 'High' ? 'text-danger-500' : prediction.risk_category === 'Medium' ? 'text-warning-500' : 'text-accent-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-6"
    >
      <div className="flex items-center gap-2 pb-4 border-b border-secondary-200 dark:border-secondary-800">
        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary-900 dark:text-white">Financial Analysis Report</h3>
          <p className="text-xs text-secondary-500">Comprehensive breakdown of your settlement prediction</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40"
          >
            <div className="flex items-center gap-1.5 text-xs text-secondary-500 mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} /> {s.label}
            </div>
            <p className="text-sm font-bold text-secondary-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Radar + projection */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary-500" /> Financial Strength Profile
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#94a3b833" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" /> 12-Month Projection
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emiProjection}>
                <defs>
                  <linearGradient id="outstandingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recommendedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                  formatter={(v) => formatINR(Number(v))}
                />
                <Area type="monotone" dataKey="outstanding" stroke="#2563eb" strokeWidth={2} fill="url(#outstandingGrad)" />
                <Area type="monotone" dataKey="recommended" stroke="#22c55e" strokeWidth={2} fill="url(#recommendedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison bar */}
      <div>
        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-primary-500" /> Amount Comparison
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factorBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                formatter={(v) => formatINR(Number(v))}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {factorBars.map((b, i) => <Cell key={i} fill={b.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk factors */}
      <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/40 space-y-4">
        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-500" /> Risk Factor Analysis
        </h4>
        {riskFactors.map((r) => (
          <ProgressBar
            key={r.label}
            label={r.label}
            value={r.value}
            color={r.danger ? 'danger' : r.warn ? 'warning' : 'accent'}
          />
        ))}
      </div>

      {/* Verdict */}
      <div className="p-4 rounded-2xl border-l-4 border-l-primary-500 bg-primary-500/5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white">AI Verdict</h4>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">
              Based on the analysis of your {loan.loan_type.toLowerCase()} from {loan.lender},
              we recommend settling at <span className="font-semibold text-accent-500">{prediction.settlement_percentage}%</span> of the
              outstanding amount ({formatINR(prediction.recommended_amount)}). Your financial health is rated
              as <span className="font-semibold text-primary-500">{prediction.financial_health}</span> with a
              {' '}<span className="font-semibold text-secondary-900 dark:text-white">{prediction.risk_category.toLowerCase()} risk</span> profile.
              Priority for this settlement is <span className="font-semibold text-secondary-900 dark:text-white">{prediction.priority}</span>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
