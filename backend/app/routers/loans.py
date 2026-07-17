from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.auth.jwt_handler import get_current_user
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse

router = APIRouter(prefix="/loans", tags=["loans"])


@router.get("/", response_model=list[LoanResponse])
def list_loans(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Loan).filter(Loan.user_id == user.id).order_by(Loan.created_at.desc()).all()


@router.post("/", response_model=LoanResponse, status_code=201)
def create_loan(payload: LoanCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loan = Loan(user_id=user.id, **payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan


@router.put("/{loan_id}", response_model=LoanResponse)
def update_loan(loan_id: str, payload: LoanUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(loan, k, v)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}", status_code=204)
def delete_loan(loan_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
