import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    employment_type = Column(String, nullable=True)
    dependents = Column(Integer, default=0)
    monthly_income = Column(Float, default=0)
    monthly_expenses = Column(Float, default=0)
    savings = Column(Float, default=0)
    assets = Column(Float, default=0)
    existing_debts = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="financial_profile")
