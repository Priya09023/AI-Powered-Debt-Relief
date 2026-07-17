import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    loan_id = Column(String, ForeignKey("loans.id", ondelete="SET NULL"), nullable=True)
    settlement_percentage = Column(Float, default=0)
    recommended_amount = Column(Float, default=0)
    priority = Column(String, default="medium")
    financial_health = Column(String, default="fair")
    risk_category = Column(String, default="medium")
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="settlements")
