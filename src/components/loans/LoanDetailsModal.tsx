import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Landmark, Calendar, Percent, Wallet, AlertTriangle, Shield,
  TrendingUp, FileText, Clock, IndianRupee,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import type { Loan } from '../../lib/types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface LoanDetailsModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanDetailsModal({ loan, isOpen, onClose }: LoanDetailsModalProps) {
  const outstanding = Number(loan?.outstanding_amount) || 0;
  const emi = Number(loan?.emi) || 0;
  const interestRate = Number(loan?.interest_rate) || 0;
  const overdueMonths = Number(loan?.overdue_months) || 0;

  const totalPayable = useMemo(() => {
    if (interestRate <= 0 || outstanding <= 0) return outstanding;
    // simple interest projection for remaining tenure (approx)
    const tenureMonths = emi > 0 ? Math.ceil(outstanding / emi) : 12;
    const monthlyRate = interestRate / 100 / 12;
    const total = outstanding * (1 + monthlyRate * tenureMonths);
    return Math.round(total);
  }, [outstanding, emi, interestRate]);

  const totalInterest = Math.max(0, totalPayable - outstanding);

  const stressScore = useMemo(() => {
    let s = 30;
    s += Math.min(overdueMonths * 8, 50);
    s += interestRate > 15 ? 10 : 0;
    s += loan?.priority === 'High' ? 10 : loan?.priority === 'Medium' ? 5 : 0;
    return Math.min(100, Math.round(s));
  }, [overdueMonths, interestRate, loan?.priority]);

  const stressData = [{
    name: 'Stress',
    value: stressScore,
    fill: stressScore > 70 ? '#ef4444' : stressScore > 45 ? '#f59e0b' : '#22c55e',
  }];

  const breakdownData = [
    { name: 'Principal', value: outstanding, fill: '#2563eb' },
    { name: 'Interest', value: totalInterest, fill: '#f59e0b' },
  ];

  if (!loan) return null;

  const details = [
    { icon: Landmark, label: 'Lender', value: loan.lender },
    { icon: FileText, label: 'Loan Type', value: loan.loan_type },
    { icon: IndianRupee, label: 'Outstanding Amount', value: formatINR(outstanding) },
    { icon: Wallet, label: 'Monthly EMI', value: formatINR(emi) },
    { icon: Percent, label: 'Interest Rate', value: `${interestRate}% p.a.` },
    { icon: Clock, label: 'Overdue Months', value: overdueMonths > 0 ? `${overdueMonths} months` : 'On time' },
    { icon: Calendar, label: 'Due Date', value: loan.due_date ? new Date(loan.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
    { icon: Shield, label: 'Priority', value: loan.priority },
    { icon: TrendingUp, label: 'Status', value: loan.status },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loan Details" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{loan.lender}</h3>
              <p className="text-sm text-secondary-300">{loan.loan_type}</p>
            </div>
          </div>
          <div className="relative sm:ml-auto flex gap-2">
            <Badge variant={loan.priority === 'High' ? 'danger' : loan.priority === 'Medium' ? 'warning' : 'accent'}>
              {loan.priority} Priority
            </Badge>
            <Badge variant={loan.status === 'Active' ? 'primary' : loan.status === 'Settled' ? 'accent' : 'neutral'}>
              {loan.status}
            </Badge>
          </div>
        </div>

        {/* Charts */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" /> Loan Stress Index
            </h4>
            <div className="h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={stressData} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-secondary-900 dark:text-white">{stressScore}</span>
                <span className="text-xs text-secondary-400">/ 100</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge variant={stressScore > 70 ? 'danger' : stressScore > 45 ? 'warning' : 'accent'}>
                {stressScore > 70 ? 'High Stress' : stressScore > 45 ? 'Moderate Stress' : 'Low Stress'}
              </Badge>
            </div>
          </div>

          <div className="card p-5">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary-500" /> Payment Breakdown
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {breakdownData.map((_, i) => (
                      <Cell key={i} fill={breakdownData[i].fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-secondary-500">
                  <span className="w-2 h-2 rounded-full bg-primary-500" /> Principal
                </span>
                <span className="font-semibold text-secondary-900 dark:text-white">{formatINR(outstanding)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-secondary-500">
                  <span className="w-2 h-2 rounded-full bg-warning-500" /> Interest
                </span>
                <span className="font-semibold text-secondary-900 dark:text-white">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-secondary-200 dark:border-secondary-700">
                <span className="text-secondary-500">Total Payable</span>
                <span className="font-bold text-primary-500">{formatINR(totalPayable)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {details.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40"
            >
              <div className="flex items-center gap-2 text-xs text-secondary-500 mb-1">
                <d.icon className="w-3.5 h-3.5" />
                {d.label}
              </div>
              <p className="text-sm font-semibold text-secondary-900 dark:text-white">{d.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="card p-5 space-y-4">
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-white">Loan Health Indicators</h4>
          <ProgressBar
            label="Outstanding vs EMI ratio"
            value={emi > 0 ? Math.min(100, (emi / outstanding) * 100 * 12) : 0}
            color={emi > 0 && (emi / outstanding) * 100 * 12 > 30 ? 'danger' : 'primary'}
          />
          <ProgressBar
            label="Overdue severity"
            value={Math.min(100, overdueMonths * 10)}
            color={overdueMonths > 3 ? 'danger' : overdueMonths > 0 ? 'warning' : 'accent'}
          />
          <ProgressBar
            label="Interest burden"
            value={Math.min(100, interestRate * 5)}
            color={interestRate > 15 ? 'danger' : interestRate > 10 ? 'warning' : 'accent'}
          />
        </div>
      </div>
    </Modal>
  );
}
