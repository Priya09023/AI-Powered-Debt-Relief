from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse
from app.schemas.profile import (
    FinancialProfileCreate, FinancialProfileUpdate, FinancialProfileResponse,
)
from app.schemas.settlement import (
    SettlementPredictionRequest, SettlementPredictionResponse,
    SettlementRecordResponse,
)
from app.schemas.negotiation import (
    NegotiationLetterRequest, NegotiationLetterResponse,
)
from app.schemas.ai_history import AIHistoryCreate, AIHistoryResponse
