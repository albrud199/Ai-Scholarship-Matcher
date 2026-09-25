import { describe, it, expect } from 'vitest';
import { computeMatch, rankScholarships, normalizeGpa, getWorkExperienceYears, whyNotRecommended } from '@/lib/matching';
import { seedProfile, seedScholarships } from '@/lib/mock-data';

describe('deterministic match engine', () => {
  it('produces identical scores for identical inputs (pure function)', () => {
    const a = computeMatch(seedProfile, seedScholarships[0]);
    const b = computeMatch(seedProfile, seedScholarships[0]);
    expect(a.score.score).toBe(b.score.score);
    expect(a.score.breakdown.total).toBe(b.score.breakdown.total);
  });

  it('computes scores in the valid 0-100 range for every scholarship', () => {
    seedScholarships.forEach((s) => {
      const { score } = computeMatch(seedProfile, s);
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
 expect(score.breakdown.factors).toHaveLength(6);
    });
  });

  it('marks degree-level mismatch as a failed hard requirement', () => {
    // Vanier Canada is PhD-only; the seeded profile targets a master's.
    const vanier = seedScholarships.find((s) => s.id === 'vanier-canada')!;
    const { score } = computeMatch(seedProfile, vanier);
    expect(score.eligibility_passed).toBe(false);
    expect(score.missing_hard_requirements.length).toBeGreaterThan(0);
  });

  it('ranks scholarships and never returns negative totals', () => {
    const ranked = rankScholarships(seedProfile, seedScholarships);
    expect(ranked).toHaveLength(seedScholarships.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score.score).toBeGreaterThanOrEqual(ranked[i].score.score);
    }
  });

  it('normalizes GPA scales correctly', () => {
    expect(normalizeGpa({ ...seedProfile, gpa: 3.6, gpa_scale: '4.0' })).toBeCloseTo(3.6);
    expect(normalizeGpa({ ...seedProfile, gpa: 8.0, gpa_scale: '10.0' })).toBeCloseTo(3.2);
    expect(normalizeGpa({ ...seedProfile, gpa: 80, gpa_scale: 'percentage' })).toBeCloseTo(3.2);
 expect(normalizeGpa({ ...seedProfile, gpa: undefined })).toBeNull();
  });

  it('sums work and leadership durations into years', () => {
    const years = getWorkExperienceYears(seedProfile);
    expect(years).toBeGreaterThan(1);
    expect(years).toBeLessThan(10);
  });

  it('always returns at least one why-not-recommended reason', () => {
    const result = computeMatch(seedProfile, seedScholarships[0]);
    const reasons = whyNotRecommended(result, seedProfile, seedScholarships[0]);
    expect(reasons.length).toBeGreaterThan(0);
  });
});
