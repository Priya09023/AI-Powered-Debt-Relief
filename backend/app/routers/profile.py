from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.auth.jwt_handler import get_current_user
from app.schemas.profile import FinancialProfileCreate, FinancialProfileUpdate, FinancialProfileResponse

router = APIRouter(prefix="/profile", tags=["financial-profile"])


@router.get("/", response_model=FinancialProfileResponse | None)
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()


@router.post("/", response_model=FinancialProfileResponse, status_code=201)
def create_profile(payload: FinancialProfileCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
    profile = FinancialProfile(user_id=user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/", response_model=FinancialProfileResponse)
def update_profile(payload: FinancialProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    for k, v in payload.model_dump().items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/", status_code=204)
def delete_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(profile)
    db.commit()
