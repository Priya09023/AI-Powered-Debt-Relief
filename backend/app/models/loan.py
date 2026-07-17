import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lender = Column(String, nullable=False)
    loan_type = Column(String, nullable=False)
    outstanding_amount = Column(Float, default=0)
    interest_rate = Column(Float, default=0)
    emi = Column(Float, default=0)
    overdue_months = Column(Integer, default=0)
    due_date = Column(String, nullable=True)
    priority = Column(String, default="medium")
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="loans")
