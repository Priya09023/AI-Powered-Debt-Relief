import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Mail, Phone, Camera, Save, Briefcase, Users,
  Wallet, PiggyBank, Landmark, TrendingUp, TrendingDown, Calendar,
  Activity, Gauge, FileDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useUserData, useFinancialMetrics } from '../hooks/useUserData';
import { useToast } from '../context/ToastContext';
import { exportFullReport } from '../lib/exportReport';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { loans, settlements, aiHistory } = useUserData();
  const m = useFinancialMetrics(loans, profile);
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    employment_type: profile?.employment_type || '',
    dependents: profile?.dependents || 0,
    monthly_income: profile?.monthly_income || 0,
    monthly_expenses: profile?.monthly_expenses || 0,
    savings: profile?.savings || 0,
    assets: profile?.assets || 0,
    existing_debts: profile?.existing_debts || 0,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      employment_type: form.employment_type,
      dependents: Number(form.dependents),
      monthly_income: Number(form.monthly_income),
      monthly_expenses: Number(form.monthly_expenses),
      savings: Number(form.savings),
      assets: Number(form.assets),
      existing_debts: Number(form.existing_debts),
    }).eq('id', profile.id);
    setSaving(false);
    if (error) toast(error.message, 'error');
    else {
      toast('Profile updated successfully', 'success');
      setEditing(false);
      refreshProfile();
    }
  };

  const stats = [
    { label: 'Total Loans', value: loans.length, icon: Landmark, color: 'from-primary-500 to-primary-700' },
    { label: 'AI Predictions', value: settlements.length, icon: Activity, color: 'from-accent-500 to-accent-700' },
    { label: 'AI History', value: aiHistory.length, icon: TrendingUp, color: 'from-warning-500 to-warning-700' },
    { label: 'Health Score', value: `${m.score}/100`, icon: Gauge, color: 'from-primary-400 to-primary-600' },
  ];

  const financialDetails = [
    { label: 'Monthly Income', value: formatINR(m.monthlyIncome), icon: Wallet, color: 'text-accent-500' },
    { label: 'Monthly Expenses', value: formatINR(m.monthlyExpenses), icon: TrendingDown, color: 'text-warning-500' },
    { label: 'Savings', value: formatINR(m.savings), icon: PiggyBank, color: 'text-primary-500' },
    { label: 'Assets', value: formatINR(m.assets), icon: Landmark, color: 'text-primary-400' },
    { label: 'Existing Debts', value: formatINR(m.existingDebts), icon: TrendingDown, color: 'text-danger-500' },
    { label: 'Outstanding Loans', value: formatINR(m.outstandingLoans), icon: Landmark, color: 'text-danger-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-primary-500" /> Profile
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          View and manage your personal and financial information.
        </p>
      </div>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-600 text-white shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
              {profile?.full_name || 'User'}
            </h3>
            <div className="mt-2 flex flex-col sm:flex-row gap-3 items-center sm:items-start justify-center sm:justify-start">
              <span className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                <Mail className="w-4 h-4" /> {user?.email}
              </span>
              {profile?.phone && (
                <span className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge variant="primary">Free Plan</Badge>
              <Badge variant={m.riskLevel === 'Low' ? 'accent' : m.riskLevel === 'Medium' ? 'warning' : 'danger'}>
                Risk: {m.riskLevel}
              </Badge>
              <Badge variant="neutral">
                <Calendar className="w-3 h-3" /> Joined {new Date(profile?.created_at || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => {
              exportFullReport({ profile, loans, settlements, aiHistory });
              toast('Full report exported to PDF', 'success');
            }}
            className="btn-secondary text-sm shrink-0"
          >
            <FileDown className="w-4 h-4" /> Export Report
          </button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Financial overview */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Financial Overview</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialDetails.map((d) => (
            <div key={d.label} className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <div className="flex items-center gap-2 mb-2">
                <d.icon className={`w-4 h-4 ${d.color}`} />
                <span className="text-xs text-secondary-500 dark:text-secondary-400">{d.label}</span>
              </div>
              <p className="text-lg font-bold text-secondary-900 dark:text-white">{d.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          <ProgressBar label="Debt Stress" value={m.debtStress} color={m.debtStress > 50 ? 'danger' : 'warning'} />
          <ProgressBar label="EMI to Income Ratio" value={m.emiRatio} color={m.emiRatio > 40 ? 'danger' : 'primary'} />
          <ProgressBar label="Debt to Income" value={Math.min(100, m.dti)} color={m.dti > 50 ? 'danger' : 'warning'} />
          <ProgressBar label="Savings Coverage" value={m.existingDebts > 0 ? Math.min(100, (m.savings / m.existingDebts) * 100) : 0} color="accent" />
        </div>
      </div>

      {/* Editable profile form */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-secondary-900 dark:text-white">Edit Profile</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost text-sm">
              <UserIcon className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Employment Type</label>
                <select
                  value={form.employment_type}
                  onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                  className="input-field cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Dependents</label>
                <input
                  type="number"
                  min={0}
                  value={form.dependents}
                  onChange={(e) => setForm({ ...form, dependents: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Monthly Income</label>
                <input
                  type="number"
                  min={0}
                  value={form.monthly_income}
                  onChange={(e) => setForm({ ...form, monthly_income: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Monthly Expenses</label>
                <input
                  type="number"
                  min={0}
                  value={form.monthly_expenses}
                  onChange={(e) => setForm({ ...form, monthly_expenses: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Savings</label>
                <input
                  type="number"
                  min={0}
                  value={form.savings}
                  onChange={(e) => setForm({ ...form, savings: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Assets</label>
                <input
                  type="number"
                  min={0}
                  value={form.assets}
                  onChange={(e) => setForm({ ...form, assets: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Existing Debts</label>
                <input
                  type="number"
                  min={0}
                  value={form.existing_debts}
                  onChange={(e) => setForm({ ...form, existing_debts: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <Briefcase className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-secondary-500">Employment</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white capitalize">{profile?.employment_type || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <Users className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-secondary-500">Dependents</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{profile?.dependents ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <Wallet className="w-5 h-5 text-accent-500" />
              <div>
                <p className="text-xs text-secondary-500">Monthly Income</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{formatINR(m.monthlyIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <TrendingDown className="w-5 h-5 text-warning-500" />
              <div>
                <p className="text-xs text-secondary-500">Monthly Expenses</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{formatINR(m.monthlyExpenses)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <PiggyBank className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-secondary-500">Savings</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{formatINR(m.savings)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
              <Landmark className="w-5 h-5 text-danger-500" />
              <div>
                <p className="text-xs text-secondary-500">Existing Debts</p>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{formatINR(m.existingDebts)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
