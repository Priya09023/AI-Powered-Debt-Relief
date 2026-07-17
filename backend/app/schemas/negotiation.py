from pydantic import BaseModel


class NegotiationLetterRequest(BaseModel):
    loan_id: str
    lender_name: str
    borrower_name: str
    loan_type: str
    outstanding_amount: float
    settlement_percentage: float
    recommended_amount: float
    reason: str = "unforeseen financial hardship"
    contact_info: str = ""
    tone: str = "polite"  # polite | firm | formal | concise


class NegotiationLetterResponse(BaseModel):
    letter: str
    source: str  # "gemini" | "fallback"
