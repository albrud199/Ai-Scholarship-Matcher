import { DEGREE_LEVELS, FIELDS_OF_STUDY } from '@/lib/mock-data';
import type { Scholarship } from '@/types';

export const providerTypeLabels: Record<Scholarship['provider_type'], string> = {
  government: 'Government',
  university: 'University',
  foundation: 'Foundation',
  corporate: 'Corporate',
  international_org: 'Intl. Organization',
};

/** Human wording for a stored field-of-study value. */
export function fieldOfStudyLabel(value: string): string {
  if (value === 'any') return 'Any field';
  return FIELDS_OF_STUDY.find((f) => f.value === value)?.label ?? value.replace(/_/g, ' ');
}

/** Human wording for a scholarship degree level. */
export function degreeLevelLabel(value: Scholarship['degree_level']): string {
  if (value === 'any') return 'Any degree';
  return DEGREE_LEVELS.find((d) => d.value === value)?.label ?? value;
}
