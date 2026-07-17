from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.models.ai_history import AIHistory
from app.auth.jwt_handler import get_current_user
from app.services.settlement_service import predict_settlement
from app.services.gemini_service import generate_negotiation_letter
from app.schemas.negotiation import NegotiationLetterRequest, NegotiationLetterResponse

router = APIRouter(prefix="/negotiation", tags=["negotiation"])


@router.post("/generate", response_model=NegotiationLetterResponse)
async def generate_letter(
    payload: NegotiationLetterRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.id == payload.loan_id, Loan.user_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    from app.models.financial_profile import FinancialProfile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()

    prediction = predict_settlement(loan, profile)

    letter_data = {
        "borrower_name": payload.borrower_name,
        "lender_name": payload.lender_name,
        "loan_type": payload.loan_type,
        "outstanding_amount": payload.outstanding_amount,
        "settlement_percentage": payload.settlement_percentage or prediction["settlement_percentage"],
        "recommended_amount": payload.recommended_amount or prediction["recommended_amount"],
        "reason": payload.reason,
        "contact_info": payload.contact_info,
        "tone": payload.tone,
    }

    result = await generate_negotiation_letter(letter_data)

    ai_entry = AIHistory(
        user_id=user.id,
        type="letter",
        title=f"Negotiation Letter - {payload.lender_name}",
        content=result["letter"],
        metadata={"loan_id": loan.id, "source": result["source"], "tone": payload.tone},
    )
    db.add(ai_entry)
    db.commit()

    return NegotiationLetterResponse(letter=result["letter"], source=result["source"])
