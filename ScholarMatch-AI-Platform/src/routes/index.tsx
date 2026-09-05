import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { ScholarshipCard } from "@/components/scholar/scholarship-card";
import { SectionHeading } from "@/components/scholar/primitives";
import { buckets, notifications, scholarships, student } from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Target, Gauge, FileClock, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { applicationRecord, useApplicationState } from "@/lib/application-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScholarMatch AI — Dashboard & Scholarship Matches" },
      {
        name: "description",
        content:
          "Personalised scholarship matches with AI match scores, readiness ratings and deadline urgency for international students.",
      },
      { property: "og:title", content: "ScholarMatch AI — Dashboard" },
      {
        property: "og:description",
        content:
          "Discover funded scholarships ranked by match score, readiness and deadline urgency.",
      },
    ],
  }),
  component: Dashboard,
});

const countries = ["All", ...Array.from(new Set(scholarships.map((s) => s.country)))];
const fundings = ["All", "Full", "Partial"] as const;

function Dashboard() {
  const [country, setCountry] = useState("All");
  const [funding, setFunding] = useState<string>("All");
  const [sort, setSort] = useState("match");
  const { applications } = useApplicationState();

  const filtered = useMemo(() => {
    const list = scholarships.filter(
      (s) =>
        (country === "All" || s.country === country) &&
        (funding === "All" || s.fundingType === funding),
    );
    return [...list].sort((a, b) =>
      sort === "match"
        ? b.match - a.match
        : sort === "deadline"
          ? a.daysLeft - b.daysLeft
          : b.amount - a.amount,
    );
  }, [country, funding, sort]);

  const avgMatch = Math.round(
    scholarships.reduce((sum, s) => sum + s.match, 0) / scholarships.length,
  );
  const nextDeadline = Math.min(...scholarships.map((s) => s.daysLeft));
  const tracked = scholarships
    .filter((scholarship) => {
      const application = applicationRecord(applications, scholarship);
      return application.saved || application.status !== "Saved";
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <AppShell
      title={`Good evening, ${student.name.split(" ")[0]}`}
      subtitle={`${scholarships.length} scholarships matched to your ${student.degree} profile · GPA ${student.gpa} · IELTS ${student.ielts}`}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card lift border-brand-200/80 bg-brand-50/90">
          <CardContent className="flex h-32 flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
                Total Matched
              </span>
              <Target className="size-5 text-leaf-600" />
            </div>
            <span className="metric text-[32px] font-bold leading-tight text-brand-900">
              {scholarships.length}
            </span>
          </CardContent>
        </Card>

        <Card className="glass-card lift group relative overflow-hidden border-brand-200/80 bg-brand-50/90">
          <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-leaf-400/20 blur-xl transition-all group-hover:bg-leaf-400/30" />
          <CardContent className="relative z-10 flex h-32 flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
                Average Match
              </span>
              <Gauge className="size-5 text-leaf-600" />
            </div>
            <span className="metric text-[32px] font-bold leading-tight text-brand-900">
              {avgMatch}
              <span className="text-xl font-medium text-brand-500">%</span>
            </span>
          </CardContent>
        </Card>

        <Card className="glass-card lift border-brand-200/80 bg-brand-50/90">
          <CardContent className="flex h-32 flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
                In Progress
              </span>
              <FileClock className="size-5 text-brand-400" />
            </div>
            <span className="metric text-[32px] font-bold leading-tight text-brand-900">3</span>
          </CardContent>
        </Card>

        <Card className="glass-card lift border-l-4 border-l-flare-500 border-brand-200/80 bg-brand-50/90">
          <CardContent className="flex h-32 flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
                Next Deadline
              </span>
              <Timer className="size-5 text-flare-600" />
            </div>
            <span className="metric text-[32px] font-bold leading-tight text-flare-600">
              {nextDeadline}d
            </span>
          </CardContent>
        </Card>
      </div>

      <section className="glass-card mb-8 border-flare-200/80 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-flare-700 uppercase">
              <Sparkles className="size-3.5" /> Best next action
            </p>
            <h2 className="mt-1 text-xl font-bold text-brand-900">Finish your Chevening SOP</h2>
          </div>
          <Link
            to="/copilot"
            className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-800 hover:text-leaf-900"
          >
            Ask Copilot <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-brand-600">
          Add the missing leadership evidence to your draft for an estimated +9 readiness points. It
          takes about 45 minutes and affects 6 open applications.
        </p>
        {tracked.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tracked.slice(0, 3).map((scholarship) => {
              const application = applicationRecord(applications, scholarship);
              const nextAction = scholarship.documents.find(
                (document) => document.status !== "Done",
              );
              return (
                <Link
                  key={scholarship.id}
                  to="/scholarship/$id"
                  params={{ id: scholarship.id }}
                  className="rounded-[12px] border border-white/70 bg-white/35 p-4 transition-colors hover:border-leaf-400 hover:bg-white/55"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-xl">{scholarship.flag}</span>
                      <p className="truncate text-sm font-bold text-brand-900">
                        {scholarship.name}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-brand-400" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-leaf-100 px-2.5 py-1 font-semibold text-leaf-800">
                      {application.status}
                    </span>
                    <span className="metric text-flare-700">{scholarship.daysLeft}d left</span>
                  </div>
                  <p className="mt-3 truncate text-xs text-brand-600">
                    {nextAction ? `Next: ${nextAction.name}` : "Checklist complete"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-[12px] border border-dashed border-brand-300 bg-white/25 p-4 text-sm text-brand-600">
            Save a scholarship to start a focused application workspace and see your next action
            here.
          </p>
        )}
      </section>

      <section className="glass-card mb-8 p-5">
        <SectionHeading
          title="Recent scholarship changes"
          hint="Freshness signals from your saved and matched opportunities"
        />
        <div className="grid gap-3 md:grid-cols-3">
          {notifications
            .filter(
              (notification) => notification.group === "Match" || notification.group === "Deadline",
            )
            .slice(0, 3)
            .map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl border border-brand-200 bg-white/30 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold text-brand-700">
                    {notification.group}
                  </span>
                  <span className="text-[10px] text-brand-400">{notification.time}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-brand-900">{notification.title}</p>
                <p className="mt-1 text-xs leading-5 text-brand-500">{notification.detail}</p>
              </div>
            ))}
        </div>
      </section>

      <div className="glass-card mb-8 flex flex-wrap items-center gap-2 p-3">
        <span className="px-1 text-xs font-semibold text-brand-500">Country</span>
        {countries.map((c) => (
          <Button
            key={c}
            onClick={() => setCountry(c)}
            className={cn(
              "h-8 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              country === c
                ? "border-leaf-500 bg-leaf-200 text-leaf-900"
                : "border-brand-200 bg-brand-50 text-brand-600 hover:border-brand-300",
            )}
            variant="outline"
            size="sm"
          >
            {c}
          </Button>
        ))}
        <span className="ml-2 px-1 text-xs font-semibold text-brand-500">Funding</span>
        {fundings.map((f) => (
          <Button
            key={f}
            onClick={() => setFunding(f)}
            className={cn(
              "h-8 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              funding === f
                ? "border-leaf-500 bg-leaf-200 text-leaf-900"
                : "border-brand-200 bg-brand-50 text-brand-600 hover:border-brand-300",
            )}
            variant="outline"
            size="sm"
          >
            {f}
          </Button>
        ))}
        <div className="ml-auto min-w-44">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 rounded-[10px] border-brand-200 bg-brand-50 text-xs font-medium text-brand-700">
              <SelectValue placeholder="Sort scholarships" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Sort: Match score</SelectItem>
              <SelectItem value="deadline">Sort: Deadline</SelectItem>
              <SelectItem value="amount">Sort: Award amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {buckets.map((bucket) => {
        const items = filtered.filter((s) => s.bucket === bucket);
        if (!items.length) return null;
        return (
          <section key={bucket} className="mb-10">
            <SectionHeading
              title={bucket}
              hint={`${items.length} opportunit${items.length === 1 ? "y" : "ies"} in this window`}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((s) => (
                <ScholarshipCard key={s.id} s={s} />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="glass-card p-8 text-center text-sm text-brand-500">
          No scholarships match these filters. Try widening your country or funding selection.
        </p>
      ) : null}
    </AppShell>
  );
}
