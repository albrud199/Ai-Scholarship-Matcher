import { describe, it, expect } from 'vitest';
import { computeReadiness, generateBestNextActions, getDeadlineRisk } from '@/lib/readiness';
import { seedProfile, seedScholarships, seedApplications } from '@/lib/mock-data';

const byId = Object.fromEntries(seedScholarships.map((s) => [s.id, s]));

describe('readiness engine', () => {
  it('computes overall scores within 0-100 for every application', () => {
    seedApplications.forEach((app) => {
      const readiness = computeReadiness(app, byId[app.scholarship_id], seedProfile);
      expect(readiness.overall_score).toBeGreaterThanOrEqual(0);
      expect(readiness.overall_score).toBeLessThanOrEqual(100);
      expect(readiness.components).toHaveLength(5);
    });
  });

  it('scores an empty application lower than a progressed one', () => {
    const empty = computeReadiness(seedApplications[1], byId['daad-epos'], seedProfile); // no docs/refs
    const progressed = computeReadiness(seedApplications[0], byId['chevening'], seedProfile); // docs + refs + SOP
    expect(progressed.overall_score).toBeGreaterThan(empty.overall_score);
  });

  it('maps day ranges to risk levels', () => {
    expect(getDeadlineRisk(10)).toBe('high');
    expect(getDeadlineRisk(45)).toBe('medium');
    expect(getDeadlineRisk(120)).toBe('low');
  });

  it('generates ranked best-next-actions from real state', () => {
    const actions = generateBestNextActions(seedApplications, byId, seedProfile);
    expect(actions.length).toBeGreaterThan(0);
    // Sorted descending by ranking (spot-check via impact ordering heuristics):
    // the top action must have a title and non-negative impact.
    expect(actions[0].title.length).toBeGreaterThan(0);
    expect(actions[0].impact_score).toBeGreaterThanOrEqual(0);
  });

  it('flags missing references and SOP as actions for draft apps', () => {
    const actions = generateBestNextActions(seedApplications, byId, seedProfile);
    const types = new Set(actions.map((a) => a.action_type));
    expect(types.has('request_reference')).toBe(true);
    expect(types.has('complete_sop')).toBe(true);
  });
});
