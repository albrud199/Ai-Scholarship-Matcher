import { Profile, Scholarship, MatchScore, MatchFactor, ScholarshipRequirement } from '@/types';

/**
 * Deterministic match engine.
 *
 * The score is ALWAYS computed by code from structured requirements and profile
 * facts — never by an LLM. Weights are versioned and tunable:
 *   Academics 30% | Experience 20% | Research 15% | Language 10% | Fit 15% | Readiness 10%
 */
export const MATCH_WEIGHTS = {
  academics: 0.3,
  experience: 0.2,
  research: 0.15,
  language: 0.1,
  scholarship_fit: 0.15,
  readiness: 0.1,
} as const;

/** Normalize a GPA from any common scale onto a 4.0 scale. */
export function normalizeGpa(profile: Profile): number | null {
  if (profile.gpa == null) return null;
  const scale = (profile.gpa_scale || '4.0').trim();
  if (scale === '4.0') return profile.gpa;
  if (scale === '5.0') return (profile.gpa / 5) * 4;
  if (scale === '10.0') return (profile.gpa / 10) * 4;
  if (scale === 'percentage') return (profile.gpa / 100) * 4;
  return profile.gpa;
}

function monthDuration(start: string, end?: string): number {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return Math.max(0, (e - s) / (1000 * 60 * 60 * 24 * 30.44));
}

/** Total professional work experience in years (sum of durations). */
export function getWorkExperienceYears(profile: Profile): number {
  const months =
    profile.work_experience.reduce((acc, w) => acc + monthDuration(w.start_date, w.end_date), 0) +
    profile.leadership_experience.reduce((acc, l) => acc + monthDuration(l.start_date, l.end_date), 0);
  return Math.round((months / 12) * 10) / 10;
}

export function requirementLabel(req: ScholarshipRequirement): string {
  const v = Array.isArray(req.value) ? req.value.join(', ') : String(req.value);
  const ops: Record<string, string> = {
    eq: 'exactly',
    gte: 'at least',
    lte: 'at most',
    contains: 'including',
    in: 'one of',
    not_in: 'not one of',
  };
  const op = ops[req.operator] || req.operator;
  return `${req.field.replace(/_/g, ' ')}: ${op} ${v}`;
}

function meetsNumeric(actual: number | null, operator: string, threshold: number): boolean {
  if (actual == null) return false;
  switch (operator) {
    case 'gte':
      return actual >= threshold;
    case 'lte':
      return actual <= threshold;
    case 'eq':
      return actual === threshold;
    default:
      return false;
  }
}

function evaluateRequirement(
  profile: Profile,
  req: ScholarshipRequirement
): { passed: boolean; actual: string | null } {
  const op = req.operator;
  const value = req.value;

  switch (req.field) {
    case 'gpa': {
      const gpa = normalizeGpa(profile);
      const passed = meetsNumeric(gpa, op, Number(value));
      return { passed, actual: gpa != null ? `${gpa.toFixed(2)}/4.0 normalized` : 'not provided' };
    }
    case 'degree_level': {
      const allowed = Array.isArray(value) ? value : [value];
      const passed = allowed.includes(profile.target_degree_level);
      return { passed, actual: profile.target_degree_level };
    }
    case 'ielts': {
      const score = profile.ielts_score ?? null;
      return { passed: meetsNumeric(score, op, Number(value)), actual: score != null ? `IELTS ${score}` : 'not provided' };
    }
    case 'toefl': {
      const score = profile.toefl_score ?? null;
      return { passed: meetsNumeric(score, op, Number(value)), actual: score != null ? `TOEFL ${score}` : 'not provided' };
    }
    case 'work_experience_years': {
      const years = getWorkExperienceYears(profile);
      return { passed: meetsNumeric(years, op, Number(value)), actual: `${years} years` };
    }
    case 'research': {
      const count = profile.research_experience.length + profile.publications.length;
      return { passed: meetsNumeric(count, op, Number(value)), actual: `${count} research items` };
    }
    case 'leadership': {
      const count = profile.leadership_experience.length;
      return { passed: meetsNumeric(count, op, Number(value)), actual: `${count} leadership roles` };
    }
    case 'field_of_study': {
      const allowed = Array.isArray(value) ? value : [value];
      if (allowed.includes('any')) return { passed: true, actual: profile.target_field_of_study };
      const passed = allowed.includes(profile.target_field_of_study);
      return { passed, actual: profile.target_field_of_study.replace(/_/g, ' ') };
    }
    default:
      return { passed: true, actual: null };
  }
}

export interface RequirementEvaluation {
  requirement: ScholarshipRequirement;
  passed: boolean;
  actual: string | null;
}

/** Evaluate every structured requirement against the profile. */
export function evaluateRequirements(profile: Profile, scholarship: Scholarship): RequirementEvaluation[] {
  return scholarship.requirements.map((req) => {
    const { passed, actual } = evaluateRequirement(profile, req);
    return { requirement: req, passed, actual };
  });
}

function academicsFactor(profile: Profile, evals: RequirementEvaluation[]): MatchFactor {
  const gpa = normalizeGpa(profile);
  const gpaReq = evals.find((e) => e.requirement.field === 'gpa' && e.requirement.is_hard_requirement);
  let score = 0;
  let evidence = '';

  if (gpa == null) {
    evidence = 'No GPA provided — this strongly limits your match score.';
  } else if (gpa >= 3.8) {
    score = 100;
    evidence = `GPA ${gpa.toFixed(1)}/4.0 is in the top band for competitive scholarships.`;
  } else if (gpa >= 3.5) {
    score = 85;
    evidence = `GPA ${gpa.toFixed(1)}/4.0 is competitive for most major scholarships.`;
  } else if (gpa >= 3.0) {
    score = 65;
    evidence = `GPA ${gpa.toFixed(1)}/4.0 meets typical minimums but is below the most competitive applicants.`;
  } else {
    score = 40;
    evidence = `GPA ${gpa.toFixed(1)}/4.0 is below the usual 3.0 threshold for many awards.`;
  }

  if (gpaReq && !gpaReq.passed) {
    score = Math.min(score, 35);
    evidence += ` Fails the stated hard requirement (${requirementLabel(gpaReq.requirement)}).`;
  } else if (gpaReq && gpaReq.passed) {
    score = Math.min(100, score + 10);
    evidence += ' Meets the stated academic requirement.';
  }

  return { category: 'academics', label: 'Academics', score, max_score: 100, evidence: evidence.trim(), is_positive: score >= 60 };
}

function experienceFactor(profile: Profile, evals: RequirementEvaluation[]): MatchFactor {
  const years = getWorkExperienceYears(profile);
  const expReq = evals.find((e) => e.requirement.field === 'work_experience_years');
  let score = 0;
  let evidence = '';

  if (years >= 2) {
    score = 90;
    evidence = `${years} years of professional/leadership experience.`;
  } else if (years >= 1) {
    score = 65;
    evidence = `${years} years of experience — meets most minimums but not the 2-year bar used by Chevening-style awards.`;
  } else if (years > 0) {
    score = 40;
    evidence = `Only ${years} year(s) of experience so far.`;
  } else {
    evidence = 'No work or leadership experience recorded yet.';
  }

  if (expReq && !expReq.passed) {
    score = Math.min(score, 30);
    evidence += ` Fails the stated requirement (${requirementLabel(expReq.requirement)}).`;
  } else if (expReq && expReq.passed) {
    score = Math.min(100, score + 10);
    evidence += ' Meets the stated experience requirement.';
  }

  return { category: 'experience', label: 'Experience', score, max_score: 100, evidence: evidence.trim(), is_positive: score >= 60 };
}

function researchFactor(profile: Profile, evals: RequirementEvaluation[]): MatchFactor {
  const count = profile.research_experience.length + profile.publications.length;
  const researchReq = evals.find((e) => e.requirement.field === 'research');
  let score = count >= 2 ? 90 : count === 1 ? 70 : count > 0 ? 50 : 25;
  let evidence =
    count > 0
      ? `${count} research item(s): ${profile.research_experience[0]?.title ?? profile.publications[0]?.title ?? ''}`.trim()
      : 'No research experience or publications recorded.';

  if (researchReq) {
    if (!researchReq.passed) {
      score = Math.min(score, 40);
      evidence += ` Fails the stated research expectation (${requirementLabel(researchReq.requirement)}).`;
    } else {
      score = Math.min(100, score + 10);
      evidence += ' Meets the stated research expectation.';
    }
  }

  return { category: 'research', label: 'Research & Profile Fit', score, max_score: 100, evidence: evidence.trim(), is_positive: score >= 60 };
}

function languageFactor(profile: Profile, evals: RequirementEvaluation[]): MatchFactor {
  const ielts = profile.ielts_score;
  const toefl = profile.toefl_score;
  const langReqs = evals.filter((e) => e.requirement.field === 'ielts' || e.requirement.field === 'toefl');
  let score = 0;
  let evidence = '';

  if (ielts != null || toefl != null) {
    const parts: string[] = [];
    if (ielts != null) parts.push(`IELTS ${ielts}`);
    if (toefl != null) parts.push(`TOEFL ${toefl}`);
    evidence = parts.join(', ');

    const best = Math.max(
      ielts != null ? Math.min(100, (ielts / 9) * 100 + 15) : 0,
      toefl != null ? Math.min(100, (toefl / 120) * 100 + 10) : 0
    );
    score = Math.round(best);
    if (ielts != null && ielts >= 7.5) evidence += ' — comfortably above most scholarship language bars.';
    else if (ielts != null && ielts >= 6.5) evidence += ' — meets typical scholarship language bars.';
    else evidence += ' — below the typical 6.5 IELTS bar for fully-funded awards.';
  } else {
    evidence = 'No language test score recorded.';
  }

  const failedLang = langReqs.filter((e) => !e.passed);
  if (failedLang.length > 0) {
    score = Math.min(score, 35);
    evidence += ` Fails: ${failedLang.map((e) => requirementLabel(e.requirement)).join('; ')}.`;
  }

  return { category: 'language', label: 'Language', score, max_score: 100, evidence: evidence.trim(), is_positive: score >= 60 };
}

function scholarshipFitFactor(profile: Profile, scholarship: Scholarship, evals: RequirementEvaluation[]): MatchFactor {
  const fieldReq = evals.find((e) => e.requirement.field === 'field_of_study');
  const degreeReq = evals.find((e) => e.requirement.field === 'degree_level');
  let score = 0;
  const parts: string[] = [];

  if (fieldReq) {
    if (fieldReq.passed) {
      const first = Array.isArray(fieldReq.requirement.value) ? fieldReq.requirement.value[0] : fieldReq.requirement.value;
      if (first === 'any') {
        score += 60;
        parts.push('Open to all fields of study.');
      } else {
        score += 90;
        parts.push(`Your field (${profile.target_field_of_study.replace(/_/g, ' ')}) is explicitly targeted.`);
      }
    } else {
      score += 20;
      const vals = Array.isArray(fieldReq.requirement.value) ? fieldReq.requirement.value : [fieldReq.requirement.value];
      parts.push(`Field mismatch: scholarship targets ${vals.join(', ').replace(/_/g, ' ')}.`);
    }
  }

  if (profile.constraints.preferred_countries.includes(scholarship.country)) {
    score += 25;
    parts.push(`${scholarship.country} is on your preferred-countries list.`);
  } else if (profile.constraints.exclude_countries.includes(scholarship.country)) {
    score -= 15;
    parts.push(`${scholarship.country} is on your exclude list.`);
  } else {
    parts.push(`${scholarship.country} is not on your preferred-countries list.`);
  }

  if (profile.constraints.funding_type === 'full') {
    score += 15;
    parts.push('Fully-funded award matches your funding requirement.');
  }

  if (degreeReq && !degreeReq.passed) {
    score = Math.min(score, 25);
    parts.push(`Degree level mismatch (${requirementLabel(degreeReq.requirement)}).`);
  }

  score = Math.max(0, Math.min(100, score));
  return {
    category: 'scholarship_fit',
    label: 'Scholarship Fit',
    score,
    max_score: 100,
    evidence: parts.join(' '),
    is_positive: score >= 60,
  };
}

export interface MatchResult {
  score: MatchScore;
  evaluations: RequirementEvaluation[];
}

/**
 * Compute the full deterministic match result for a profile/scholarship pair.
 * Pure function — same inputs always produce the same output.
 */
export function computeMatch(
  profile: Profile,
  scholarship: Scholarship,
  readinessScore = 50
): MatchResult {
  const evaluations = evaluateRequirements(profile, scholarship);

  const hardFailures = evaluations.filter(
    (e) => e.requirement.is_hard_requirement && !e.passed
  );

  const academics = academicsFactor(profile, evaluations);
  const experience = experienceFactor(profile, evaluations);
  const research = researchFactor(profile, evaluations);
  const language = languageFactor(profile, evaluations);
  const fit = scholarshipFitFactor(profile, scholarship, evaluations);

  const readinessFactor: MatchFactor = {
    category: 'readiness',
    label: 'Readiness & Timeline',
    score: Math.max(0, Math.min(100, readinessScore)),
    max_score: 100,
    evidence: 'Based on current application readiness (documents, SOP, references, deadline distance).',
    is_positive: readinessScore >= 60,
  };

  const factors = [academics, experience, research, language, fit, readinessFactor];

  const weighted =
    academics.score * MATCH_WEIGHTS.academics +
    experience.score * MATCH_WEIGHTS.experience +
    research.score * MATCH_WEIGHTS.research +
    language.score * MATCH_WEIGHTS.language +
    fit.score * MATCH_WEIGHTS.scholarship_fit +
    readinessFactor.score * MATCH_WEIGHTS.readiness;

  let total = Math.round(weighted);

  return {
    score: {
      user_id: profile.user_id,
      scholarship_id: scholarship.id,
      score: total,
      breakdown: {
        academics: academics.score,
        experience: experience.score,
        research: research.score,
        language: language.score,
        scholarship_fit: fit.score,
        readiness: readinessFactor.score,
        total,
        factors,
      },
      eligibility_passed: hardFailures.length === 0,
      missing_hard_requirements: hardFailures.map(
        (e) => `${requirementLabel(e.requirement)} — you have: ${e.actual ?? 'unknown'} (source: "${e.requirement.evidence_span}")`
      ),
      updated_at: new Date().toISOString(),
    },
    evaluations,
  };
}

/** Compute matches for all scholarships and sort best-first. */
export function rankScholarships(
  profile: Profile,
  scholarships: Scholarship[],
  readinessByScholarship: Record<string, number> = {}
): MatchResult[] {
  return scholarships
    .map((s) => computeMatch(profile, s, readinessByScholarship[s.id] ?? 50))
    .sort((a, b) => b.score.score - a.score.score);
}

/**
 * Deterministic "Why not recommended" reasons for a low-ranked or ineligible scholarship.
 * Built directly from the evaluation data — no AI involved.
 */
export function whyNotRecommended(result: MatchResult, profile: Profile, scholarship?: Scholarship): string[] {
  const reasons: string[] = [];

  result.evaluations
    .filter((e) => e.requirement.is_hard_requirement && !e.passed)
    .forEach((e) => {
      reasons.push(
        `Hard requirement not met: ${requirementLabel(e.requirement)}. Your profile: ${e.actual ?? 'not provided'}. Source: "${e.requirement.evidence_span}"`
      );
    });

  result.score.breakdown.factors
    .filter((f) => !f.is_positive)
    .forEach((f) => {
      reasons.push(`${f.label} is weak (${f.score}/100): ${f.evidence}`);
    });

  if (scholarship && !profile.constraints.preferred_countries.includes(scholarship.country)) {
    reasons.push(`${scholarship.country} is not on your preferred-countries list.`);
  }

  if (reasons.length === 0) {
    reasons.push('No blocking issues found — this opportunity is competitive for your profile.');
  }

  return reasons;
}