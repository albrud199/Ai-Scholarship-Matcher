'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScholarshipCard } from '@/components/scholarship-card';
import { seedScholarships, seedProfile, seedApplications } from '@/lib/mock-data';
import { rankScholarships } from '@/lib/matching';
import { computeReadiness, generateBestNextActions } from '@/lib/readiness';
import { getDaysUntil, getScoreColor, getScoreLabel, getDeadlineStatus, cn } from '@/lib/utils';
import {
  Target,
  Award,
  FileText,
  Calendar,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const matches = useMemo(() => rankScholarships(seedProfile, seedScholarships), []);
  const eligible = matches.filter((m) => m.score.eligibility_passed);
  const avgMatch = Math.round(eligible.reduce((a, m) => a + m.score.score, 0) / Math.max(1, eligible.length));
  const topMatches = matches.slice(0, 3);

  const scholarshipById = useMemo(() => Object.fromEntries(seedScholarships.map((s) => [s.id, s])), []);
  const readinessByApp = useMemo(
    () => seedApplications.map((app) => ({ app, readiness: computeReadiness(app, scholarshipById[app.scholarship_id], seedProfile) })),
    [scholarshipById]
  );
  const avgReadiness = Math.round(readinessByApp.reduce((a, r) => a + r.readiness.overall_score, 0) / Math.max(1, readinessByApp.length));

  const actions = useMemo(() => generateBestNextActions(seedApplications, scholarshipById, seedProfile), [scholarshipById]);
  const bestAction = actions[0];

  const upcoming = useMemo(
    () =>
      seedScholarships
        .filter((s) => s.status === 'active' && getDaysUntil(s.deadline) >= 0)
        .sort((a, b) => getDaysUntil(a.deadline) - getDaysUntil(b.deadline))
        .slice(0, 4),
    []
  );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {seedProfile.full_name.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s where your scholarship journey stands today.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" /> Update profile
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid min-w-0 grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="min-w-0">
          <CardContent className="p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Best match score</p>
                <p className={cn('text-2xl font-bold mt-1', getScoreColor(avgMatch).split(' ')[0])}>{avgMatch}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{getScoreLabel(avgMatch)} · {eligible.length} eligible</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Avg readiness</p>
                <p className="text-2xl font-bold mt-1">{avgReadiness}%</p>
                <Progress value={avgReadiness} className="h-1.5 mt-2" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold mt-1">{seedApplications.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {seedApplications.filter((a) => a.status === 'in_progress').length} in progress
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Next deadline</p>
                <p className="text-2xl font-bold mt-1">{upcoming[0] ? getDaysUntil(upcoming[0].deadline) : '—'}<span className="text-sm font-medium text-muted-foreground ml-1">days</span></p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]">{upcoming[0]?.name ?? 'None'}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best action + top matches */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        {/* Best Next Action teaser */}
        <div className="min-w-0 space-y-4">
          {bestAction && (
            <Card className="border-primary/40">
              <CardHeader className="pb-2">
                <Badge className="gap-1.5 w-fit py-1 px-2.5">
                  <Zap className="h-3.5 w-3.5" /> Best Next Action
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium leading-snug">{bestAction.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-warning-600" /> ~{bestAction.effort_minutes} min
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-success-600" /> +{bestAction.impact_score} readiness
                  </span>
                  <span>·</span>
                  <span>{bestAction.affects_applications} app{bestAction.affects_applications === 1 ? '' : 's'}</span>
                </div>
                <Button size="sm" asChild className="w-full">
                  <Link href="/dashboard/readiness">
                    View action <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/dashboard/scholarships">
                  <Search className="mr-2 h-4 w-4 text-primary" /> Discover scholarships
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/dashboard/documents">
                  <FileText className="mr-2 h-4 w-4 text-primary" /> Upload documents
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-4 w-4 text-primary" /> Ask the AI Copilot
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Top matches */}
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base">Your top matches</CardTitle>
                <CardDescription>Deterministic profile-fit scores, explainable on the Matches page.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0" asChild>
                <Link href="/dashboard/matches">
                  All matches <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMatches.map(({ score }, rank) => {
              const sch = seedScholarships.find((s) => s.id === score.scholarship_id);
              if (!sch) return null;
              return (
                <Link
                  key={score.scholarship_id}
                  href="/dashboard/matches"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/40 transition-colors"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">#{rank + 1}</span>
                  <div className={cn('flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 flex-shrink-0', getScoreColor(score.score))}>
                    <span className="text-base font-bold leading-none">{score.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sch.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {score.eligibility_passed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-success-600" /> Eligible
                        </>
                      ) : (
                        <>
                          <Award className="h-3 w-3 text-warning-600" /> Requirements gap
                        </>
                      )}
                      <span>· {sch.country}</span>
                      <span>· {getDeadlineStatus(sch.deadline) === 'urgent' ? 'closing soon' : `${getDaysUntil(sch.deadline)}d`}</span>
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming deadlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upcoming deadlines</CardTitle>
          <CardDescription>Verify details on the official source page before relying on them.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcoming.map((s) => {
              const days = getDaysUntil(s.deadline);
              const status = getDeadlineStatus(s.deadline);
              return (
                <div key={s.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.country}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={status === 'urgent' ? 'destructive' : status === 'soon' ? 'warning' : 'secondary'} className="text-[10px]">
                      {days} days
                    </Badge>
                    <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      source
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}