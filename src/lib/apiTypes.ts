export interface ApiUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ApiToken {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiLoan {
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

export interface ApiLoanCreate {
  lender: string;
  loan_type: string;
  outstanding_amount: number;
  interest_rate: number;
  emi: number;
  overdue_months: number;
  due_date?: string | null;
  priority?: string;
  status?: string;
}

export interface ApiLoanUpdate {
  lender?: string;
  loan_type?: string;
  outstanding_amount?: number;
  interest_rate?: number;
  emi?: number;
  overdue_months?: number;
  due_date?: string | null;
  priority?: string;
  status?: string;
}

export interface ApiFinancialProfile {
  id: string;
  user_id: string;
  employment_type: string | null;
  dependents: number;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  assets: number;
  existing_debts: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiFinancialProfileInput {
  employment_type?: string;
  dependents?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  savings?: number;
  assets?: number;
  existing_debts?: number;
}

export interface ApiSettlementPrediction {
  settlement_percentage: number;
  recommended_amount: number;
  priority: string;
  financial_health: string;
  risk_category: string;
  recommendations: string[];
}

export interface ApiSettlementRecord extends ApiSettlementPrediction {
  id: string;
  user_id: string;
  loan_id: string | null;
  created_at?: string;
}

export interface ApiNegotiationLetter {
  letter: string;
  source: 'gemini' | 'fallback';
}

export interface ApiAIHistoryItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at?: string;
}
