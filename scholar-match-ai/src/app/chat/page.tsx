'use client';

import Link from 'next/link';
import { ChatPanel } from '@/components/copilot-chat';
import { Button } from '@/components/ui/button';
import { GraduationCap, ShieldCheck, Info } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

export default function ChatPage() {
  return (
    <DashboardShell>
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl flex-col bg-secondary-50">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Copilot</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ask grounded questions about your scholarships and applications.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card border rounded-lg p-3 mb-4">
          <ShieldCheck className="h-4 w-4 text-success-600 flex-shrink-0 mt-0.5" />
          <p>
            Answers are retrieved from your scholarship records, profile, and applications at question time — every claim
            carries a numbered citation back to its source. The copilot cannot invent scholarship details it has not
            retrieved.
          </p>
        </div>

        <div className="flex min-h-[560px] flex-1 flex-col">
          <div className="flex-1 bg-card border rounded-xl shadow-card overflow-hidden flex flex-col">
            <ChatPanel />
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-muted-foreground mt-3 mb-2">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <p>History is stored locally on this device. This assistant provides information, not admission guarantees.</p>
        </div>
        </main>
      </div>
    </DashboardShell>
  );
}