import type { Award, LeadershipExperience, Profile, Publication, ResearchExperience, WorkExperience } from '@/types';
import { studentProfile } from '@/lib/mock-data';

/** Editable shape of the profile form — numbers stay strings while the student types. */
export interface ProfileFormState {
  fullName: string;
  nationality: string;
  currentDegree: string;
  currentInstitution: string;
  targetDegreeLevel: Profile['target_degree_level'];
  targetFieldOfStudy: string;
  gpa: string;
  gpaScale: string;
  ielts: string;
  toefl: string;
  goals: string;
  preferredCountries: string[];
  excludeCountries: string[];
  maxTuitionBudget: string;
  fundingType: Profile['constraints']['funding_type'];
  research: ResearchExperience[];
  work: WorkExperience[];
  leadership: LeadershipExperience[];
  publications: Publication[];
  awards: Award[];
}

export function fromProfile(p: Profile): ProfileFormState {
  return {
    fullName: p.full_name,
    nationality: p.nationality,
    currentDegree: p.current_degree,
    currentInstitution: p.current_institution,
    targetDegreeLevel: p.target_degree_level,
    targetFieldOfStudy: p.target_field_of_study,
    gpa: p.gpa?.toString() ?? '',
    gpaScale: p.gpa_scale ?? '4.0',
    ielts: p.ielts_score?.toString() ?? '',
    toefl: p.toefl_score?.toString() ?? '',
    goals: p.goals,
    preferredCountries: p.constraints.preferred_countries,
    excludeCountries: p.constraints.exclude_countries,
    maxTuitionBudget: p.constraints.max_tuition_budget?.toString() ?? '',
    fundingType: p.constraints.funding_type,
    research: p.research_experience,
    work: p.work_experience,
    leadership: p.leadership_experience,
    publications: p.publications,
    awards: p.awards,
  };
}

/** Blank starter form for a student who has not entered anything yet. */
export const EMPTY_PROFILE_FORM: ProfileFormState = fromProfile(studentProfile);

/** True when there is nothing worth keeping in the form yet. */
export function isFormBlank(form: ProfileFormState): boolean {
  return (
    !form.fullName.trim() &&
    !form.nationality.trim() &&
    !form.currentInstitution.trim() &&
    !form.targetFieldOfStudy.trim() &&
    !form.gpa.trim() &&
    !form.ielts.trim() &&
    !form.toefl.trim() &&
    !form.goals.trim() &&
    !form.maxTuitionBudget.trim() &&
    form.research.length === 0 &&
    form.work.length === 0 &&
    form.leadership.length === 0 &&
    form.publications.length === 0 &&
    form.awards.length === 0 &&
    form.preferredCountries.length === 0 &&
    form.excludeCountries.length === 0
  );
}

/**
 * Map a saved `profiles` row onto the editable form shape.
 * Missing JSON columns fall back to empty arrays so a partially-filled row never crashes the form.
 */
export function rowToFormState(row: Partial<Profile>): ProfileFormState {
  const base = fromProfile({ ...studentProfile, ...row } as Profile);
  return {
    ...base,
    research: row.research_experience ?? [],
    work: row.work_experience ?? [],
    leadership: row.leadership_experience ?? [],
    publications: row.publications ?? [],
    awards: row.awards ?? [],
    preferredCountries: row.constraints?.preferred_countries ?? [],
    excludeCountries: row.constraints?.exclude_countries ?? [],
  };
}

/** Build the `profiles` table payload (snake_case columns) from the editable form. */
export function toProfileRow(form: ProfileFormState, userId: string) {
  return {
    user_id: userId,
    full_name: form.fullName,
    nationality: form.nationality,
    current_degree: form.currentDegree,
    current_institution: form.currentInstitution,
    target_degree_level: form.targetDegreeLevel,
    target_field_of_study: form.targetFieldOfStudy,
    gpa: form.gpa ? Number(form.gpa) : null,
    gpa_scale: form.gpaScale,
    ielts_score: form.ielts ? Number(form.ielts) : null,
    toefl_score: form.toefl ? Number(form.toefl) : null,
    research_experience: form.research,
    work_experience: form.work,
    leadership_experience: form.leadership,
    publications: form.publications,
    awards: form.awards,
    goals: form.goals,
    constraints: {
      preferred_countries: form.preferredCountries,
      exclude_countries: form.excludeCountries,
      max_tuition_budget: form.maxTuitionBudget ? Number(form.maxTuitionBudget) : undefined,
      language_requirements: [] as string[],
      funding_type: form.fundingType,
    },
    updated_at: new Date().toISOString(),
  };
}

const DRAFT_STORAGE_KEY = 'scholarmatch:profile-draft';

/**
 * The in-memory mirror of the draft.
 *
 * This is the reason a half-filled profile is never lost: even when the browser
 * refuses to write localStorage (Safari private mode, storage quota, storage
 * blocked by policy) the form still re-populates when the /dashboard/profile
 * route unmounts and mounts again during client-side navigation.
 */
let memoryDraft: ProfileFormState | null = null;

/**
 * Drafts are keyed per account, so signing in as someone else on a shared
 * computer never shows the previous student's answers.
 */
function draftKey(userId?: string | null): string {
  return userId ? `${DRAFT_STORAGE_KEY}:${userId}` : DRAFT_STORAGE_KEY;
}

/**
 * Read the locally cached draft. This is what keeps the form populated when the
 * student navigates away and back, and when Supabase is not configured at all.
 */
export function loadDraft(userId?: string | null): ProfileFormState | null {
  const key = draftKey(userId);

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProfileFormState>;
        // Merge over the blank form so a draft written by an older build stays valid.
        return { ...EMPTY_PROFILE_FORM, ...parsed };
      }
    } catch {
      // Unreadable storage falls through to the in-memory mirror below.
    }
  }

  return memoryDraft;
}

/** Persist the in-progress form so it survives navigation, reloads, and storage limits. */
export function saveDraft(form: ProfileFormState, userId?: string | null): void {
  memoryDraft = form;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(draftKey(userId), JSON.stringify(form));
  } catch {
    // Storage disabled or full — the in-memory mirror above still covers
    // navigation within this tab, which is the common way back to the form.
  }
}

/** Join the saved row and the local draft, keeping whichever holds more of the student's answers. */
export function mergeForms(saved: ProfileFormState, draft: ProfileFormState | null): ProfileFormState {
  if (!draft) return saved;
  return isFormBlank(draft) ? saved : draft;
}

/** Drop the local draft once the profile is safely stored on the server. */
export function clearDraft(userId?: string | null): void {
  memoryDraft = null;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(draftKey(userId));
  } catch {
    // Ignore — nothing to clean up if storage is unavailable.
  }
}
