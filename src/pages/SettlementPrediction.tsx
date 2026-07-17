import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, TrendingDown, Gauge, Lightbulb,
  Save, Target, ShieldAlert, CheckCircle2, Landmark,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { predictSettlement } from '../lib/ai';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import FinancialAnalysisReport from '../components/prediction/FinancialAnalysisReport';
import type { SettlementPrediction } from '../lib/types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function SettlementPrediction() {
  const { loans, settlements, refresh } = useUserData();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<SettlementPrediction | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId),
    [loans, selectedLoanId],
  );

  const handlePredict = async () => {
    if (!selectedLoan || !profile) {
      toast('Select a loan and complete your profile first', 'error');
      return;
    }
    setPredicting(true);
    setResult(null);
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 1200));
    const prediction = predictSettlement({ loan: selectedLoan, profile });
    setResult(prediction);
    setPredicting(false);
    toast('AI prediction generated', 'success');
  };

  const handleSave = async () => {
    if (!result || !selectedLoan) return;
    setSaving(true);
    const { error } = await supabase.from('settlement_records').insert({
      loan_id: selectedLoan.id,
      settlement_percentage: result.settlement_percentage,
      recommended_amount: result.recommended_amount,
      priority: result.priority,
      financial_health: result.financial_health,
      risk_category: result.risk_category,
      recommendations: result.recommendations,
    });
    // Also save to AI history
    if (!error) {
      await supabase.from('ai_history').insert({
        type: 'prediction',
        title: `Settlement Prediction - ${selectedLoan.lender}`,
        content: `Settlement: ${result.settlement_percentage}%, Recommended: ${formatINR(result.recommended_amount)}, Risk: ${result.risk_category}`,
        metadata: { loan_id: selectedLoan.id, ...result },
      });
    }
    setSaving(false);
    if (error) toast(error.message, 'error');
    else { toast('Prediction saved to history', 'success'); refresh(); }
  };

  const scoreData = result ? [{
    name: 'Settlement',
    value: result.settlement_percentage,
    fill: result.settlement_percentage < 60 ? '#22c55e' : result.settlement_percentage < 80 ? '#f59e0b' : '#ef4444',
  }] : [];

  const factorData = result && selectedLoan ? [
    { name: 'Outstanding', value: Number(selectedLoan.outstanding_amount), fill: '#2563eb' },
    { name: 'Recommended', value: result.recommended_amount, fill: '#22c55e' },
    { name: 'Savings', value: Number(selectedLoan.outstanding_amount) - result.recommended_amount, fill: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary-500" /> AI Settlement Prediction
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Our AI engine analyzes your loan and financial profile to predict the optimal settlement outcome.
        </p>
      </div>

      {/* Loan selector */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" /> Select a Loan to Analyze
        </h3>
        {loans.length === 0 ? (
          <EmptyState
            icon={<Landmark className="w-8 h-8" />}
            title="No loans available"
            description="Add a loan first to run the AI settlement prediction."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loans.map((l) => (
              <motion.button
                key={l.id}
                onClick={() => setSelectedLoanId(l.id)}
                whileHover={{ y: -2 }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedLoanId === l.id
                    ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/30'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-secondary-900 dark:text-white">{l.lender}</span>
                  <Badge variant={l.priority === 'High' ? 'danger' : l.priority === 'Medium' ? 'warning' : 'accent'}>{l.priority}</Badge>
                </div>
                <div className="text-xs text-secondary-500">{l.loan_type}</div>
                <div className="mt-2 text-lg font-bold text-secondary-900 dark:text-white">{formatINR(Number(l.outstanding_amount))}</div>
                <div className="text-xs text-secondary-400 mt-1">EMI {formatINR(Number(l.emi))} · {l.overdue_months} mo overdue</div>
              </motion.button>
            ))}
          </div>
        )}
        {loans.length > 0 && (
          <div className="mt-5 flex justify-center">
            <button onClick={handlePredict} disabled={!selectedLoan || predicting} className="btn-primary disabled:opacity-50">
              {predicting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Run AI Prediction
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Prediction result */}
      <AnimatePresence>
        {predicting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-10 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto rounded-full border-4 border-primary-500/20 border-t-primary-500"
            />
            <p className="mt-4 text-secondary-500">AI is analyzing your financial data...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && !predicting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top result cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Settlement %', value: `${result.settlement_percentage}%`, icon: TrendingDown, color: 'from-accent-500 to-accent-700' },
                { label: 'Recommended Amount', value: formatINR(result.recommended_amount), icon: Target, color: 'from-primary-500 to-primary-700' },
                { label: 'Priority', value: result.priority, icon: ShieldAlert, color: result.priority === 'High' ? 'from-danger-500 to-danger-700' : result.priority === 'Medium' ? 'from-warning-500 to-warning-700' : 'from-accent-500 to-accent-700' },
                { label: 'Financial Health', value: result.financial_health, icon: Gauge, color: 'from-primary-500 to-primary-700' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="stat-card"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-secondary-500">{s.label}</p>
                  <p className="text-xl font-bold text-secondary-900 dark:text-white mt-1">{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Radial settlement */}
              <div className="card p-6">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Settlement Percentage</h3>
                <div className="h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="60%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                      <RadialBar background dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-secondary-900 dark:text-white">{result.settlement_percentage}%</span>
                    <span className="text-xs text-secondary-400">of outstanding</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge variant={result.risk_category === 'Low' ? 'accent' : result.risk_category === 'Medium' ? 'warning' : 'danger'}>
                    {result.risk_category} Risk
                  </Badge>
                </div>
              </div>

              {/* Comparison bar */}
              <div className="card p-6 lg:col-span-2">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Amount Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={factorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#fff' }}
                        formatter={(v) => formatINR(Number(v))}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {factorData.map((_, i) => <Cell key={i} fill={factorData[i].fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Financial Analysis Report */}
            {selectedLoan && profile && (
              <FinancialAnalysisReport loan={selectedLoan} profile={profile} prediction={result} />
            )}

            {/* Recommendations */}
            <div className="card p-6">
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning-500" /> AI Recommendations
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.recommendations.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{r}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setResult(null)} className="btn-ghost">Clear</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Prediction</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past predictions */}
      {settlements.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Past Predictions</h3>
          <div className="space-y-3">
            {settlements.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">Settlement {s.settlement_percentage}%</div>
                    <div className="text-xs text-secondary-400">{formatINR(Number(s.recommended_amount))} · {s.risk_category} risk</div>
                  </div>
                </div>
                <span className="text-xs text-secondary-400">
                  {new Date(s.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
