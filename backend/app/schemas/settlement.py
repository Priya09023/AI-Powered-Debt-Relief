from datetime import datetime
from pydantic import BaseModel


class SettlementPredictionRequest(BaseModel):
    loan_id: str
    employment_type: str | None = None
    dependents: int = 0
    monthly_income: float = 0
    monthly_expenses: float = 0
    savings: float = 0
    assets: float = 0
    existing_debts: float = 0


class SettlementPredictionResponse(BaseModel):
    settlement_percentage: float
    recommended_amount: float
    priority: str
    financial_health: str
    risk_category: str
    recommendations: list[str]


class SettlementRecordResponse(BaseModel):
    id: str
    user_id: str
    loan_id: str | None = None
    settlement_percentage: float
    recommended_amount: float
    priority: str
    financial_health: str
    risk_category: str
    recommendations: list[str]
    created_at: datetime | None = None

    class Config:
        from_attributes = True
