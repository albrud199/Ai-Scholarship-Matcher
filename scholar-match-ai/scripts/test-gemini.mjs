/* Live Gemini smoke test — plain Node ESM, no TS runtime needed. */
import { readFileSync } from 'node:fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
  }
} catch { }

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY missing');
  process.exit(1);
}
const model = 'gemini-3.8-flash';
const base = 'https://generativelanguage.googleapis.com/v1beta';
const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': key };

// 1. Non-streaming
const res = await fetch(`${base}/models/${model}:generateContent`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: SCHOLARMATCH_OK' }] }],
    generationConfig: { maxOutputTokens: 100 },
  }),
});
if (!res.ok) {
  console.error(`generateContent failed ${res.status}:`, await res.text());
  process.exit(1);
}
const data = await res.json();
const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
console.log('1. generateContent:', text.trim());

// 2. Streaming
const sres = await fetch(`${base}/models/${model}:streamGenerateContent?alt=sse`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Count 1 to 5, digits only.' }] }],
    generationConfig: { maxOutputTokens: 100 },
  }),
});
if (!sres.ok || !sres.body) {
  console.error(`stream failed ${sres.status}:`, sres.body ? '' : 'no body');
  process.exit(1);
}
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
      const t = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
      if (t) streamed += t;
    } catch { }
  }
}
console.log('2. streamGenerateContent:', streamed.replace(/\s+/g, ' ').trim());

const pass = text.includes('SCHOLARMATCH_OK') && streamed.includes('1') && streamed.includes('5');
console.log(pass ? 'ALL CHECKS PASSED' : 'CHECKS FAILED');
process.exit(pass ? 0 : 1);
