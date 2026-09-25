'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchExplainer } from '@/components/match-explainer';
import { seedScholarships, seedProfile } from '@/lib/mock-data';
import { rankScholarships } from '@/lib/matching';
import { getScoreColor, getDaysUntil, cn } from '@/lib/utils';
import { ChevronRight, CheckCircle2, XCircle, Target, Info } from 'lucide-react';

export default function MatchesPage() {
  const matches = useMemo(() => rankScholarships(seedProfile, seedScholarships), []);
  const [selectedId, setSelectedId] = useState<string>(matches[0]?.score.scholarship_id ?? '');
  const [showWhyNot, setShowWhyNot] = useState(false);

  const selected = matches.find((m) => m.score.scholarship_id === selectedId) ?? matches[0];
  const selectedScholarship = seedScholarships.find((s) => s.id === selected?.score.scholarship_id);
  const eligibleCount = matches.filter((m) => m.score.eligibility_passed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Matches</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deterministic profile-fit scores with full explainability — {eligibleCount} of {matches.length} pass all hard requirements.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Info className="h-3.5 w-3.5" />
          Profile fit ≠ admission probability
        </Badge>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Ranked list */}
        <div className="min-w-0 space-y-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
          {matches.map(({ score, evaluations }, rank) => {
            const sch = seedScholarships.find((s) => s.id === score.scholarship_id);
            if (!sch) return null;
            const hardFails = evaluations.filter((e) => e.requirement.is_hard_requirement && !e.passed).length;
            const isActive = score.scholarship_id === selectedId;
            return (
              <button
                key={score.scholarship_id}
                onClick={() => {
                  setSelectedId(score.scholarship_id);
                  setShowWhyNot(false);
                }}
                className={cn(
                  'w-full text-left rounded-xl border p-3 transition-colors flex items-center gap-3',
                  isActive ? 'border-primary bg-primary-50' : 'bg-card hover:border-primary/40'
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="text-xs font-bold text-muted-foreground w-5">#{rank + 1}</span>
                <div className={cn('flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 flex-shrink-0', getScoreColor(score.score))}>
                  <span className="text-lg font-bold leading-none">{score.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug truncate">{sch.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    {score.eligibility_passed ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-success-600" /> Eligible
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-danger-600" /> {hardFails} hard req. unmet
                      </>
                    )}
                    <span>· {getDaysUntil(sch.deadline)}d left</span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Explainer for selection */}
        <div className="min-w-0 space-y-4">
          {selected && selectedScholarship ? (
            showWhyNot ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="font-medium">Full explainability view</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Open the &ldquo;Why not recommended&rdquo; tab inside the breakdown below.
                  </p>
                  <Button variant="outline" onClick={() => setShowWhyNot(false)}>
                    Back to breakdown
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <MatchExplainer result={selected} scholarship={selectedScholarship} profile={seedProfile} />
            )
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No matches yet. Complete your <Link href="/dashboard/profile" className="text-primary hover:underline">profile</Link> to see ranked scholarships.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}