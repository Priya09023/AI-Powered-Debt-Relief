import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LetterRequest {
  lenderName: string;
  borrowerName: string;
  loanType: string;
  outstandingAmount: number;
  settlementPercentage: number;
  recommendedAmount: number;
  reason: string;
  contactInfo: string;
  tone: "polite" | "firm" | "formal" | "concise";
}

const toneInstructions: Record<string, string> = {
  polite: "Use a warm, respectful, and cooperative tone throughout the letter.",
  firm: "Use a confident, assertive tone while remaining professional and respectful.",
  formal: "Use a highly formal, business-appropriate tone with proper letter structure.",
  concise: "Keep the letter brief and to the point, avoiding unnecessary elaboration.",
};

function buildPrompt(input: LetterRequest): string {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `You are a financial correspondence expert. Write a professional debt settlement negotiation letter with the following details:

- Borrower Name: ${input.borrowerName}
- Lender: ${input.lenderName}
- Loan Type: ${input.loanType}
- Outstanding Amount: ₹${input.outstandingAmount.toLocaleString("en-IN")}
- Proposed Settlement Percentage: ${input.settlementPercentage}%
- Recommended Settlement Amount: ₹${input.recommendedAmount.toLocaleString("en-IN")}
- Reason for Settlement: ${input.reason || "unforeseen financial hardship caused by a reduction in income and increased household responsibilities"}
- Contact Information: ${input.contactInfo || "borrower@email.com"}
- Date: ${today}

${toneInstructions[input.tone] || toneInstructions.polite}

The letter must include:
1. A clear subject line referencing the loan type and settlement request.
2. A formal salutation to the Branch Manager.
3. An opening paragraph stating the borrower's relationship with the lender.
4. A paragraph explaining the financial hardship reason.
5. A clear settlement proposal stating the percentage and recommended amount.
6. A request list including: approval of settlement, formal settlement letter, credit bureau update, waiver of penal charges.
7. A commitment to pay within 15 working days of approval.
8. A professional closing with the borrower's name and contact info.

Output ONLY the letter text, no preamble or explanation.`;
}

function fallbackLetter(input: LetterRequest): string {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `Subject: Request for One-Time Settlement of ${input.loanType} — Outstanding ₹${input.outstandingAmount.toLocaleString("en-IN")}

Date: ${today}

To,
The Branch Manager,
${input.lenderName},
${input.contactInfo}

Dear Sir/Madam,

I, ${input.borrowerName}, am a customer of your esteemed institution holding a ${input.loanType} with an outstanding principal of ₹${input.outstandingAmount.toLocaleString("en-IN")}. I have been a consistent borrower and value my relationship with your bank.

Due to ${input.reason || "unforeseen financial hardship caused by a reduction in income and increased household responsibilities"}, I am currently unable to continue regular EMI payments as originally scheduled. I am committed to honoring my obligation and wish to resolve this account amicably through a one-time settlement.

Based on my current financial assessment, I respectfully request you to consider a settlement of ${input.settlementPercentage}% of the outstanding amount — i.e., ₹${input.recommendedAmount.toLocaleString("en-IN")} — as full and final closure of this account. I am in a position to arrange this payment within 15 working days of your approval.

I kindly request the following:
1. Approval of the proposed settlement amount.
2. A formal settlement letter mentioning the agreed amount and payment timeline.
3. Update of my credit records with CIBIL/credit bureaus to reflect "Settled" status post payment.
4. Waiver of penal interest and late-payment charges accrued during the hardship period.

I assure you of my full cooperation and willingness to submit any documentation required to process this request. Please consider this as a formal request under the fair practices code applicable to lending institutions.

Thank you for your time and understanding. I look forward to a positive response.

Yours faithfully,

${input.borrowerName}
Email: ${input.contactInfo}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const input = await req.json() as LetterRequest;

    if (!input.lenderName || !input.borrowerName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: lenderName, borrowerName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      // No API key configured — use fallback generator
      return new Response(
        JSON.stringify({ letter: fallbackLetter(input), source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = buildPrompt(input);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      // Fall back to local generator on API error
      return new Response(
        JSON.stringify({ letter: fallbackLetter(input), source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiResponse.json();
    const letter = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!letter) {
      return new Response(
        JSON.stringify({ letter: fallbackLetter(input), source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ letter: letter.trim(), source: "gemini" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
