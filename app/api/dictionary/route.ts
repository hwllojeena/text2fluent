import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// It will gracefully fail later if the key is missing.
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { word, context, languageId } = await request.json();

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    // Map language ID to a readable language name
    const langMap: Record<string, string> = {
      en: 'English',
      zh: 'Mandarin Chinese',
      es: 'Spanish',
      it: 'Italian',
      de: 'German'
    };
    const langName = langMap[languageId] || languageId;

    // If Gemini is not configured, fallback to a simple error informing the user/developer
    if (!genAI) {
      return NextResponse.json({ 
        definition: null,
        error: "GEMINI_API_KEY is not configured",
        needsFallback: true 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct a prompt that asks for a context-aware definition
    const prompt = `
You are a highly intelligent and precise dictionary assistant for language learners.
The user is learning ${langName}. They clicked on the word "${word}" within the following sentence:
"${context}"

Provide a concise, accurate English definition for the word "${word}" AS IT IS USED in that specific sentence context. Do not provide a list of all possible meanings. Just the one meaning that fits the context perfectly.

If the word is a part of a larger fixed phrase or idiom in that sentence, define the phrase/idiom.
Keep your answer to ONLY the definition (1-2 sentences maximum). Do not include any conversational filler like "The definition is...".
    `.trim();

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return NextResponse.json({ definition: responseText });

  } catch (error) {
    console.error("Gemini dictionary error:", error);
    return NextResponse.json({ 
      definition: null, 
      error: "Failed to fetch definition from AI",
      needsFallback: true 
    }, { status: 500 });
  }
}
