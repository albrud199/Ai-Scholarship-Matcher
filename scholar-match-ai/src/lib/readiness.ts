import {
  Profile,
  Scholarship,
  Application,
  ReadinessScore,
  ReadinessComponent,
  BestNextAction,
} from '@/types';

/** Days before the deadline at which risk becomes high. */
const HIGH_RISK_DAYS = 30;
const MEDIUM_RISK_DAYS = 60;

export function getDeadlineRisk(daysUntil: number): 'low' | 'medium' | 'high' {
  if (daysUntil <= HIGH_RISK_DAYS) return 'high';
  if (daysUntil <= MEDIUM_RISK_DAYS) return 'medium';
  return 'low';
}

function minWords(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function computeReadiness(
  application: Application,
  scholarship: Scholarship,
  profile: Profile
): ReadinessScore {
  const daysUntil = Math.ceil(
    (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const risk = getDeadlineRisk(daysUntil);

  const components: ReadinessComponent[] = [];

  // 1. Documents (25 pts)
  const expectedDocs = ['transcript', 'cv', 'sop', 'language_test'];
  const docTypes = new Set(application.documents.map((d) => d.type));
  const haveDocs = expectedDocs.filter((t) => docTypes.has(t as never)).length;
  const verifiedDocs = application.documents.filter((d) => d.verification_state === 'verified').length;
  const docScore = Math.round((haveDocs / expectedDocs.length) * 20 + (application.documents.length ? (verifiedDocs / application.documents.length) * 5 : 0));
  components.push({
    name: 'Documents',
    score: docScore,
    max_score: 25,
    weight: 0.25,
    status: docScore >= 20 ? 'complete' : docScore > 0 ? 'in_progress' : 'missing',
    details: `${haveDocs}/4 core documents uploaded (${verifiedDocs} verified by AI checks).`,
  });

  // 2. SOP / essay (20 pts)
  const words = minWords(application.sop_content);
  const sopScore = words >= 500 ? 20 : words >= 200 ? 12 : words > 0 ? 6 : 0;
  components.push({
    name: 'Statement of Purpose',
    score: sopScore,
    max_score: 20,
    weight: 0.2,
    status: sopScore >= 20 ? 'complete' : sopScore > 0 ? 'in_progress' : 'missing',
    details:
      words > 0
        ? `Draft exists (~${words} words). Aim for 500+ words.`
        : 'No SOP draft started yet.',
  });

  // 3. References (20 pts)
  const submitted = application.references.filter((r) => r.status === 'submitted').length;
  const requested = application.references.length;
  const refScore = Math.min(20, submitted * 10 + requested * 2);
  components.push({
    name: 'References',
    score: refScore,
    max_score: 20,
    weight: 0.2,
    status: submitted >= 2 ? 'complete' : refScore > 0 ? 'in_progress' : 'missing',
    details:
      requested === 0
        ? 'No references requested yet.'
        : `${submitted}/${requested} submitted.`,
  });

  // 4. Profile strength (20 pts)
  const profileSignals = [
    profile.gpa != null,
    profile.ielts_score != null || profile.toefl_score != null,
    profile.work_experience.length + profile.leadership_experience.length > 0,
    profile.research_experience.length + profile.publications.length > 0,
    profile.goals.trim().length > 50,
  ];
  const profileMet = profileSignals.filter(Boolean).length;
  const profileScore = Math.round((profileMet / profileSignals.length) * 20);
  components.push({
    name: 'Profile Strength',
    score: profileScore,
    max_score: 20,
    weight: 0.2,
    status: profileMet === profileSignals.length ? 'complete' : 'in_progress',
    details: `${profileMet}/5 profile signals present (GPA, language, experience, research, goals).`,
  });

  // 5. Deadline safety (15 pts)
  const deadlineScore = risk === 'low' ? 15 : risk === 'medium' ? 8 : daysUntil <= 7 ? 2 : 5;
  components.push({
    name: 'Deadline Safety',
    score: deadlineScore,
    max_score: 15,
    weight: 0.15,
    status: risk === 'low' ? 'complete' : 'in_progress',
    details: `${daysUntil} days until the deadline — ${risk} risk.`,
  });

  const overall = Math.round(components.reduce((acc, c) => acc + c.score, 0));

  return {
    application_id: application.id,
    overall_score: overall,
    components,
    last_calculated: new Date().toISOString(),
  };
}

export interface NextActionCandidate {
  action_type: BestNextAction['action_type'];
  title: string;
  description: string;
  impact_score: number;
  effort_minutes: number;
}

/**
 * Deterministically generate candidate actions from real state, then rank them
 * by (impact × reuse × deadline urgency) / effort — surfacing exactly ONE
 * recommendation at a time (the signature "Best Next Action" interaction).
 */
export function generateBestNextActions(
  applications: Application[],
  scholarshipById: Record<string, Scholarship>,
  profile: Profile
): BestNextAction[] {
  const candidates: BestNextAction[] = [];
  const now = new Date().toISOString();

  applications.forEach((app) => {
    const scholarship = scholarshipById[app.scholarship_id];
    if (!scholarship) return;

    const daysUntil = Math.ceil(
      (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const risk = getDeadlineRisk(daysUntil);
    const urgencyBoost = risk === 'high' ? 15 : risk === 'medium' ? 7 : 0;

    const docTypes = new Set(app.documents.map((d) => d.type));
    const missingDocs: Array<{ type: string; label: string; minutes: number }> = [];
    if (!docTypes.has('transcript')) missingDocs.push({ type: 'transcript', label: 'transcript', minutes: 15 });
    if (!docTypes.has('language_test')) missingDocs.push({ type: 'language_test', label: 'language test result', minutes: 10 });
    if (!docTypes.has('cv')) missingDocs.push({ type: 'cv', label: 'CV', minutes: 20 });

    const missingElsewhere = missingDocs.filter(
      (m) => !applications.some((other) => other.id !== app.id && other.documents.some((d) => d.type === m.type))
    ).length;

    missingDocs.forEach((m) => {
      candidates.push({
        id: `action-${app.id}-${m.type}`,
        application_id: app.id,
        action_type: 'upload_document',
        title: `Upload your ${m.label} for ${scholarship.name}`,
        description:
          missingElsewhere > 0
            ? `This document is also missing from ${missingElsewhere} other application(s) — uploading it once unblocks them all.`
            : `Required document for ${scholarship.name}. The checklist cannot progress without it.`,
        impact_score: 55 + (m.type === 'transcript' ? 15 : 0) + urgencyBoost,
        effort_minutes: m.minutes,
        deadline_risk: risk,
        affects_applications: 1 + missingElsewhere,
        status: 'pending',
      });
    });

    if (!docTypes.has('sop') && minWords(app.sop_content) < 200) {
      candidates.push({
        id: `action-${app.id}-sop`,
        application_id: app.id,
        action_type: 'complete_sop',
        title: `Complete your statement of purpose for ${scholarship.name}`,
        description: `Your SOP draft is ${minWords(app.sop_content) > 0 ? 'only a fragment' : 'not started'}. A full draft (~500 words) is worth +20 readiness points.`,
        impact_score: 60 + urgencyBoost,
        effort_minutes: 90,
        deadline_risk: risk,
        affects_applications: 1,
        status: 'pending',
      });
    }

    if (app.references.length < 2) {
      candidates.push({
        id: `action-${app.id}-refs`,
        application_id: app.id,
        action_type: 'request_reference',
        title: `Request ${2 - app.references.length} more reference(s) for ${scholarship.name}`,
        description:
          'Most scholarships require two academic or professional references. Referees need 2–3 weeks of lead time.',
        impact_score: 55 + urgencyBoost,
        effort_minutes: 20,
        deadline_risk: risk,
        affects_applications: 1,
        status: 'pending',
      });
    }
  });

  // Profile-level actions (reuse across ALL applications)
  if (profile.ielts_score == null && profile.toefl_score == null) {
    candidates.push({
      id: 'action-profile-language',
      application_id: applications[0]?.id ?? 'none',
      action_type: 'improve_language_score',
      title: 'Add a language test score to your profile',
      description:
        'A verified IELTS/TOEFL score is a hard requirement for most fully-funded scholarships and lifts the Language factor of every match.',
      impact_score: 70,
      effort_minutes: 0,
      deadline_risk: 'medium',
      affects_applications: applications.length,
      status: 'pending',
    });
  }

  if (profile.work_experience.length + profile.leadership_experience.length === 0) {
    candidates.push({
      id: 'action-profile-experience',
      application_id: applications[0]?.id ?? 'none',
      action_type: 'add_experience',
      title: 'Add work or leadership experience to your profile',
      description:
        'Experience feeds the 20%-weighted Experience factor and the 2-year bars used by Chevening, DAAD, and Australia Awards.',
      impact_score: 65,
      effort_minutes: 30,
      deadline_risk: 'low',
      affects_applications: applications.length,
      status: 'pending',
    });
  }

  // Rank: impact × reuse × urgency ÷ effort — then dedupe by action_type+title
  const ranked = candidates.sort((a, b) => {
    const scoreA = (a.impact_score * (1 + a.affects_applications * 0.3)) / Math.max(1, a.effort_minutes / 15);
    const scoreB = (b.impact_score * (1 + b.affects_applications * 0.3)) / Math.max(1, b.effort_minutes / 15);
    return scoreB - scoreA;
  });

  return ranked;
}