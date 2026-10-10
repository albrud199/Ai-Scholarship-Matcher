'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  fetchCatalogScholarships,
  TrackerApplication,
} from '@/lib/applications';
import { getDaysUntil } from '@/lib/utils';
import { Plus, Trash2, CalendarClock, Loader2 } from 'lucide-react';

const STATUS_OPTIONS: TrackerApplication['status'][] = [
  'draft',
  'in_progress',
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn',
];

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-secondary-100 text-secondary-700',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-primary-100 text-primary-700',
  under_review: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-purple-100 text-purple-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function TrackerPage() {
  const [apps, setApps] = useState<TrackerApplication[]>([]);
  const [catalog, setCatalog] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newScholarshipId, setNewScholarshipId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsData, catalogData] = await Promise.all([fetchApplications(), fetchCatalogScholarships()]);
      setApps(appsData);
      setCatalog(catalogData.map((s) => ({ id: s.id, name: s.name })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!newScholarshipId) return;
    setAdding(true);
    try {
      await createApplication(newScholarshipId);
      setNewScholarshipId('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add application (is it already tracked?)');
    } finally {
      setAdding(false);
    }
  };

  const changeStatus = async (id: string, status: TrackerApplication['status']) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await updateApplicationStatus(id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
      await load();
    }
  };

  const remove = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteApplication(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track every scholarship application from draft to decision.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={newScholarshipId} onValueChange={setNewScholarshipId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Pick a scholarship…" />
            </SelectTrigger>
            <SelectContent>
              {catalog.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={!newScholarshipId || adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your applications…
        </div>
      ) : apps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No applications yet</p>
            <p className="text-sm mt-1">Pick a scholarship above to start tracking your first application.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((a) => {
            const days = a.scholarship?.deadline ? getDaysUntil(a.scholarship.deadline) : null;
            const urgent = days != null && days <= 30;
            return (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {a.scholarship?.name ?? 'Unknown scholarship'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete application to ${a.scholarship?.name ?? 'scholarship'}`}
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {a.scholarship?.deadline && (
                    <p className={`flex items-center gap-1 text-xs ${urgent ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      <CalendarClock className="h-3.5 w-3.5" />
                      Deadline {fmtDate(a.scholarship.deadline)}
                      {days != null && ` — ${days} day${days === 1 ? '' : 's'} left`}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLOR[a.status] ?? ''}>{a.status.replace(/_/g, ' ')}</Badge>
                    <div className="ml-auto w-32">
                      <Select value={a.status} onValueChange={(v) => changeStatus(a.id, v as TrackerApplication['status'])}>
                        <SelectTrigger className="h-8 text-xs" aria-label="Change status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {a.scholarship?.application_url && (
                    <a
                      href={a.scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline underline-offset-2"
                    >
                      Open application page ↗
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
