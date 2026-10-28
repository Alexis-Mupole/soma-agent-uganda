import { NextRequest, NextResponse } from 'next/server';
import { generateText, isGeminiConfigured } from '@/lib/ai/gemini';
import { localQuiz, normaliseQuestions } from '@/lib/ai/quiz';

export const runtime = 'nodejs';
export const maxDuration = 30;

const QUIZ_SYSTEM_PROMPT = `You are an experienced Ugandan O-Level examiner writing short mastery checks aligned to the NCDC syllabus.

Return ONLY valid JSON with this exact shape:
{
  "questions": [
    {
      "question": "text of the question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "one or two sentences explaining why the answer is correct"
    }
  ]
}

Rules:
- Exactly 4 options per question and exactly one correct answer.
- correctIndex is zero-based (0-3).
- Questions must be answerable from the supplied lesson material and must not require outside facts.
- Mix recall and application; avoid trick questions and "all of the above".
- Keep each question under 160 characters, options under 60 characters.
- Use clear, simple English suitable for Senior 1–4.
- No markdown, no commentary outside the JSON object.`;

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const topic = typeof body.topic === 'string' && body.topic.trim() ? body.topic.trim().slice(0, 160) : 'General Science';
    const resourceContent =
      typeof body.resourceContent === 'string' ? body.resourceContent.slice(0, 6000) : '';
    const count = Math.max(2, Math.min(5, Number(body.count) || 3));

    if (isGeminiConfigured()) {
      const prompt = `Create ${count} questions about "${topic}"${
        resourceContent ? ` based strictly on these lesson notes:\n\n${resourceContent}` : ''
      }`;

      const result = await generateText({
        contents: prompt,
        systemInstruction: QUIZ_SYSTEM_PROMPT,
        temperature: 0.55,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json',
      });

      if (result) {
        const parsed = normaliseQuestions(extractJson(result.text), count);
        if (parsed) {
          return NextResponse.json({
            topic,
            questions: parsed,
            mode: 'gemini',
            model: result.model,
          });
        }
        console.warn('[SOMA-AI] quiz JSON could not be normalised — using offline bank');
      }
    }

    return NextResponse.json({
      topic,
      questions: localQuiz(topic, resourceContent, count),
      mode: 'demo',
      model: 'soma-offline-quiz',
    });
  } catch (error) {
    console.error('[SOMA-AI] quiz error:', error);
    return NextResponse.json({
      topic: 'General Science',
      questions: localQuiz('General Science', '', 3),
      mode: 'demo',
      model: 'soma-offline-quiz',
    });
  }
}
