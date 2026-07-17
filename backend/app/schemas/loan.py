from datetime import datetime
from pydantic import BaseModel, Field


class LoanBase(BaseModel):
    lender: str = Field(..., min_length=1)
    loan_type: str = Field(..., min_length=1)
    outstanding_amount: float = 0
    interest_rate: float = 0
    emi: float = 0
    overdue_months: int = 0
    due_date: str | None = None
    priority: str = "medium"
    status: str = "active"


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    lender: str | None = None
    loan_type: str | None = None
    outstanding_amount: float | None = None
    interest_rate: float | None = None
    emi: float | None = None
    overdue_months: int | None = None
    due_date: str | None = None
    priority: str | None = None
    status: str | None = None


class LoanResponse(LoanBase):
    id: str
    user_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
