'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  factorWeightPercent,
  getMatchDataCoverage,
  getMatchDataGaps,
  requirementLabel,
  whyNotRecommended,
  MISSING_FACT_LABELS,
  MATCH_DATA_COVERAGE_THRESHOLD,
  type MatchResult,
} from '@/lib/matching';
import { degreeLevelLabel, fieldOfStudyLabel, providerTypeLabels } from '@/lib/scholarship-labels';
import { cn, formatDateShort, getDaysUntil, getDeadlineStatus, getMatchLabel, getScoreColor } from '@/lib/utils';
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Heart,
  Info,
  MapPin,
  Quote,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react';
import { Scholarship, Profile } from '@/types';

interface ScholarshipDetailDialogProps {
  scholarship: Scholarship;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match?: MatchResult;
  profile?: Profile;
  isSaved?: boolean;
  onAddApplication?: (scholarship: Scholarship) => void;
}

export function ScholarshipDetailDialog({
  scholarship,
  open,
  onOpenChange,
  match,
  profile,
  isSaved,
  onAddApplication,
}: ScholarshipDetailDialogProps) {
  const days = getDaysUntil(scholarship.deadline);
  const deadlineStatus = getDeadlineStatus(scholarship.deadline);
  const coverage = match ? getMatchDataCoverage(match) : 0;
  const reliable = match ? coverage >= MATCH_DATA_COVERAGE_THRESHOLD : false;
  const gaps = match ? getMatchDataGaps(match) : [];
  const reasons = match && profile ? whyNotRecommended(match, profile, scholarship) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-snug">{scholarship.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            {scholarship.provider} · {providerTypeLabels[scholarship.provider_type]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">
            <MapPin className="h-3 w-3 mr-1" />
            {scholarship.country}
          </Badge>
          <Badge variant="outline">
            <GraduationCap className="h-3 w-3 mr-1" />
            {degreeLevelLabel(scholarship.degree_level)}
          </Badge>
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Deadline {formatDateShort(scholarship.deadline)}
          </Badge>
          <Badge
            variant={
              deadlineStatus === 'expired' ? 'destructive' : deadlineStatus === 'urgent' ? 'warning' : deadlineStatus === 'soon' ? 'info' : 'success'
            }
          >
            {deadlineStatus === 'expired' ? 'Closed' : `${days} days left`}
          </Badge>
          {scholarship.benefits.length > 0 && (
            <Badge variant="secondary">
              <Wallet className="h-3 w-3 mr-1" />
              {scholarship.benefits.length} benefits covered
            </Badge>
          )}
        </div>

        <Tabs defaultValue="overview" className="mt-1">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility check</TabsTrigger>
            <TabsTrigger value="match">Match &amp; why</TabsTrigger>
          </TabsList>

          {/* Overview: everything that used to clutter the card front */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <section className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> About this scholarship
              </h4>
              <p className="text-sm text-muted-foreground">{scholarship.description}</p>
            </section>

            {scholarship.benefits.length > 0 && (
              <section className="space-y-1.5">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-primary" /> What it covers
                </h4>
                <ul className="grid sm:grid-cols-2 gap-1.5">
                  {scholarship.benefits.map((b) => (
                    <li key={b} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success-600 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator />

            <section className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Fields of study</p>
                <p className="font-medium">{scholarship.field_of_study.map(fieldOfStudyLabel).join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Degree level</p>
                <p className="font-medium">{degreeLevelLabel(scholarship.degree_level)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-medium">
                  {formatDateShort(scholarship.deadline)} {days >= 0 ? `(${days} days left)` : '(closed)'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Source last verified</p>
                <p className="font-medium">{formatDateShort(scholarship.source_verified_at)}</p>
              </div>
            </section>
          </TabsContent>

          {/* Eligibility check against the student's own profile */}
          <TabsContent value="eligibility" className="mt-4 space-y-3">
            <div className="rounded-lg border bg-secondary/40 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Official eligibility text</p>
              <p className="text-sm">{scholarship.eligibility_criteria}</p>
            </div>

            {match ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">How you compare, requirement by requirement</p>
                {match.evaluations.map((e) => (
                  <div key={e.requirement.id} className={cn('rounded-lg border p-3', e.passed ? 'bg-success-50/40' : 'bg-warning-50/60')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm min-w-0">
                        <p className="font-medium flex items-center gap-2 flex-wrap">
                          {e.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-success-600" />
                          ) : e.actual === 'not provided' ? (
                            <Info className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <XCircle className="h-4 w-4 text-danger-600" />
                          )}
                          {requirementLabel(e.requirement)}
                          <Badge variant={e.requirement.is_hard_requirement ? 'destructive' : 'secondary'} className="text-[10px]">
                            {e.requirement.is_hard_requirement ? 'must have' : 'counts toward score'}
                          </Badge>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {e.actual === 'not provided' ? 'Add this detail to your profile so we can check it.' : `Your profile: ${e.actual}`}
                        </p>
                        {e.requirement.evidence_span && (
                          <p className="mt-2 text-xs italic text-muted-foreground flex gap-1.5">
                            <Quote className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            From the official source: &ldquo;{e.requirement.evidence_span}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">weighs {Math.round(e.requirement.weight * 100)}%</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  &ldquo;Must have&rdquo; items are pass/fail gates taken from the official source. Everything else nudges your score up or down.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add your profile to see this list checked against your own details.</p>
            )}
          </TabsContent>

          {/* Match breakdown + why-not, in student language */}
          <TabsContent value="match" className="mt-4 space-y-3">
            {match && profile ? (
              <>
                {reliable ? (
                  <div className="rounded-lg border p-4 flex items-start gap-4">
                    <div className={cn('flex flex-col items-center justify-center rounded-xl px-4 py-2 flex-shrink-0', getScoreColor(match.score.score))}>
                      <span className="text-2xl font-bold leading-none">{match.score.score}</span>
                      <span className="text-[10px] font-medium mt-0.5">/ 100</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {getMatchLabel(match.score.score)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {match.score.eligibility_passed
                          ? 'You meet every must-have requirement we could check.'
                          : `${match.score.missing_hard_requirements.length} must-have requirement(s) still unmet.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-warning-500/40 bg-warning-50/60 p-4">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-warning-600" />
                      We need a little more about you
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This score is built from {coverage}% of your profile, so we are not showing a number that would only
                      reflect missing details. Add these and your match appears instantly:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {gaps.map((g) => (
                        <li key={g.category} className="text-sm flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span>
                            {MISSING_FACT_LABELS[g.category] ?? g.label} — unlocks {factorWeightPercent(g.category)}% of the score
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" variant="outline" className="mt-3" asChild>
                      <Link href="/dashboard/profile">Complete my profile</Link>
                    </Button>
                  </div>
                )}

                <div className="space-y-2.5">
                  <p className="text-sm font-semibold">How your score is built</p>
                  {match.score.breakdown.factors.map((f) => (
                    <div key={f.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{f.label}</span>
                        <span className="text-muted-foreground">
                          {f.data_missing ? 'not enough info yet' : `${f.score}/100`} · weighs {factorWeightPercent(f.category)}%
                        </span>
                      </div>
                      <Progress value={f.data_missing ? 0 : f.score} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{f.evidence}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    {match.score.score >= 70 ? 'What could still hold you back' : 'What is working against you'}
                  </p>
                  {reasons.map((reason, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-muted-foreground">{reason}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  Deterministic: computed by code from the scholarship&apos;s structured requirements and your profile — not
                  an AI guess, and not a chance of being admitted.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your profile to see how this scholarship lines up with your grades, experience and language scores.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" asChild>
            <a href={scholarship.source_url} target="_blank" rel="noopener noreferrer">
              Official source <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button asChild>
            <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer">
              Start application <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          {onAddApplication && (
            <Button variant={isSaved ? 'secondary' : 'outline'} disabled={isSaved} onClick={() => onAddApplication(scholarship)}>
              {isSaved ? 'Saved to my applications' : 'Add to my applications'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
