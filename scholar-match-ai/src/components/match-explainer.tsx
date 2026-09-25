'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MATCH_WEIGHTS, whyNotRecommended, requirementLabel, type MatchResult } from '@/lib/matching';
import { getScoreColor, cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Quote, HelpCircle, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { Scholarship, Profile } from '@/types';

interface MatchExplainerProps {
  result: MatchResult;
  scholarship: Scholarship;
  profile: Profile;
}

const weightLabels: Record<string, string> = {
  academics: 'Academics',
  experience: 'Experience',
  research: 'Research & Profile Fit',
  language: 'Language',
  scholarship_fit: 'Scholarship Fit',
  readiness: 'Readiness & Timeline',
};

export function MatchExplainer({ result, scholarship, profile }: MatchExplainerProps) {
  const { score } = result;
  const positiveFactors = score.breakdown.factors.filter((f) => f.is_positive);
  const negativeFactors = score.breakdown.factors.filter((f) => !f.is_positive);
  const whyNot = whyNotRecommended(result, profile, scholarship);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">{scholarship.name}</CardTitle>
              <CardDescription>
                Deterministic profile-fit score — computed from structured requirements, never an AI guess. Not an admission probability.
              </CardDescription>
            </div>
            <div className={cn('flex flex-col items-center justify-center rounded-xl px-5 py-3', getScoreColor(score.score))}>
              <span className="text-3xl font-bold leading-none">{score.score}</span>
              <span className="text-xs font-medium mt-1">/ 100</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {score.eligibility_passed ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All hard requirements passed
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3.5 w-3.5" /> {score.missing_hard_requirements.length} hard requirement(s) not met
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {score.breakdown.factors.map((f) => (
              <div key={f.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate" title={weightLabels[f.category] ?? f.label}>
                    {weightLabels[f.category] ?? f.label}
                  </span>
                  <span className="text-muted-foreground">
                    {MATCH_WEIGHTS[f.category as keyof typeof MATCH_WEIGHTS] != null
                      ? `${Math.round(MATCH_WEIGHTS[f.category as keyof typeof MATCH_WEIGHTS] * 100)}%`
                      : ''}
                  </span>
                </div>
                <Progress value={f.score} className={cn('h-1.5', !f.is_positive && 'opacity-70')} />
                <span className="text-xs text-muted-foreground">{f.score}/100</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="factors">
        <TabsList className="w-full justify-start flex-wrap h-auto">
          <TabsTrigger value="factors">Score breakdown</TabsTrigger>
          <TabsTrigger value="requirements">Requirements check</TabsTrigger>
          <TabsTrigger value="why-not">Why not recommended</TabsTrigger>
        </TabsList>

        {/* Factor-level evidence */}
        <TabsContent value="factors" className="space-y-3 mt-4">
          {positiveFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-success-600">
                <ThumbsUp className="h-4 w-4" /> Working in your favor
              </h4>
              {positiveFactors.map((f) => (
                <div key={f.category} className="flex gap-3 rounded-lg border p-3 bg-success-50/40">
                  <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {weightLabels[f.category] ?? f.label} — {f.score}/100
                    </p>
                    <p className="text-muted-foreground mt-0.5">{f.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {negativeFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-danger-600">
                <ThumbsDown className="h-4 w-4" /> Pulling your score down
              </h4>
              {negativeFactors.map((f) => (
                <div key={f.category} className="flex gap-3 rounded-lg border p-3 bg-danger-50/40">
                  <XCircle className="h-4 w-4 text-danger-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {weightLabels[f.category] ?? f.label} — {f.score}/100
                    </p>
                    <p className="text-muted-foreground mt-0.5">{f.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requirement-by-requirement check with evidence spans */}
        <TabsContent value="requirements" className="space-y-2 mt-4">
          {result.evaluations.map((e) => (
            <div key={e.requirement.id} className={cn('rounded-lg border p-3', e.passed ? 'bg-success-50/40' : 'bg-danger-50/40')}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-2 flex-wrap">
                    {e.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-success-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-danger-600" />
                    )}
                    {requirementLabel(e.requirement)}
                    <Badge variant={e.requirement.is_hard_requirement ? 'destructive' : 'secondary'} className="text-[10px]">
                      {e.requirement.is_hard_requirement ? 'hard' : 'soft'}
                    </Badge>
                  </p>
                  <p className="text-muted-foreground mt-1">Your profile: {e.actual ?? 'not provided'}</p>
                  {e.requirement.evidence_span && (
                    <p className="mt-2 text-xs italic text-muted-foreground flex gap-1.5">
                      <Quote className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      Source evidence: &ldquo;{e.requirement.evidence_span}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">weight {Math.round(e.requirement.weight * 100)}%</span>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            Hard requirements are pass/fail gates from the scholarship source. Soft requirements adjust the weighted score.
          </div>
        </TabsContent>

        {/* Why not recommended */}
        <TabsContent value="why-not" className="mt-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              {score.score >= 70 ? 'What could still hold you back' : 'Why this ranks lower for you'}
            </h4>
            {whyNot.map((reason, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-muted-foreground">{reason}</p>
              </div>
            ))}
            <Separator />
            <p className="text-xs text-muted-foreground">
              This analysis is deterministic: it comes from the same structured requirements and profile facts that produced the
              score above — not from a language model.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}