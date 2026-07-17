import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingDown, PiggyBank, Landmark, Briefcase, Users,
  Activity, Gauge, Lightbulb, Save, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useUserData, useFinancialMetrics } from '../hooks/useUserData';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import RecommendationsPanel from '../components/profile/RecommendationsPanel';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const employmentTypes = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Retired', 'Student', 'Other'];

interface FormState {
  full_name: string;
  phone: string;
  employment_type: string;
  dependents: string;
  assets: string;
  monthly_income: string;
  monthly_expenses: string;
  savings: string;
  existing_debts: string;
}

export default function FinancialProfile() {
  const { profile, refreshProfile } = useAuth();
  const { loans, loading } = useUserData();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({
    full_name: '', phone: '', employment_type: 'Salaried', dependents: '0',
    assets: '', monthly_income: '', monthly_expenses: '', savings: '', existing_debts: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        employment_type: profile.employment_type || 'Salaried',
        dependents: String(profile.dependents ?? 0),
        assets: String(profile.assets ?? ''),
        monthly_income: String(profile.monthly_income ?? ''),
        monthly_expenses: String(profile.monthly_expenses ?? ''),
        savings: String(profile.savings ?? ''),
        existing_debts: String(profile.existing_debts ?? ''),
      });
    }
  }, [profile]);

  const m = useFinancialMetrics(loans, profile);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      employment_type: form.employment_type,
      dependents: Number(form.dependents) || 0,
      assets: Number(form.assets) || 0,
      monthly_income: Number(form.monthly_income) || 0,
      monthly_expenses: Number(form.monthly_expenses) || 0,
      savings: Number(form.savings) || 0,
      existing_debts: Number(form.existing_debts) || 0,
    }).eq('id', profile.id);
    setSaving(false);
    if (error) toast(error.message, 'error');
    else {
      toast('Profile updated successfully', 'success');
      refreshProfile();
    }
  };

  const recommendations: { icon: typeof Lightbulb; text: string; variant: 'accent' | 'warning' | 'danger' }[] = [];
  if (m.monthlySurplus < 0) {
    recommendations.push({ icon: AlertTriangle, text: 'Your expenses exceed income. Reduce non-essential spending by at least 15%.', variant: 'danger' });
  }
  if (m.emiRatio > 40) {
    recommendations.push({ icon: AlertTriangle, text: 'EMI ratio is high. Consider loan consolidation or extending tenure.', variant: 'warning' });
  }
  if (m.savings < m.existingDebts * 0.2) {
    recommendations.push({ icon: PiggyBank, text: 'Build an emergency fund covering 3-6 months of expenses.', variant: 'warning' });
  }
  if (m.score >= 60) {
    recommendations.push({ icon: TrendingUp, text: 'Great financial health! Consider investing surplus in mutual funds.', variant: 'accent' });
  }
  recommendations.push({ icon: Lightbulb, text: 'Review your financial profile quarterly to stay on track.', variant: 'accent' });

  if (loading && !profile) {
    return (
      <div className="grid lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Financial Profile</h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Update your financial details to get accurate AI predictions and recommendations.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
        {/* Personal info */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Employment Type</label>
              <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="input-field cursor-pointer">
                {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Dependents</label>
              <input type="number" min="0" value={form.dependents} onChange={(e) => setForm({ ...form, dependents: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Health score */}
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary-500" /> Health Score
          </h3>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-bold gradient-text"
            >
              {m.score}
            </motion.div>
            <p className="text-sm text-secondary-400 mt-1">out of 100</p>
            <div className="mt-4">
              <Badge variant={m.score >= 60 ? 'accent' : m.score >= 40 ? 'warning' : 'danger'}>
                {m.score >= 75 ? 'Excellent' : m.score >= 60 ? 'Good' : m.score >= 40 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <ProgressBar label="Savings" value={m.existingDebts > 0 ? Math.min(100, (m.savings / m.existingDebts) * 100) : 0} color="accent" />
            <ProgressBar label="Surplus" value={m.monthlyIncome > 0 ? Math.max(0, Math.min(100, (m.monthlySurplus / m.monthlyIncome) * 100)) : 0} color="primary" />
          </div>
        </div>

        {/* Income & expenses */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-500" /> Income & Expenses
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Monthly Income (₹)</label>
              <div className="relative">
                <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-500" />
                <input type="number" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} placeholder="50000" className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Monthly Expenses (₹)</label>
              <div className="relative">
                <TrendingDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warning-500" />
                <input type="number" value={form.monthly_expenses} onChange={(e) => setForm({ ...form, monthly_expenses: e.target.value })} placeholder="30000" className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Savings (₹)</label>
              <div className="relative">
                <PiggyBank className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                <input type="number" value={form.savings} onChange={(e) => setForm({ ...form, savings: e.target.value })} placeholder="100000" className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Existing Debts (₹)</label>
              <div className="relative">
                <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-danger-500" />
                <input type="number" value={form.existing_debts} onChange={(e) => setForm({ ...form, existing_debts: e.target.value })} placeholder="200000" className="input-field pl-11" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Total Assets (₹)</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                <input type="number" value={form.assets} onChange={(e) => setForm({ ...form, assets: e.target.value })} placeholder="1500000" className="input-field pl-11" />
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
          </div>
        </div>

        {/* Summary + recommendations */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" /> Quick Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-500">Monthly Surplus</span><span className={`font-semibold ${m.monthlySurplus >= 0 ? 'text-accent-500' : 'text-danger-500'}`}>{formatINR(m.monthlySurplus)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-500">EMI Ratio</span><span className="font-semibold text-secondary-900 dark:text-white">{Math.round(m.emiRatio)}%</span></div>
              <div className="flex justify-between"><span className="text-secondary-500">Debt/Income</span><span className="font-semibold text-secondary-900 dark:text-white">{Math.round(m.dti)}%</span></div>
              <div className="flex justify-between"><span className="text-secondary-500">Risk Level</span><Badge variant={m.riskLevel === 'Low' ? 'accent' : m.riskLevel === 'Medium' ? 'warning' : 'danger'}>{m.riskLevel}</Badge></div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning-500" /> AI Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5"
                >
                  <div className={`p-1.5 rounded-lg ${r.variant === 'accent' ? 'bg-accent-500/10 text-accent-500' : r.variant === 'warning' ? 'bg-warning-500/10 text-warning-500' : 'bg-danger-500/10 text-danger-500'}`}>
                    <r.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Enhanced Personalized Recommendations */}
      {profile && <RecommendationsPanel profile={profile} loans={loans} />}
    </div>
  );
}
