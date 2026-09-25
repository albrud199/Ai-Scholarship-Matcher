'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { seedApplications, seedScholarships, seedProfile } from '@/lib/mock-data';
import { computeReadiness, generateBestNextActions, getDeadlineRisk } from '@/lib/readiness';
import { getDaysUntil, getScoreColor, cn } from '@/lib/utils';
import type { BestNextAction } from '@/types';
import {
  Zap,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  MessageSquareQuote,
  UserPlus,
  Languages,
  Briefcase,
  ArrowRight,
  X,
} from 'lucide-react';

const ACTION_ICONS: Record<BestNextAction['action_type'], React.ComponentType<{ className?: string }>> = {
  upload_document: FileText,
  complete_sop: MessageSquareQuote,
  request_reference: UserPlus,
  improve_language_score: Languages,
  add_experience: Briefcase,
  meet_deadline: Calendar,
};

const RISK_BADGE: Record<BestNextAction['deadline_risk'], { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  low: { label: 'Low risk', variant: 'success' },
  medium: { label: 'Medium risk', variant: 'warning' },
  high: { label: 'High risk', variant: 'destructive' },
};

export default function ReadinessPage() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  const scholarshipById = useMemo(
    () => Object.fromEntries(seedScholarships.map((s) => [s.id, s])),
    []
  );

  const readinessByApp = useMemo(
    () => seedApplications.map((app) => ({ app, readiness: computeReadiness(app, scholarshipById[app.scholarship_id], seedProfile) })),
    [scholarshipById]
  );

  const actions = useMemo(
    () => generateBestNextActions(seedApplications, scholarshipById, seedProfile),
    [scholarshipById]
  );

  const visibleActions = actions.filter((a) => !dismissed.includes(a.id) && !completed.includes(a.id));
  const best = visibleActions[0];
  const others = visibleActions.slice(1, 4);

  const avgReadiness = Math.round(
    readinessByApp.reduce((acc, r) => acc + r.readiness.overall_score, 0) / Math.max(1, readinessByApp.length)
  );

  const bestAppReadiness = readinessByApp.find((r) => r.app.id === best?.application_id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Readiness &amp; Best Next Action</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Exactly one recommendation at a time — ranked by impact, effort, deadline risk, and reuse across applications.
        </p>
      </div>

      {/* Best Next Action — the signature card */}
      {best ? (
        <Card className="border-primary/40 bg-gradient-to-br from-primary-50 to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge className="gap-1.5 py-1 px-2.5">
                <Zap className="h-3.5 w-3.5" /> Best Next Action
              </Badge>
              <div className="flex items-center gap-2">
                {(() => {
                  const RiskBadge = RISK_BADGE[best.deadline_risk];
                  return <Badge variant={RiskBadge.variant} className="text-[10px]">{RiskBadge.label}</Badge>;
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                {(() => {
                  const Icon = ACTION_ICONS[best.action_type];
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold leading-snug">{best.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{best.description}</p>
              </div>
            </div>

            {/* Impact metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-card border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-success-600" /> Impact
                </p>
                <p className="text-lg font-bold mt-0.5">+{best.impact_score} pts</p>
              </div>
              <div className="rounded-lg bg-card border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-warning-600" /> Effort
                </p>
                <p className="text-lg font-bold mt-0.5">~{best.effort_minutes} min</p>
              </div>
              <div className="rounded-lg bg-card border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-primary" /> Reuse
                </p>
                <p className="text-lg font-bold mt-0.5">{best.affects_applications} app{best.affects_applications === 1 ? '' : 's'}</p>
              </div>
              <div className="rounded-lg bg-card border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-danger-600" /> Deadline
                </p>
                <p className="text-lg font-bold mt-0.5">
                  {(() => {
                    const sch = scholarshipById[seedApplications.find((a) => a.id === best.application_id)?.scholarship_id ?? ''];
                    return sch ? `${getDaysUntil(sch.deadline)}d` : '—';
                  })()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setCompleted((c) => [...c, best.id])}>
                Mark as done <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setDismissed((d) => [...d, best.id])}>
                Not now <X className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-success-600 mx-auto mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No pending actions — your applications are in good shape.</p>
          </CardContent>
        </Card>
      )}

      {/* Up next + readiness per application */}
      <Tabs defaultValue="readiness">
        <TabsList>
          <TabsTrigger value="readiness">Readiness by application</TabsTrigger>
          <TabsTrigger value="queue">Up next ({others.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('flex flex-col items-center justify-center rounded-xl px-4 py-2', getScoreColor(avgReadiness))}>
                <span className="text-2xl font-bold leading-none">{avgReadiness}</span>
                <span className="text-[10px] font-medium mt-0.5">avg / 100</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">Average readiness across {readinessByApp.length} applications</p>
                <p className="text-muted-foreground">
                  Readiness feeds 10% of every match score and updates when documents, SOP, or references change.
                </p>
              </div>
            </CardContent>
          </Card>

          {readinessByApp.map(({ app, readiness }) => {
            const sch = scholarshipById[app.scholarship_id];
            const risk = getDeadlineRisk(getDaysUntil(sch.deadline));
            return (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base">{sch?.name ?? app.scholarship_id}</CardTitle>
                      <CardDescription>
                        Deadline in {getDaysUntil(sch.deadline)} days ·{' '}
                        <span className={cn(risk === 'high' ? 'text-danger-600' : risk === 'medium' ? 'text-warning-600' : 'text-success-600', 'font-medium')}>
                          {risk} risk
                        </span>
                      </CardDescription>
                    </div>
                    <div className={cn('flex flex-col items-center justify-center rounded-lg px-3 py-1.5', getScoreColor(readiness.overall_score))}>
                      <span className="text-lg font-bold leading-none">{readiness.overall_score}</span>
                      <span className="text-[10px]">/ 100</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {readiness.components.map((c) => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-1.5">
                          {c.status === 'complete' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                          ) : c.status === 'missing' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-danger-600" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-warning-600" />
                          )}
                          {c.name}
                        </span>
                        <span className="text-muted-foreground">
                          {c.score}/{c.max_score} · weight {Math.round(c.weight * 100)}%
                        </span>
                      </div>
                      <Progress value={(c.score / c.max_score) * 100} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">{c.details}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="queue" className="mt-4 space-y-3">
          {others.map((action) => {
            const Icon = ACTION_ICONS[action.action_type];
            const RiskBadge = RISK_BADGE[action.deadline_risk];
            return (
              <Card key={action.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-100 text-secondary-foreground flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <TrendingUp className="h-3 w-3 text-success-600" /> +{action.impact_score}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Clock className="h-3 w-3 text-warning-600" /> ~{action.effort_minutes}m
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Users className="h-3 w-3 text-primary" /> {action.affects_applications} app{action.affects_applications === 1 ? '' : 's'}
                      </Badge>
                      <Badge variant={RiskBadge.variant} className="text-[10px]">{RiskBadge.label}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setDismissed((d) => [...d, action.id])} aria-label="Dismiss action">
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {others.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nothing else queued — complete the best action first.</p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            Completing the top action automatically promotes the next-highest ranked one.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}