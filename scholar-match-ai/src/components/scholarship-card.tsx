'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDaysUntil, getDeadlineStatus, formatDateShort, getScoreColor, getScoreLabel, cn } from '@/lib/utils';
import { Calendar, ExternalLink, MapPin, Building2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Scholarship, MatchScore } from '@/types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  matchScore?: MatchScore;
  onAddApplication?: (scholarship: Scholarship) => void;
  isSaved?: boolean;
}

const providerTypeLabels: Record<Scholarship['provider_type'], string> = {
  government: 'Government',
  university: 'University',
  foundation: 'Foundation',
  corporate: 'Corporate',
  international_org: 'Intl. Organization',
};

export function ScholarshipCard({ scholarship, matchScore, onAddApplication, isSaved }: ScholarshipCardProps) {
  const days = getDaysUntil(scholarship.deadline);
  const status = getDeadlineStatus(scholarship.deadline);
  const score = matchScore?.score;

  return (
    <Card className="min-w-0 flex flex-col h-full hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug line-clamp-2">{scholarship.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{scholarship.provider}</span>
            </p>
          </div>
          {score != null && (
            <div className={cn('flex flex-col items-center justify-center rounded-lg px-3 py-2 flex-shrink-0', getScoreColor(score))}>
              <span className="text-xl font-bold leading-none">{score}</span>
              <span className="text-[10px] font-medium mt-0.5">{getScoreLabel(score)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary">{providerTypeLabels[scholarship.provider_type]}</Badge>
          <Badge variant="outline">
            <MapPin className="h-3 w-3 mr-1" />
            {scholarship.country}
          </Badge>
          <Badge variant="outline">{scholarship.degree_level.toUpperCase()}</Badge>
          <Badge
            variant={status === 'expired' ? 'destructive' : status === 'urgent' ? 'warning' : status === 'soon' ? 'info' : 'success'}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {status === 'expired' ? 'Expired' : `${days} days left`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{scholarship.description}</p>

        {matchScore && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Match preview
              </span>
              <span className={cn('font-semibold px-1.5 py-0.5 rounded', getScoreColor(matchScore.score))}>
                {matchScore.score}/100
              </span>
            </div>
            <Progress value={matchScore.score} className="h-1.5" />
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {matchScore.eligibility_passed ? (
                <span className="flex items-center gap-1 text-success-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Eligible
                </span>
              ) : (
                <span className="flex items-center gap-1 text-danger-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {matchScore.missing_hard_requirements.length} hard requirement(s) unmet
                </span>
              )}
              <span>Deterministic: academics · experience · language</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between pt-0 gap-2">
        <span className="min-w-0 text-xs text-muted-foreground">
          Deadline {formatDateShort(scholarship.deadline)} ·{' '}
          <a
            href={scholarship.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            source <ExternalLink className="h-3 w-3" />
          </a>
        </span>
        {onAddApplication && (
          <Button size="sm" variant={isSaved ? 'outline' : 'default'} onClick={() => onAddApplication(scholarship)} disabled={isSaved}>
            {isSaved ? 'Saved' : 'Add to my apps'}
          </Button>
        )}
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/dashboard/scholarships?id=${scholarship.id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}