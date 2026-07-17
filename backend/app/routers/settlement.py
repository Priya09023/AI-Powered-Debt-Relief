from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement import SettlementRecord
from app.auth.jwt_handler import get_current_user
from app.services.settlement_service import predict_settlement
from app.schemas.settlement import SettlementPredictionRequest, SettlementPredictionResponse, SettlementRecordResponse

router = APIRouter(prefix="/settlement", tags=["settlement"])


@router.post("/predict", response_model=SettlementPredictionResponse)
def predict(
    payload: SettlementPredictionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.id == payload.loan_id, Loan.user_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()

    result = predict_settlement(loan, profile)

    record = SettlementRecord(
        user_id=user.id,
        loan_id=loan.id,
        settlement_percentage=result["settlement_percentage"],
        recommended_amount=result["recommended_amount"],
        priority=result["priority"],
        financial_health=result["financial_health"],
        risk_category=result["risk_category"],
        recommendations=result["recommendations"],
    )
    db.add(record)

    from app.models.ai_history import AIHistory
    ai_entry = AIHistory(
        user_id=user.id,
        type="prediction",
        title=f"Settlement Prediction - {loan.lender}",
        content=(
            f"Settlement: {result['settlement_percentage']}% | "
            f"Recommended: {result['recommended_amount']:,.0f} | "
            f"Priority: {result['priority']} | Risk: {result['risk_category']}"
        ),
        metadata={"loan_id": loan.id, "recommendations": result["recommendations"]},
    )
    db.add(ai_entry)
    db.commit()

    return SettlementPredictionResponse(**result)


@router.get("/records", response_model=list[SettlementRecordResponse])
def list_records(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(SettlementRecord).filter(SettlementRecord.user_id == user.id).order_by(SettlementRecord.created_at.desc()).all()


@router.get("/records/{record_id}", response_model=SettlementRecordResponse)
def get_record(record_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = db.query(SettlementRecord).filter(SettlementRecord.id == record_id, SettlementRecord.user_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/records/{record_id}", status_code=204)
def delete_record(record_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = db.query(SettlementRecord).filter(SettlementRecord.id == record_id, SettlementRecord.user_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
