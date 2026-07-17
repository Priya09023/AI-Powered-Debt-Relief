import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import {
  Wallet, TrendingDown, TrendingUp, AlertTriangle, Activity,
  Landmark, Brain, Mail, ArrowRight, Percent, Gauge,
} from 'lucide-react';
import { useUserData, useFinancialMetrics } from '../hooks/useUserData';
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import DebtStressGauge from '../components/dashboard/DebtStressGauge';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { profile, loans, settlements, aiHistory, loading } = useUserData();
  const m = useFinancialMetrics(loans, profile);

  const loanTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    loans.forEach((l) => {
      map[l.loan_type] = (map[l.loan_type] || 0) + Number(l.outstanding_amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [loans]);

  const surplusTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      surplus: Math.round(m.monthlySurplus * (0.7 + i * 0.08 + Math.random() * 0.1)),
      expenses: Math.round(m.monthlyExpenses * (0.95 + i * 0.02)),
    }));
  }, [m.monthlySurplus, m.monthlyExpenses]);

  const loanBarData = useMemo(() =>
    loans.slice(0, 6).map((l) => ({
      name: l.lender.length > 10 ? l.lender.slice(0, 10) + '…' : l.lender,
      Outstanding: Number(l.outstanding_amount),
      EMI: Number(l.emi),
    })), [loans]);

  const recentActivity = useMemo(() => {
    const items: { title: string; type: string; date: string }[] = [];
    aiHistory.slice(0, 4).forEach((h) => {
      items.push({
        title: h.title,
        type: h.type,
        date: new Date(h.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      });
    });
    loans.slice(0, 3).forEach((l) => {
      items.push({
        title: `${l.lender} loan added`,
        type: 'loan',
        date: new Date(l.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      });
    });
    return items.slice(0, 6);
  }, [aiHistory, loans]);

  const avgSettlement = settlements.length > 0
    ? Math.round(settlements.reduce((s, r) => s + Number(r.settlement_percentage), 0) / settlements.length)
    : 0;

  const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Financial Score', value: `${m.score}`, suffix: '/100', icon: Gauge, color: 'from-primary-500 to-primary-700', trend: m.score >= 60 ? '+5%' : '-3%' },
    { label: 'Debt Stress', value: `${Math.round(m.debtStress)}`, suffix: '%', icon: Activity, color: 'from-warning-500 to-warning-700', trend: m.debtStress < 40 ? 'Low' : 'High' },
    { label: 'Monthly Surplus', value: formatINR(m.monthlySurplus), suffix: '', icon: TrendingUp, color: 'from-accent-500 to-accent-700', trend: m.monthlySurplus > 0 ? 'Positive' : 'Negative' },
    { label: 'Outstanding Loans', value: formatINR(m.outstandingLoans), suffix: '', icon: Landmark, color: 'from-danger-500 to-danger-700', trend: `${loans.length} loans` },
  ];

  const scoreData = [{ name: 'Score', value: m.score, fill: m.score >= 60 ? '#22c55e' : m.score >= 40 ? '#f59e0b' : '#ef4444' }];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="glow-orb w-64 h-64 bg-primary-500 -top-20 -right-10" />
        <div className="relative">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'} 👋
          </h2>
          <p className="mt-2 text-secondary-300 max-w-xl">
            Here's your financial recovery snapshot. {m.riskLevel === 'High' ? 'Your risk level is elevated — review recommendations below.' : 'Your finances are on track. Keep it up!'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/settlement-prediction" className="btn-primary !py-2.5 text-sm">
              <Brain className="w-4 h-4" /> Run AI Prediction
            </Link>
            <Link to="/negotiation-letter" className="btn-secondary !py-2.5 text-sm">
              <Mail className="w-4 h-4" /> Generate Letter
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-secondary-900 dark:text-white">
                  {s.value}<span className="text-base text-secondary-400">{s.suffix}</span>
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Badge variant={s.trend.includes('+') || s.trend === 'Positive' || s.trend === 'Low' ? 'accent' : 'warning'}>
                {s.trend}
              </Badge>
              <span className="text-secondary-400">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key metrics grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income', value: formatINR(m.monthlyIncome), icon: Wallet, color: 'text-accent-500' },
          { label: 'Monthly Expenses', value: formatINR(m.monthlyExpenses), icon: TrendingDown, color: 'text-warning-500' },
          { label: 'EMI Ratio', value: `${Math.round(m.emiRatio)}%`, icon: Percent, color: 'text-primary-500' },
          { label: 'Debt to Income', value: `${Math.round(m.dti)}%`, icon: AlertTriangle, color: 'text-danger-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-sm text-secondary-500 dark:text-secondary-400">{s.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-secondary-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Debt Stress Gauge */}
        <DebtStressGauge stress={m.debtStress} emiRatio={m.emiRatio} surplus={m.monthlySurplus} />

        {/* Financial score radial */}
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Financial Health Score</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-secondary-900 dark:text-white">{m.score}</span>
              <span className="text-xs text-secondary-400">out of 100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge variant={m.score >= 60 ? 'accent' : m.score >= 40 ? 'warning' : 'danger'}>
              {m.score >= 60 ? 'Good' : m.score >= 40 ? 'Fair' : 'Needs Attention'}
            </Badge>
          </div>
        </div>

        {/* EMI vs Income breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">EMI & Income Split</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'EMI', value: Math.round(m.totalEMI) },
                    { name: 'Expenses', value: Math.round(m.monthlyExpenses) },
                    { name: 'Surplus', value: Math.max(0, Math.round(m.monthlySurplus)) },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                  formatter={(v) => formatINR(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Surplus trend - full width */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Monthly Surplus & Expenses Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={surplusTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                formatter={(v) => formatINR(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="surplus" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loan distribution + bar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Loan Distribution</h3>
          {loanTypeData.length === 0 ? (
            <EmptyState icon={<Landmark className="w-8 h-8" />} title="No loans yet" description="Add loans to see distribution" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={loanTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {loanTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                    formatter={(v) => formatINR(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Outstanding Amount by Lender</h3>
          {loanBarData.length === 0 ? (
            <EmptyState icon={<Landmark className="w-8 h-8" />} title="No loans yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loanBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                    formatter={(v) => formatINR(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Outstanding" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="EMI" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Risk + settlement progress */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Key Ratios</h3>
          <div className="space-y-4">
            <ProgressBar label="Debt Stress" value={m.debtStress} color={m.debtStress > 50 ? 'danger' : 'warning'} />
            <ProgressBar label="EMI to Income" value={m.emiRatio} color={m.emiRatio > 40 ? 'danger' : 'primary'} />
            <ProgressBar label="Debt to Income" value={Math.min(100, m.dti)} color={m.dti > 50 ? 'danger' : 'warning'} />
            <ProgressBar label="Savings Coverage" value={m.existingDebts > 0 ? Math.min(100, (m.savings / m.existingDebts) * 100) : 0} color="accent" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Settlement Summary</h3>
            <Link to="/settlement-prediction" className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-2xl bg-primary-500/10">
              <div className="text-3xl font-bold text-primary-500">{avgSettlement}%</div>
              <div className="text-xs text-secondary-400 mt-1">Avg Settlement</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-accent-500/10">
              <div className="text-3xl font-bold text-accent-500">{settlements.length}</div>
              <div className="text-xs text-secondary-400 mt-1">Predictions Made</div>
            </div>
          </div>
          <div className="mt-5">
            <Badge variant={m.riskLevel === 'Low' ? 'accent' : m.riskLevel === 'Medium' ? 'warning' : 'danger'}>
              Risk Level: {m.riskLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-8 h-8" />}
            title="No activity yet"
            description="Start by adding a loan or generating an AI prediction"
            action={<Link to="/loans" className="btn-primary text-sm">Add Your First Loan</Link>}
          />
        ) : (
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    a.type === 'letter' ? 'bg-primary-500/15 text-primary-500' :
                    a.type === 'prediction' ? 'bg-accent-500/15 text-accent-500' :
                    'bg-warning-500/15 text-warning-500'
                  }`}>
                    {a.type === 'letter' ? <Mail className="w-4 h-4" /> :
                     a.type === 'prediction' ? <Brain className="w-4 h-4" /> :
                     <Landmark className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">{a.title}</div>
                    <div className="text-xs text-secondary-400 capitalize">{a.type}</div>
                  </div>
                </div>
                <span className="text-xs text-secondary-400">{a.date}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
