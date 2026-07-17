from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.ai_history import AIHistory
from app.auth.jwt_handler import get_current_user
from app.schemas.ai_history import AIHistoryCreate, AIHistoryResponse

router = APIRouter(prefix="/history", tags=["ai-history"])


@router.get("/", response_model=list[AIHistoryResponse])
def list_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(AIHistory).filter(AIHistory.user_id == user.id).order_by(AIHistory.created_at.desc()).all()


@router.post("/", response_model=AIHistoryResponse, status_code=201)
def create_history(payload: AIHistoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    entry = AIHistory(user_id=user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{entry_id}", response_model=AIHistoryResponse)
def get_history(entry_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    entry = db.query(AIHistory).filter(AIHistory.id == entry_id, AIHistory.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_history(entry_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    entry = db.query(AIHistory).filter(AIHistory.id == entry_id, AIHistory.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    db.delete(entry)
    db.commit()
