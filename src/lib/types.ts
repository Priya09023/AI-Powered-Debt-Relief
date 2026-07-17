export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  employment_type: string;
  dependents: number;
  assets: number;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  existing_debts: number;
  created_at?: string;
  updated_at?: string;
}

export interface Loan {
  id: string;
  user_id: string;
  lender: string;
  loan_type: string;
  outstanding_amount: number;
  interest_rate: number;
  emi: number;
  overdue_months: number;
  due_date: string | null;
  priority: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettlementRecord {
  id: string;
  user_id: string;
  loan_id: string | null;
  settlement_percentage: number;
  recommended_amount: number;
  priority: string;
  financial_health: string;
  risk_category: string;
  recommendations: string[];
  created_at?: string;
}

export interface AIHistoryItem {
  id: string;
  user_id: string;
  type: 'letter' | 'prediction' | 'recommendation';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at?: string;
}

export interface SettlementPrediction {
  settlement_percentage: number;
  recommended_amount: number;
  priority: string;
  financial_health: string;
  risk_category: string;
  recommendations: string[];
}
