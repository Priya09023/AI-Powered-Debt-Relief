import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Loan, Profile, SettlementRecord, AIHistoryItem } from '../lib/types';

export function useUserData() {
  const { user, profile, refreshProfile } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [loansRes, settlementsRes, historyRes] = await Promise.all([
      supabase.from('loans').select('*').order('created_at', { ascending: false }),
      supabase.from('settlement_records').select('*').order('created_at', { ascending: false }),
      supabase.from('ai_history').select('*').order('created_at', { ascending: false }),
    ]);

    if (loansRes.data) setLoans(loansRes.data as Loan[]);
    if (settlementsRes.data) setSettlements(settlementsRes.data as SettlementRecord[]);
    if (historyRes.data) setAiHistory(historyRes.data as AIHistoryItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    profile,
    loans,
    settlements,
    aiHistory,
    loading,
    refresh: fetchAll,
    refreshProfile,
    setLoans,
    setSettlements,
    setAiHistory,
  };
}

export function useFinancialMetrics(loans: Loan[], profile: Profile | null) {
  const monthlyIncome = Number(profile?.monthly_income) || 0;
  const monthlyExpenses = Number(profile?.monthly_expenses) || 0;
  const savings = Number(profile?.savings) || 0;
  const existingDebts = Number(profile?.existing_debts) || 0;
  const assets = Number(profile?.assets) || 0;

  const outstandingLoans = loans.reduce((sum, l) => sum + Number(l.outstanding_amount), 0);
  const totalEMI = loans.reduce((sum, l) => sum + Number(l.emi), 0);
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const emiRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;
  const dti = monthlyIncome > 0 ? (outstandingLoans / (monthlyIncome * 12)) * 100 : 0;
  const debtStress = monthlyIncome > 0 ? Math.min(100, (totalEMI / monthlyIncome) * 100) : 0;

  // Financial health score 0-100
  const score = Math.round(
    Math.max(0, Math.min(100,
      50 +
      (monthlySurplus > 0 ? 15 : -15) +
      (emiRatio < 30 ? 15 : emiRatio < 50 ? 5 : -10) +
      (savings > existingDebts * 0.3 ? 10 : -5) +
      (loans.filter((l) => Number(l.overdue_months) < 2).length === loans.length ? 10 : -10)
    ))
  );

  let riskLevel = 'Low';
  if (emiRatio > 50 || monthlySurplus < 0) riskLevel = 'High';
  else if (emiRatio > 30) riskLevel = 'Medium';

  return {
    monthlyIncome,
    monthlyExpenses,
    savings,
    existingDebts,
    assets,
    outstandingLoans,
    totalEMI,
    monthlySurplus,
    emiRatio,
    dti,
    debtStress,
    score,
    riskLevel,
  };
}
