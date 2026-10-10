import { NextRequest } from 'next/server';
import { generateJson, getGeminiKey } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export interface ParsedResume {
  full_name: string;
  nationality: string;
  current_institution: string;
  current_degree: string;
  target_field_of_study: string;
  gpa: number | null;
  gpa_scale: string | null;
  ielts_score: number | null;
  toefl_score: number | null;
  work_experience: Array<{
    title: string;
    organization: string;
    description: string;
    start_date: string;
    end_date?: string;
  }>;
  research_experience: Array<{
    title: string;
    institution: string;
    description: string;
  }>;
  publications: Array<{ title: string; venue: string; year: number }>;
  awards: Array<{ name: string; issuer: string; year: number }>;
  confidence_notes: string[];
}

const SYSTEM = `You are a precise resume/CV parsing engine for a scholarship-matching platform.
Extract structured data from the resume text. Rules:
- Dates: normalize to YYYY-MM (or YYYY if month unknown). Empty string if absent.
- GPA: output both the number and its scale ("4.0","5.0","10.0","percentage"). Null if absent.
- IELTS/TOEFL: extract scores only if explicitly stated.
- Do NOT invent anything. Every field must come from the text.
- confidence_notes: list anything ambiguous or missing that the student should verify.
Return ONLY valid JSON matching the schema.`;

/**
 * POST /api/parse-resume  { text: string }
 * Extracts structured profile fields from raw resume text (client-side extracted
 * from PDF, or pasted directly). Server-side only — key never reaches the client.
 */
export async function POST(req: NextRequest) {
  if (!getGeminiKey()) {
    return Response.json(
      { error: 'AI is not configured. Set GEMINI_API_KEY in the environment.' },
      { status: 503 }
    );
  }

  let text: string;
  try {
    ({ text } = await req.json());
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof text !== 'string' || text.trim().length < 20) {
    return Response.json({ error: 'Provide resume text (at least ~20 chars)' }, { status: 400 });
  }

  try {
    const parsed = await generateJson<ParsedResume>(text.slice(0, 15000), SYSTEM);
    return Response.json({ parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 502 });
  }
}
