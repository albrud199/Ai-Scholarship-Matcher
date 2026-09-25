'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { seedProfile } from '@/lib/mock-data';
import { Bell, Globe, Trash2, ShieldCheck, Info } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const toggles = [
    { label: 'Email alerts', description: 'Match changes and new scholarships in your field', value: emailAlerts, set: setEmailAlerts },
    { label: 'Deadline reminders', description: '7, 3, and 1 day before each application deadline', value: deadlineAlerts, set: setDeadlineAlerts },
    { label: 'Weekly digest', description: 'A Sunday summary of readiness progress and new matches', value: weeklyDigest, set: setWeeklyDigest },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Account preferences and data controls.</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </CardTitle>
          <CardDescription>Only product-relevant emails — no marketing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {toggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={t.value}
                aria-label={t.label}
                onClick={() => t.set(!t.value)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${t.value ? 'bg-primary' : 'bg-input'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${t.value ? 'translate-x-4' : ''}`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Region */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Region &amp; language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Display language</p>
              <p className="text-xs text-muted-foreground">English (US) — more languages planned in the backlog.</p>
            </div>
            <Badge variant="secondary">English</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Privacy &amp; data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Your documents live in a private storage bucket with row-level security. AI verification runs on uploaded
              files only; chat history is stored locally on this device.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-muted-foreground">{seedProfile.full_name} · profile created {new Date(seedProfile.created_at).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDelete(!showDelete)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete account
            </Button>
          </div>
          {showDelete && (
            <div className="rounded-lg border border-destructive/40 bg-danger-50 p-3">
              <p className="text-sm font-medium text-danger-600">This will permanently delete your profile, applications, and documents.</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="destructive" onClick={() => setShowDelete(false)}>Confirm delete</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">ScholarMatch AI · v1.0.0 · deterministic matching, grounded AI, evidence-based decisions.</p>
      </div>
    </DashboardShell>
  );
}