'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScholarshipDetailDialog } from '@/components/scholarship-detail-dialog';
import { degreeLevelLabel } from '@/lib/scholarship-labels';
import { getMatchDataCoverage, getMatchDataGaps, MISSING_FACT_LABELS, MATCH_DATA_COVERAGE_THRESHOLD, type MatchResult } from '@/lib/matching';
import { getDaysUntil, getDeadlineStatus, formatDateShort, getScoreColor, getMatchLabel, cn } from '@/lib/utils';
import { Calendar, Building2, CheckCircle2, AlertTriangle, Sparkles, Info, Lock, ArrowRight } from 'lucide-react';
import { Scholarship, Profile } from '@/types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  match?: MatchResult;
  profile?: Profile;
  onAddApplication?: (scholarship: Scholarship) => void;
  isSaved?: boolean;
}

export function ScholarshipCard({ scholarship, match, profile, onAddApplication, isSaved }: ScholarshipCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const days = getDaysUntil(scholarship.deadline);
  const status = getDeadlineStatus(scholarship.deadline);
  const coverage = match ? getMatchDataCoverage(match) : 0;
  const hasEnoughData = match ? coverage >= MATCH_DATA_COVERAGE_THRESHOLD : false;
  const firstGap = match ? getMatchDataGaps(match)[0] : undefined;
  const missingHint = firstGap ? MISSING_FACT_LABELS[firstGap.category] ?? firstGap.label : 'your profile';

  return (
    <Card className="min-w-0 flex flex-col h-full hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="font-semibold leading-snug line-clamp-2">{scholarship.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{scholarship.provider}</span>
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline">{scholarship.country}</Badge>
          <Badge variant="outline">{degreeLevelLabel(scholarship.degree_level)}</Badge>
          <Badge variant={status === 'expired' ? 'destructive' : status === 'urgent' ? 'warning' : status === 'soon' ? 'info' : 'success'}>
            <Calendar className="h-3 w-3 mr-1" />
            {status === 'expired' ? 'Closed' : `${days} days left`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* A number only appears when the profile has enough facts to back it up */}
        {match && hasEnoughData ? (
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center justify-between gap-2 text-sm mb-2">
              <span className="font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {getMatchLabel(match.score.score)}
              </span>
              <span className={cn('font-semibold px-2 py-0.5 rounded text-xs', getScoreColor(match.score.score))}>
                {match.score.score}/100
              </span>
            </div>
            <Progress value={match.score.score} className="h-1.5" />
            <p className="mt-2 text-xs">
              {match.score.eligibility_passed ? (
                <span className="flex items-center gap-1 text-success-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> You meet the must-have requirements
                </span>
              ) : (
                <span className="flex items-center gap-1 text-warning-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {match.score.missing_hard_requirements.length} requirement(s) to work on
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-3">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Match needs {missingHint}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {match
                ? `We only have ${coverage}% of your profile, so we would rather not guess a score.`
                : 'Add your details once and every scholarship gets a score.'}
            </p>
            <Button size="sm" variant="link" className="px-0 h-auto mt-1" asChild>
              <Link href="/dashboard/profile">
                Complete my profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between pt-0 gap-2">
        <span className="min-w-0 text-xs text-muted-foreground">Closes {formatDateShort(scholarship.deadline)}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setDetailsOpen(true)}>
            <Info className="mr-1 h-3.5 w-3.5" /> Details
          </Button>
          {onAddApplication && (
            <Button size="sm" variant={isSaved ? 'secondary' : 'default'} onClick={() => onAddApplication(scholarship)} disabled={isSaved}>
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>
      </CardFooter>

      <ScholarshipDetailDialog
        scholarship={scholarship}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        match={match}
        profile={profile}
        isSaved={isSaved}
        onAddApplication={onAddApplication}
      />
    </Card>
  );
}