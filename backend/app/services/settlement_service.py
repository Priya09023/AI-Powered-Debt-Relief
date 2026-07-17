"""
Rule-based settlement prediction engine.
Mimics the frontend predictSettlement logic with deterministic scoring.
"""

from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile


def predict_settlement(
    loan: Loan,
    profile: FinancialProfile | None,
) -> dict:
    monthly_income = float(profile.monthly_income) if profile and profile.monthly_income else 0
    monthly_expenses = float(profile.monthly_expenses) if profile and profile.monthly_expenses else 0
    savings = float(profile.savings) if profile and profile.savings else 0
    existing_debts = float(profile.existing_debts) if profile and profile.existing_debts else 0
    assets = float(profile.assets) if profile and profile.assets else 0
    dependents = int(profile.dependents) if profile and profile.dependents else 0

    outstanding = float(loan.outstanding_amount)
    emi = float(loan.emi)
    overdue = int(loan.overdue_months)
    interest_rate = float(loan.interest_rate)

    monthly_surplus = monthly_income - monthly_expenses
    emi_ratio = (emi / monthly_income * 100) if monthly_income > 0 else 100
    dti = (outstanding / (monthly_income * 12) * 100) if monthly_income > 0 else 100

    # Settlement percentage: lower means better deal for borrower
    # Base 40%, worsens with overdue & high debt metrics, improves with savings/assets
    base = 40
    overdue_penalty = min(overdue * 3, 30)
    emi_penalty = min(int(emi_ratio) // 5, 15)
    dti_penalty = min(int(dti) // 10, 10)
    savings_bonus = min(int(savings / max(outstanding, 1) * 20), 15)
    asset_bonus = min(int(assets / max(outstanding, 1) * 10), 10)
    dependents_penalty = min(dependents * 2, 8)

    settlement_percentage = max(
        25,
        min(
            85,
            base + overdue_penalty + emi_penalty + dti_penalty + dependents_penalty - savings_bonus - asset_bonus,
        ),
    )

    recommended_amount = round(outstanding * (settlement_percentage / 100), 2)

    # Priority
    if overdue > 6 or emi_ratio > 50:
        priority = "critical"
    elif overdue > 3 or emi_ratio > 35:
        priority = "high"
    elif overdue > 0 or emi_ratio > 20:
        priority = "medium"
    else:
        priority = "low"

    # Financial health
    score = 50
    score += 15 if monthly_surplus > 0 else -15
    score += 15 if emi_ratio < 30 else (5 if emi_ratio < 50 else -10)
    score += 10 if savings > existing_debts * 0.3 else -5
    score += 10 if overdue < 2 else -10
    score = max(0, min(100, score))

    if score >= 70:
        financial_health = "excellent"
    elif score >= 55:
        financial_health = "good"
    elif score >= 40:
        financial_health = "fair"
    else:
        financial_health = "poor"

    # Risk
    if emi_ratio > 50 or monthly_surplus < 0:
        risk_category = "high"
    elif emi_ratio > 30:
        risk_category = "medium"
    else:
        risk_category = "low"

    # Recommendations
    recommendations: list[str] = []
    if emi_ratio > 40:
        recommendations.append("Your EMI-to-income ratio is critically high. Request an extended tenure or lower EMI.")
    if overdue > 3:
        recommendations.append("Significant overdue months detected. Prioritize this loan for immediate settlement.")
    if savings > outstanding * 0.3:
        recommendations.append("You have sufficient savings to negotiate a strong settlement. Offer a lump-sum payment.")
    if dti > 50:
        recommendations.append("Debt-to-income ratio is high. Consider consolidating multiple loans.")
    if dependents > 2:
        recommendations.append("Multiple dependents increase financial risk. Request a structured payment plan.")
    if interest_rate > 15:
        recommendations.append("High interest rate detected. Negotiate for a rate reduction as part of settlement.")
    if monthly_surplus < 0:
        recommendations.append("Negative monthly surplus. Request a moratorium until cash flow improves.")
    if not recommendations:
        recommendations.append("Your financial profile is healthy. Negotiate from a position of strength for the best settlement terms.")

    return {
        "settlement_percentage": round(settlement_percentage, 1),
        "recommended_amount": recommended_amount,
        "priority": priority,
        "financial_health": financial_health,
        "risk_category": risk_category,
        "recommendations": recommendations,
    }
