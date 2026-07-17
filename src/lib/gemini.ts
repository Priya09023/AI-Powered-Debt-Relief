/**
 * Google Gemini API integration layer.
 *
 * In production, calls to the Gemini API are proxied through a Supabase Edge
 * Function to keep the API key server-side. The edge function is deployed at
 * `supabase/functions/gemini-generate/index.ts`.
 *
 * If the edge function is unavailable (e.g. local dev without the secret
 * configured), we fall back to the local heuristic generators in `ai.ts`
 * so the app remains fully functional.
 */

export type LetterTone = 'polite' | 'firm' | 'formal' | 'concise';

export interface GeminiLetterRequest {
  lenderName: string;
  borrowerName: string;
  loanType: string;
  outstandingAmount: number;
  settlementPercentage: number;
  recommendedAmount: number;
  reason: string;
  contactInfo: string;
  tone: LetterTone;
}

export interface GeminiLetterResponse {
  letter: string;
  source: 'gemini' | 'fallback';
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-generate`;

export async function generateLetterViaGemini(
  input: GeminiLetterRequest,
): Promise<GeminiLetterResponse> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Gemini service returned ${response.status}`);
    }

    const data = await response.json();
    if (!data?.letter || typeof data.letter !== 'string') {
      throw new Error('Invalid response from Gemini service');
    }

    return { letter: data.letter, source: data.source ?? 'gemini' };
  } catch {
    // Fallback to local generator if the edge function is unavailable
    const { generateNegotiationLetter } = await import('./ai');
    const letter = generateNegotiationLetter({
      lenderName: input.lenderName,
      borrowerName: input.borrowerName,
      loanType: input.loanType,
      outstandingAmount: input.outstandingAmount,
      settlementPercentage: input.settlementPercentage,
      recommendedAmount: input.recommendedAmount,
      reason: input.reason,
      contactInfo: input.contactInfo,
    });
    return { letter, source: 'fallback' };
  }
}
