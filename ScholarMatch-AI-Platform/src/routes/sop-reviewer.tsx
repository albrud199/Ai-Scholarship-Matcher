import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, FileText, History, Play, Sparkles } from "lucide-react";
import { AppShell } from "@/components/scholar/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/scholar/primitives";
import { scholarships } from "@/lib/scholarship-data";

export const Route = createFileRoute("/sop-reviewer")({
  head: () => ({
    meta: [
      { title: "AI SOP Reviewer | ScholarMatch AI" },
      {
        name: "description",
        content: "Review your statement of purpose against scholarship requirements.",
      },
    ],
  }),
  component: SopReviewer,
});

const sampleDraft =
  "My work in machine learning has shown me that technology is most valuable when it solves problems people face every day. At BUET, I studied computer science and published research on federated learning. I want to develop this work through a master's degree and return to Bangladesh with the skills to build trustworthy digital services.\n\nChevening would give me the academic network and leadership perspective to turn that goal into measurable impact. I have led student teams and learned that lasting change depends on listening, collaboration, and a clear plan for implementation.";

function SopReviewer() {
  const [draft, setDraft] = useState(sampleDraft);
  const [scholarshipId, setScholarshipId] = useState(scholarships[0]?.id ?? "");
  const [reviewed, setReviewed] = useState(false);
  const [version, setVersion] = useState(1);
  const selected =
    scholarships.find((scholarship) => scholarship.id === scholarshipId) ?? scholarships[0]!;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <AppShell
      title="SOP reviewer"
      subtitle="Strengthen one statement against the evidence and goals of your target scholarship."
    >
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-100/60 p-4 text-xs text-brand-600">
        <Sparkles className="size-5 shrink-0 text-leaf-700" />
        <p>
          This is the selected flagship feature. Reviews are shown as a structured draft preview
          until the backend AI Gateway is connected.
        </p>
        <Badge className="ml-auto shrink-0 rounded-full bg-brand-200 text-[10px] text-brand-700">
          Preview mode
        </Badge>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="glass-card border-brand-200/80 bg-brand-50/90">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-brand-900">
              <FileText className="size-4 text-leaf-700" /> Draft workspace
            </CardTitle>
            <span className="metric text-xs text-brand-500">
              {wordCount} words · v{version}
            </span>
          </CardHeader>
          <CardContent>
            <label className="mb-4 block text-xs font-semibold text-brand-700">
              Target scholarship
              <select
                value={scholarshipId}
                onChange={(event) => setScholarshipId(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-normal text-brand-900 outline-none focus:border-leaf-500"
              >
                {scholarships.map((scholarship) => (
                  <option key={scholarship.id} value={scholarship.id}>
                    {scholarship.name}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setReviewed(false);
              }}
              className="min-h-[360px] w-full resize-y rounded-xl border border-brand-200 bg-white/50 p-4 text-sm leading-7 text-brand-800 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
              aria-label="Statement of purpose draft"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-brand-500">
                Saved locally as a draft preview. Private persistence belongs in backend storage.
              </p>
              <Button
                onClick={() => {
                  setReviewed(true);
                  setVersion((current) => current + 1);
                }}
                className="h-10 rounded-lg text-sm font-semibold"
              >
                <Play className="size-4" /> Review draft
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="glass-card border-leaf-200 bg-brand-50/90">
            <CardContent className="p-5">
              <p className="text-[11px] font-bold tracking-wide text-leaf-800 uppercase">
                Alignment score
              </p>
              <p className="metric mt-2 text-4xl text-brand-900">
                {reviewed ? "82" : "--"}
                <span className="text-xl text-brand-500">/100</span>
              </p>
              <p className="mt-1 text-xs text-brand-500">
                Fit against {selected.name} goals and evidence.
              </p>
              {reviewed ? (
                <div className="mt-4 flex flex-col gap-3">
                  <ProgressBar label="Scholarship alignment" value={82} />
                  <ProgressBar label="Structure" value={76} tone="brand" />
                  <ProgressBar label="Readability" value={88} />
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-brand-100 p-3 text-xs text-brand-600">
                  Run a review to see structured feedback.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-brand-900">
                <History className="size-4" /> Version history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs text-brand-600">
              <div className="flex justify-between">
                <span>Current draft</span>
                <span className="metric">v{version} · now</span>
              </div>
              <div className="flex justify-between">
                <span>Initial draft</span>
                <span className="metric">v1 · preview</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {reviewed ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-900">
                <CheckCircle2 className="size-4 text-leaf-700" /> What works
              </p>
              <p className="mt-3 text-xs leading-5 text-brand-600">
                Your research evidence and return-home impact are concrete. The leadership thread
                connects naturally to the scholarship.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-flare-200 bg-brand-50/90">
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-900">
                <AlertCircle className="size-4 text-flare-600" /> Missing element
              </p>
              <p className="mt-3 text-xs leading-5 text-brand-600">
                Add one measurable outcome from your leadership work and name the specific community
                you will serve.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-brand-900">Next revision</p>
              <p className="mt-3 text-xs leading-5 text-brand-600">
                Replace broad phrases like “lasting change” with a time-bound plan, then read the
                transition between your research and Chevening goals aloud.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
