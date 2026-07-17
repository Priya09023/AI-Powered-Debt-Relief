import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import Badge from '../ui/Badge';

interface DebtStressGaugeProps {
  stress: number; // 0-100
  emiRatio: number;
  surplus: number;
}

export default function DebtStressGauge({ stress, emiRatio, surplus }: DebtStressGaugeProps) {
  const level = stress > 70 ? 'High' : stress > 40 ? 'Moderate' : 'Low';
  const variant = stress > 70 ? 'danger' : stress > 40 ? 'warning' : 'accent';
  const fill = stress > 70 ? '#ef4444' : stress > 40 ? '#f59e0b' : '#22c55e';

  const data = [{ name: 'Stress', value: stress, fill }];

  const tips = stress > 70
    ? 'Critical: Reduce EMI burden via consolidation or restructuring.'
    : stress > 40
    ? 'Moderate: Monitor expenses and avoid new debt.'
    : 'Healthy: Maintain your current repayment discipline.';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-warning-500" /> Debt Stress Level
        </h3>
        <Badge variant={variant}>{level}</Badge>
      </div>

      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-secondary-900 dark:text-white"
          >
            {Math.round(stress)}%
          </motion.span>
          <span className="text-xs text-secondary-400 mt-1">stress index</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary-500" /> EMI Ratio
          </div>
          <p className="text-lg font-bold text-secondary-900 dark:text-white">{Math.round(emiRatio)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-accent-500" /> Surplus
          </div>
          <p className="text-lg font-bold text-secondary-900 dark:text-white">
            {surplus >= 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(surplus)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-secondary-500 dark:text-secondary-400 leading-relaxed">{tips}</p>
    </div>
  );
}
