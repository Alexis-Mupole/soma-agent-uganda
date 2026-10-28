import { NextRequest, NextResponse } from 'next/server';
import { TUTOR_SYSTEM_PROMPT, generateText, isGeminiConfigured } from '@/lib/ai/gemini';
import { detectTopic, localTutorReply, TutorMessage } from '@/lib/ai/engine';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 12;

function sanitiseHistory(history: unknown): TutorMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m): m is TutorMessage =>
        Boolean(m) &&
        typeof m === 'object' &&
        (m as TutorMessage).role !== undefined &&
        ((m as TutorMessage).role === 'user' || (m as TutorMessage).role === 'assistant') &&
        typeof (m as TutorMessage).content === 'string' &&
        (m as TutorMessage).content.trim().length > 0
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE) }));
}

export async function GET() {
  return NextResponse.json({
    configured: isGeminiConfigured(),
    tutor: 'Soma',
    fallback: 'offline-tutor',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const context = typeof body.context === 'string' ? body.context.slice(0, 2200) : '';
    const studentName = typeof body.studentName === 'string' ? body.studentName.slice(0, 80) : '';
    const history = sanitiseHistory(body.history);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 413 });
    }

    // Always compute a local reply: it supplies suggestions and acts as a
    // guaranteed fallback if the provider is unavailable.
    const local = localTutorReply({ message, context, studentName, history });

    if (isGeminiConfigured()) {
      const contents = [
        ...history.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: `${message}${
                context ? `\n\n---\nLearner/school context supplied by the app:\n${context}` : ''
              }`,
            },
          ],
        },
      ];

      const result = await generateText({
        contents,
        systemInstruction: TUTOR_SYSTEM_PROMPT,
        temperature: 0.65,
        maxOutputTokens: 1500,
      });

      if (result) {
        return NextResponse.json({
          response: result.text,
          mode: 'gemini',
          model: result.model,
          suggestions: local.suggestions,
          topic: detectTopic(message),
        });
      }
    }

    return NextResponse.json({
      response: local.response,
      mode: 'demo',
      model: 'soma-offline-tutor',
      suggestions: local.suggestions,
      topic: local.topic,
    });
  } catch (error) {
    console.error('[SOMA-AI] chat error:', error);
    // Even on an unexpected error, keep the conversation alive.
    const local = localTutorReply({ message: 'help' });
    return NextResponse.json({
      response: local.response,
      mode: 'demo',
      model: 'soma-offline-tutor',
      suggestions: local.suggestions,
    });
  }
}
