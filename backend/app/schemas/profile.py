from datetime import datetime
from pydantic import BaseModel


class FinancialProfileBase(BaseModel):
    employment_type: str | None = None
    dependents: int = 0
    monthly_income: float = 0
    monthly_expenses: float = 0
    savings: float = 0
    assets: float = 0
    existing_debts: float = 0


class FinancialProfileCreate(FinancialProfileBase):
    pass


class FinancialProfileUpdate(FinancialProfileBase):
    pass


class FinancialProfileResponse(FinancialProfileBase):
    id: str
    user_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
