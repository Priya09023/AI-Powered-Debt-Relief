"""
Google Gemini API integration for negotiation letter generation.
Falls back to a local rule-based generator when API key is unavailable.
"""

import httpx
from app.config import get_settings

settings = get_settings()

TONE_INSTRUCTIONS = {
    "polite": "Write in a warm, respectful, and cooperative tone.",
    "firm": "Write in a confident, assertive tone that clearly states expectations.",
    "formal": "Write in formal business correspondence style.",
    "concise": "Keep the letter brief, direct, and to the point.",
}


def _build_fallback_letter(data: dict) -> str:
    return f"""{data['borrower_name']}
{data.get('contact_info', '')}

Date: {__import__('datetime').date.today().strftime('%B %d, %Y')}

To,
The Manager — Loan Recovery Department
{data['lender_name']}

Subject: Request for One-Time Settlement of {data['loan_type']} Loan — Outstanding {data['outstanding_amount']:,.0f}

Respected Sir/Madam,

I, {data['borrower_name']}, am a borrower of a {data['loan_type']} loan from your esteemed institution. The current outstanding amount is {data['outstanding_amount']:,.0f}.

Due to {data['reason']}, I am facing severe financial hardship and am unable to continue regular EMI payments. In good faith, I request a one-time settlement at {data['settlement_percentage']:.0f}% of the outstanding amount, i.e., {data['recommended_amount']:,.0f}.

I am committed to clearing this settlement amount at the earliest upon your approval. Kindly consider my request favorably and provide the settlement terms at your earliest convenience.

Thank you for your understanding.

Yours sincerely,
{data['borrower_name']}
"""


async def generate_negotiation_letter(data: dict) -> dict:
    """
    Generate a negotiation letter via Google Gemini API.
    Returns {"letter": str, "source": "gemini" | "fallback"}.
    """
    if not settings.GEMINI_API_KEY:
        return {"letter": _build_fallback_letter(data), "source": "fallback"}

    tone_instruction = TONE_INSTRUCTIONS.get(data.get("tone", "polite"), TONE_INSTRUCTIONS["polite"])

    prompt = f"""You are a professional financial letter writer. Generate a formal one-time settlement negotiation letter.

Borrower: {data['borrower_name']}
Lender: {data['lender_name']}
Loan Type: {data['loan_type']}
Outstanding Amount: {data['outstanding_amount']:,.0f}
Proposed Settlement Percentage: {data['settlement_percentage']:.0f}%
Recommended Settlement Amount: {data['recommended_amount']:,.0f}
Reason for Settlement: {data['reason']}
Contact Info: {data.get('contact_info', '')}

{tone_instruction}

Include proper letter formatting with date, subject line, formal salutation, body paragraphs explaining the hardship and settlement request, and a formal closing. Do not include placeholder brackets — fill in all details.
"""

    url = f"{settings.GEMINI_ENDPOINT}/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            result = resp.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return {"letter": text.strip(), "source": "gemini"}
    except Exception:
        return {"letter": _build_fallback_letter(data), "source": "fallback"}
