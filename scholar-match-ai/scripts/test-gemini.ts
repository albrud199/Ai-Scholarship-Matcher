/* Live end-to-end test of the Gemini integration (run: npx tsx scripts/test-gemini.ts) */
import { readFileSync } from 'node:fs';

// Minimal .env loader (no dotenv dependency needed)
try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
  }
} catch {}

async function main() {
  const key = process.env.GEMINI_API_KEY!;
  if (!key) throw new Error('GEMINI_API_KEY missing');

  const model = 'gemini-3.8-flash';
  const base = 'https://generativelanguage.googleapis.com/v1beta';

  // 1. Non-streaming generateContent
  const res = await fetch(`${base}/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: SCHOLARMATCH_OK' }] }],
      generationConfig: { maxOutputTokens: 100 },
    }),
  });
  if (!res.ok) throw new Error(`generateContent failed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('1. generateContent:', text?.trim());

  // 2. Streaming
  const sres = await fetch(
    `${base}/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Count 1 to 5, digits only.' }] }],
        generationConfig: { maxOutputTokens: 100 },
      }),
    }
  );
  if (!sres.ok || !sres.body) throw new Error(`stream failed ${sres.status}: ${await sres.text()}`);
  const reader = sres.body.getReader();
  const decoder = new TextDecoder();
  let streamed = '';
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      try {
        const j = JSON.parse(line.slice(5).trim());
        const t = j.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) streamed += t;
      } catch {}
    }
  }
  console.log('2. streamGenerateContent:', streamed.replace(/\s+/g, ' ').trim());

  const pass = text?.includes('SCHOLARMATCH_OK') && streamed.includes('1') && streamed.includes('5');
  console.log(pass ? 'ALL CHECKS PASSED' : 'CHECKS FAILED');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
