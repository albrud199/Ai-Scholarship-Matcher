import { NextRequest } from 'next/server';
import { generateJson, getGeminiKey } from '@/lib/ai/gemini';
import { Profile, Scholarship } from '@/types';
import { evaluateRequirements, MATCH_WEIGHTS } from '@/lib/matching';

export const runtime = 'nodejs';
export const maxDuration = 60;

export interface AiMatchInsight {
  narrative: string;
  key_strengths: string[];
  key_gaps: string[];
  action_items: string[];
}

/**
 * POST /api/match-insight  { scholarship: Scholarship }
 *
 * Hybrid pattern: the deterministic engine (src/lib/matching.ts) computes the
 * score in code; Gemini only narrates the result. The AI cannot change the
 * number — it explains the factor breakdown the engine produced.
 */
export async function POST(req: NextRequest) {
  if (!getGeminiKey()) {
    return Response.json(
      { error: 'AI is not configured. Set GEMINI_API_KEY in the environment.' },
      { status: 503 }
    );
  }

  let body: { profile?: Profile; scholarship?: Scholarship };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { profile, scholarship } = body;
  if (!profile || !scholarship) {
    return Response.json({ error: 'profile and scholarship are required' }, { status: 400 });
  }

  // Deterministic facts first — the AI only sees the outcome, never scores it.
  const evals = evaluateRequirements(profile, scholarship);
  const facts = {
    scholarship: { name: scholarship.name, provider: scholarship.provider, country: scholarship.country },
    hard_requirements: evals.map((e) => ({
      field: e.requirement.field,
      required: e.requirement.value,
      passed: e.passed,
      actual: e.actual,
      hard: e.requirement.is_hard_requirement,
    })),
    profile: {
      gpa: profile.gpa,
      scale: profile.gpa_scale,
      ielts: profile.ielts_score,
      toefl: profile.toefl_score,
      work_years: profile.work_experience.length,
      research_items: profile.research_experience.length + profile.publications.length,
      leadership_roles: profile.leadership_experience.length,
    },
    weights: MATCH_WEIGHTS,
  };

  const SYSTEM = `You are a scholarship strategy adviser. You receive deterministic facts computed by a scoring engine.
You MUST NOT invent eligibility rules, deadlines, or scores. Base every statement on the facts provided.
Return ONLY valid JSON: {"narrative": string (2-4 sentences, honest and specific), "key_strengths": string[2-4], "key_gaps": string[2-4], "action_items": string[2-4]}. Action items must be concrete next steps.`;

  try {
    const insight = await generateJson<AiMatchInsight>(
      JSON.stringify(facts),
      SYSTEM,
      1200
    );
    return Response.json({ insight });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 502 });
  }
}
