import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Database, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/scholar/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-state";
import { scholarships } from "@/lib/scholarship-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console | ScholarMatch AI" },
      {
        name: "description",
        content: "Review scholarship freshness, AI quality and platform activity.",
      },
    ],
  }),
  component: Admin,
});

function Admin() {
  const session = useSession();
  const canReview = session?.role === "admin" || session?.role === "reviewer";
  const [submission, setSubmission] = useState({ name: "", source: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const metrics: [LucideIcon, string, string][] = [
    [Database, `${scholarships.length}`, "Published scholarships"],
    [Users, "3", "Demo accounts"],
    [Activity, "98.4%", "AI response validity"],
    [ShieldCheck, "100%", "Source checks passing"],
  ];

  return (
    <AppShell
      title="Admin console"
      subtitle="Operational view for scholarship quality and AI trust."
    >
      {!canReview ? (
        <Card className="glass-card border-flare-200 bg-brand-50/90">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-brand-900">Admin access required</p>
            <p className="mt-1 text-sm text-brand-500">
              Sign in with the admin test account to view platform operations.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-leaf-800"
            >
              Return to dashboard <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([Icon, value, label]) => (
              <Card key={label as string} className="glass-card border-brand-200/80 bg-brand-50/90">
                <CardContent className="p-5">
                  <Icon className="size-5 text-leaf-700" />
                  <p className="metric mt-4 text-2xl font-bold text-brand-900">{value}</p>
                  <p className="mt-1 text-xs text-brand-500">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="glass-card border-brand-200/80 bg-brand-50/90">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-brand-900">Source freshness</h2>
                  <Badge className="rounded-full bg-leaf-100 text-[10px] text-leaf-800">
                    Healthy
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-600">
                  All demo records have an official source URL and a review state. Backend ingestion
                  will replace this fixture with scholarship_versions and change detection.
                </p>
                <Link
                  to="/deadlines"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-leaf-800"
                >
                  Review deadline data <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card border-brand-200/80 bg-brand-50/90">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-brand-900">AI evaluation snapshot</h2>
                  <Badge className="rounded-full bg-brand-100 text-[10px] text-brand-700">
                    Fixture data
                  </Badge>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-xs text-brand-700">
                  <div className="flex justify-between">
                    <span>Citation grounding</span>
                    <span className="metric">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schema-valid responses</span>
                    <span className="metric">98.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median response time</span>
                    <span className="metric">1.8s</span>
                  </div>
                </div>
                <Link
                  to="/copilot"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-leaf-800"
                >
                  Open Copilot preview <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card className="glass-card border-brand-200/80 bg-brand-50/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-brand-900">
                  Community submission queue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-white/35 p-3">
                  <span>
                    <span className="block text-xs font-semibold text-brand-800">
                      Global Korea Scholarship
                    </span>
                    <span className="block text-[11px] text-brand-500">
                      Submitted 2 hours ago · source pending
                    </span>
                  </span>
                  <Badge className="rounded-full bg-flare-50 text-[10px] text-flare-800">
                    Review
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-white/35 p-3">
                  <span>
                    <span className="block text-xs font-semibold text-brand-800">
                      Orange Knowledge Programme
                    </span>
                    <span className="block text-[11px] text-brand-500">
                      Submitted yesterday · requirements pending
                    </span>
                  </span>
                  <Badge className="rounded-full bg-brand-100 text-[10px] text-brand-700">
                    Queued
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-brand-200/80 bg-brand-50/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-brand-900">
                  Submit a scholarship for review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Input
                  value={submission.name}
                  onChange={(event) =>
                    setSubmission((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Scholarship name"
                  aria-label="Scholarship name"
                />
                <Input
                  value={submission.source}
                  onChange={(event) =>
                    setSubmission((current) => ({ ...current, source: event.target.value }))
                  }
                  placeholder="Official source URL"
                  aria-label="Official source URL"
                />
                <Textarea
                  value={submission.notes}
                  onChange={(event) =>
                    setSubmission((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="What should reviewers verify?"
                  aria-label="Submission notes"
                />
                <Button
                  onClick={() => setSubmitted(true)}
                  disabled={!submission.name || !submission.source}
                  className="h-10 rounded-lg text-sm font-semibold"
                >
                  Send to review queue
                </Button>
                {submitted ? (
                  <p className="text-xs font-semibold text-leaf-800">
                    Submission captured in the frontend queue preview.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
