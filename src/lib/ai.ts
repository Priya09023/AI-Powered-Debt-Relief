import type { Loan, Profile, SettlementPrediction } from './types';

/**
 * Local AI settlement prediction engine.
 * Uses a rules-based model with weighted factors to generate a settlement
 * percentage, recommended amount, risk category, and recommendations.
 * In production, this would call a backend service that proxies the Google
 * Gemini API; here we run a deterministic heuristic so the app works offline.
 */

interface PredictionInput {
  loan: Pick<Loan, 'outstanding_amount' | 'interest_rate' | 'emi' | 'overdue_months' | 'loan_type' | 'priority'>;
  profile: Pick<Profile, 'monthly_income' | 'monthly_expenses' | 'savings' | 'existing_debts' | 'employment_type' | 'dependents'>;
}

export function predictSettlement(input: PredictionInput): SettlementPrediction {
  const { loan, profile } = input;
  const income = Number(profile.monthly_income) || 0;
  const expenses = Number(profile.monthly_expenses) || 0;
  const savings = Number(profile.savings) || 0;
  const debts = Number(profile.existing_debts) || 0;
  const outstanding = Number(loan.outstanding_amount) || 0;
  const overdue = Number(loan.overdue_months) || 0;
  const emi = Number(loan.emi) || 0;

  const surplus = income - expenses;
  const dti = income > 0 ? (emi / income) * 100 : 0;
  const debtBurden = income > 0 ? (debts / income) * 100 : 0;

  // Settlement % — higher overdue + lower surplus → bigger discount
  let settlementPct = 100;
  settlementPct -= Math.min(overdue * 3, 30); // overdue penalty
  settlementPct -= surplus < 0 ? 15 : surplus < income * 0.1 ? 10 : 0;
  settlementPct -= dti > 40 ? 10 : dti > 25 ? 5 : 0;
  settlementPct -= debtBurden > 50 ? 10 : 5;
  settlementPct += savings > outstanding * 0.5 ? 5 : 0; // can pay more if savings
  settlementPct = Math.max(35, Math.min(100, Math.round(settlementPct)));

  const recommendedAmount = Math.round((outstanding * settlementPct) / 100);

  // Priority
  let priority = 'Medium';
  if (overdue >= 6 || outstanding > 500000) priority = 'High';
  else if (overdue <= 1 && outstanding < 100000) priority = 'Low';

  // Financial health score 0-100
  const healthScore = Math.round(
    Math.max(0, Math.min(100,
      50 + (surplus > 0 ? 15 : -15) + (dti < 30 ? 15 : -10) + (savings > debts ? 10 : -10) + (overdue < 3 ? 10 : -10)
    ))
  );
  let financialHealth = 'Fair';
  if (healthScore >= 75) financialHealth = 'Excellent';
  else if (healthScore >= 60) financialHealth = 'Good';
  else if (healthScore >= 40) financialHealth = 'Fair';
  else financialHealth = 'Poor';

  // Risk category
  let riskCategory = 'Medium';
  if (dti > 50 || overdue >= 6 || surplus < 0) riskCategory = 'High';
  else if (dti < 20 && overdue <= 1) riskCategory = 'Low';

  // Recommendations
  const recommendations: string[] = [];
  if (surplus < 0) {
    recommendations.push('Your monthly expenses exceed income. Reduce non-essential spending immediately.');
  }
  if (dti > 40) {
    recommendations.push('Debt-to-income ratio is high. Consider consolidating loans or extending tenure.');
  }
  if (overdue >= 3) {
    recommendations.push('Significant overdue months detected. Request a one-time settlement with the lender.');
  }
  if (savings > outstanding * 0.3) {
    recommendations.push('You have sufficient savings to negotiate a lump-sum settlement at a discount.');
  }
  recommendations.push(`Propose a settlement of ${settlementPct}% (₹${recommendedAmount.toLocaleString('en-IN')}) of the outstanding amount.`);
  if (riskCategory === 'High') {
    recommendations.push('High risk profile — engage a credit counselor or legal advisor before signing.');
  } else {
    recommendations.push('Maintain timely EMI payments post-settlement to rebuild your credit score.');
  }

  return {
    settlement_percentage: settlementPct,
    recommended_amount: recommendedAmount,
    priority,
    financial_health: financialHealth,
    risk_category: riskCategory,
    recommendations,
  };
}

/**
 * Generate a negotiation letter. Uses a structured template that adapts to
 * the loan and prediction data. A production deployment would call the
 * Gemini API via an edge function; this local generator produces a
 * professional, editable letter.
 */
export interface LetterInput {
  lenderName: string;
  borrowerName: string;
  loanType: string;
  outstandingAmount: number;
  settlementPercentage: number;
  recommendedAmount: number;
  reason: string;
  contactInfo: string;
}

export function generateNegotiationLetter(input: LetterInput): string {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Subject: Request for One-Time Settlement of ${input.loanType} — Outstanding ₹${input.outstandingAmount.toLocaleString('en-IN')}

Date: ${today}

To,
The Branch Manager,
${input.lenderName},
${input.contactInfo}

Dear Sir/Madam,

I, ${input.borrowerName}, am a customer of your esteemed institution holding a ${input.loanType} with an outstanding principal of ₹${input.outstandingAmount.toLocaleString('en-IN')}. I have been a consistent borrower and value my relationship with your bank.

Due to ${input.reason || 'unforeseen financial hardship caused by a reduction in income and increased household responsibilities'}, I am currently unable to continue regular EMI payments as originally scheduled. I am committed to honoring my obligation and wish to resolve this account amicably through a one-time settlement.

Based on my current financial assessment, I respectfully request you to consider a settlement of ${input.settlementPercentage}% of the outstanding amount — i.e., ₹${input.recommendedAmount.toLocaleString('en-IN')} — as full and final closure of this account. I am in a position to arrange this payment within 15 working days of your approval.

I kindly request the following:
1. Approval of the proposed settlement amount.
2. A formal settlement letter mentioning the agreed amount and payment timeline.
3. Update of my credit records with CIBIL/credit bureaus to reflect "Settled" status post payment.
4. Waiver of penal interest and late-payment charges accrued during the hardship period.

I assure you of my full cooperation and willingness to submit any documentation required to process this request. Please consider this as a formal request under the fair practices code applicable to lending institutions.

Thank you for your time and understanding. I look forward to a positive response.

Yours faithfully,

${input.borrowerName}
Email: ${input.contactInfo}
`;
}
