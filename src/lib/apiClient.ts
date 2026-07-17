import api, { setApiToken, clearApiToken } from './api';
import type {
  ApiToken, ApiUser,
  ApiLoan, ApiLoanCreate, ApiLoanUpdate,
  ApiFinancialProfile, ApiFinancialProfileInput,
  ApiSettlementPrediction, ApiSettlementRecord,
  ApiNegotiationLetter,
  ApiAIHistoryItem,
} from './apiTypes';

// --- Auth ---
export const authApi = {
  register: async (email: string, password: string, full_name: string): Promise<ApiToken> => {
    const { data } = await api.post<ApiToken>('/auth/register', { email, password, full_name });
    setApiToken(data.access_token);
    return data;
  },
  login: async (email: string, password: string): Promise<ApiToken> => {
    const { data } = await api.post<ApiToken>('/auth/login', { email, password });
    setApiToken(data.access_token);
    return data;
  },
  me: async (): Promise<ApiUser> => {
    const { data } = await api.get<ApiUser>('/auth/me');
    return data;
  },
  logout: () => clearApiToken(),
};

// --- Loans ---
export const loansApi = {
  list: async (): Promise<ApiLoan[]> => {
    const { data } = await api.get<ApiLoan[]>('/loans/');
    return data;
  },
  get: async (id: string): Promise<ApiLoan> => {
    const { data } = await api.get<ApiLoan>(`/loans/${id}`);
    return data;
  },
  create: async (payload: ApiLoanCreate): Promise<ApiLoan> => {
    const { data } = await api.post<ApiLoan>('/loans/', payload);
    return data;
  },
  update: async (id: string, payload: ApiLoanUpdate): Promise<ApiLoan> => {
    const { data } = await api.put<ApiLoan>(`/loans/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/loans/${id}`);
  },
};

// --- Financial Profile ---
export const profileApi = {
  get: async (): Promise<ApiFinancialProfile | null> => {
    const { data } = await api.get<ApiFinancialProfile | null>('/profile/');
    return data;
  },
  create: async (payload: ApiFinancialProfileInput): Promise<ApiFinancialProfile> => {
    const { data } = await api.post<ApiFinancialProfile>('/profile/', payload);
    return data;
  },
  update: async (payload: ApiFinancialProfileInput): Promise<ApiFinancialProfile> => {
    const { data } = await api.put<ApiFinancialProfile>('/profile/', payload);
    return data;
  },
  delete: async (): Promise<void> => {
    await api.delete('/profile/');
  },
};

// --- Settlement ---
export const settlementApi = {
  predict: async (loanId: string): Promise<ApiSettlementPrediction> => {
    const { data } = await api.post<ApiSettlementPrediction>('/settlement/predict', { loan_id: loanId });
    return data;
  },
  listRecords: async (): Promise<ApiSettlementRecord[]> => {
    const { data } = await api.get<ApiSettlementRecord[]>('/settlement/records');
    return data;
  },
  getRecord: async (id: string): Promise<ApiSettlementRecord> => {
    const { data } = await api.get<ApiSettlementRecord>(`/settlement/records/${id}`);
    return data;
  },
  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/settlement/records/${id}`);
  },
};

// --- Negotiation ---
export const negotiationApi = {
  generate: async (payload: {
    loan_id: string;
    lender_name: string;
    borrower_name: string;
    loan_type: string;
    outstanding_amount: number;
    settlement_percentage?: number;
    recommended_amount?: number;
    reason?: string;
    contact_info?: string;
    tone?: string;
  }): Promise<ApiNegotiationLetter> => {
    const { data } = await api.post<ApiNegotiationLetter>('/negotiation/generate', payload);
    return data;
  },
};

// --- AI History ---
export const historyApi = {
  list: async (): Promise<ApiAIHistoryItem[]> => {
    const { data } = await api.get<ApiAIHistoryItem[]>('/history/');
    return data;
  },
  get: async (id: string): Promise<ApiAIHistoryItem> => {
    const { data } = await api.get<ApiAIHistoryItem>(`/history/${id}`);
    return data;
  },
  create: async (payload: { type: string; title: string; content: string; metadata?: Record<string, unknown> }): Promise<ApiAIHistoryItem> => {
    const { data } = await api.post<ApiAIHistoryItem>('/history/', payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/history/${id}`);
  },
};
