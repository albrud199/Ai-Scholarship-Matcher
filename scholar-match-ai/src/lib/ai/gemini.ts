/**
 * Server-side AI helper.
 *
 * Calls the Gemini API directly via REST so no SDK dependency is needed.
 * The API key NEVER leaves the server: this module is only imported from
 * API routes, never from client components.
 */

const GEMINI_MODEL = 'gemini-3.8-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-flash-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * POST to a Gemini endpoint with retry on transient 503 ("high demand") errors.
 * Tries the primary model twice, then falls back to the alias model.
 */
async function geminiFetch(
  endpoint: (model: string) => string,
  body: unknown
): Promise<Response> {
  const key = getGeminiKey();
  if (!key) throw new Error('AI_NOT_CONFIGURED');
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': key };
  const attempts: string[] = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_MODEL, GEMINI_FALLBACK_MODEL];

  let lastError = 'unknown error';
  for (let i = 0; i < attempts.length; i++) {
    const res = await fetch(endpoint(attempts[i]), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok || (res.status !== 503 && res.status !== 429)) return res;
    lastError = `HTTP ${res.status}`;
    if (i < attempts.length - 1) await new Promise((r) => setTimeout(r, 700 * Math.pow(2, i)));
  }
  throw new Error(`GEMINI_OVERLOADED: ${lastError}`);
}

export function getGeminiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key ? key : null;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

/** Streaming text generation. Yields plain text deltas. */
export async function* streamGemini(
  messages: GeminiMessage[],
  systemPrompt: string,
  maxTokens = 1024
): AsyncGenerator<string> {
  const res = await geminiFetch(
    (model) => `${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
    }
  );

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GEMINI_ERROR_${res.status}: ${detail.slice(0, 300)}`);
  }

  // Parse the SSE stream: lines of "data: {json}".
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const text: string | undefined = json.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? '')
          .join('');
        if (text) yield text;
      } catch {
        // skip malformed chunk
      }
    }
  }
}

/** One-shot (non-streaming) JSON generation with automatic code-fence cleanup. */
export async function generateJson<T>(
  prompt: string,
  systemPrompt: string,
  maxTokens = 2048
): Promise<T> {
  const res = await geminiFetch(
    (model) => `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GEMINI_ERROR_${res.status}: ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  return JSON.parse(cleaned) as T;
}
