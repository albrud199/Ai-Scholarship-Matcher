import { NextRequest } from 'next/server';
import { streamGemini, getGeminiKey, GeminiMessage } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the ScholarMatch AI Copilot, an expert adviser on international scholarships and graduate admissions.
Rules:
- Be concise, specific, and actionable. Prefer short bullet lists.
- When the user's question involves specific scholarships, profile facts, or application progress, use ONLY the CONTEXT provided below and cite sources inline as [1], [2].
- If the context does not contain the answer, say so honestly and suggest what the student should check or provide.
- Never invent scholarship names, deadlines, or amounts.`;

/**
 * POST /api/chat
 * Body: { messages: { role, content }[], context?: string }
 * Returns a plain-text stream of the assistant reply.
 *
 * The Gemini key stays server-side; the client only ever talks to this route.
 */
export async function POST(req: NextRequest) {
  if (!getGeminiKey()) {
    return Response.json(
      { error: 'AI is not configured. Set GEMINI_API_KEY in the environment.' },
      { status: 503 }
    );
  }

  let body: { messages?: GeminiMessage[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m.role === 'user' || m.role === 'model')
    .slice(-10); // cap context window

  if (history.length === 0) {
    return Response.json({ error: 'No messages provided' }, { status: 400 });
  }

  const context = (body.context ?? '').slice(0, 8000);
  const userPrompt = history[history.length - 1].text;
  const priorTurns = history.slice(0, -1);

  try {
    const stream = streamGemini(
      [
        ...priorTurns,
        {
          role: 'user',
          text: context
            ? `CONTEXT (grounded data from the student's account — cite this as [1], [2]...):\n${context}\n\nQUESTION: ${userPrompt}`
            : userPrompt,
        },
      ],
      SYSTEM_PROMPT
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) controller.enqueue(encoder.encode(chunk));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const status = msg.includes('AI_NOT_CONFIGURED') ? 503 : 502;
    return Response.json({ error: msg }, { status });
  }
}
