import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import {
  DaysBadge,
  FundingBadge,
  ProgressBar,
  ScoreRing,
  StatusIcon,
  StatusPill,
  UrgencyBadge,
} from "@/components/scholar/primitives";
import { docCompletion, getScholarship, scholarships } from "@/lib/scholarship-data";
import { ArrowLeft, Bookmark, CheckCircle2, ExternalLink, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applicationRecord,
  applicationStatuses,
  useApplicationState,
} from "@/lib/application-state";

export const Route = createFileRoute("/scholarship/$id")({
  loader: ({ params }) => {
    const s = getScholarship(params.id);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Scholarship";
    return {
      meta: [
        { title: `${name} — Match, readiness & documents | ScholarMatch AI` },
        {
          name: "description",
          content: `AI match score, success probability, readiness breakdown and document checklist for the ${name}.`,
        },
        { property: "og:title", content: `${name} | ScholarMatch AI` },
        {
          property: "og:description",
          content: `See your eligibility fit, readiness score and required documents for the ${name}.`,
        },
      ],
    };
  },
  component: Detail,
});

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-card p-5", className)}>
      <h2 className="mb-4 text-base font-bold text-brand-900">{title}</h2>
      {children}
    </section>
  );
}

function Detail() {
  const s = Route.useLoaderData();
  const { applications, updateApplication } = useApplicationState();
  const application = applicationRecord(applications, s);
  const completion = docCompletion(s);
  const related = scholarships.filter((r) => r.id !== s.id).slice(0, 3);
  const nextAction = s.documents.find((document) => document.status !== "Done") ?? null;

  return (
    <AppShell title={s.name} subtitle={`${s.provider} · ${s.country}`}>
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="glass-card mb-6 flex flex-wrap items-center gap-4 p-5">
        <span className="text-4xl leading-none">{s.flag}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FundingBadge type={s.fundingType} />
            <UrgencyBadge daysLeft={s.daysLeft} />
            <DaysBadge daysLeft={s.daysLeft} />
          </div>
          <p className="metric mt-2 text-2xl text-brand-900">${s.amount.toLocaleString()}</p>
          <p className="text-sm text-brand-500">{s.amountLabel}</p>
        </div>
        <a
          href={s.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-leaf-600"
        >
          Apply now <ExternalLink className="size-4" />
        </a>
      </div>

      <div className="glass-card mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
            {application.status === "Submitted" || application.status === "Accepted" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-900">Application workspace</p>
            <p className="text-xs text-brand-500">
              {nextAction ? `Next: ${nextAction.name}` : "Your document checklist is complete."}
            </p>
          </div>
        </div>
        <select
          value={application.status}
          onChange={(event) =>
            updateApplication(s.id, {
              status: event.target.value as (typeof applicationStatuses)[number],
              saved: true,
            })
          }
          aria-label="Application status"
          className="h-9 rounded-[10px] border border-brand-200 bg-brand-50/80 px-3 text-xs font-semibold text-brand-800 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        >
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => updateApplication(s.id, { saved: !application.saved })}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-xs font-semibold transition-colors",
            application.saved
              ? "border-leaf-400 bg-leaf-100 text-leaf-800"
              : "border-brand-200 bg-brand-50/80 text-brand-600 hover:border-leaf-400 hover:text-leaf-700",
          )}
        >
          <Bookmark className={cn("size-4", application.saved && "fill-current")} />
          {application.saved ? "Saved" : "Save application"}
        </button>
      </div>

      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-brand-700">{s.description}</p>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Match score">
          <div className="flex items-center gap-4">
            <ScoreRing value={s.match} size={92} />
            <p className="text-xs leading-relaxed text-brand-600">
              Your profile aligns strongly on academics and leadership, the two heaviest factors in
              this programme's selection model.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {s.scoreBreakdown.map((f) => (
              <ProgressBar key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </Panel>

        <Panel title="Success probability">
          <p className="metric text-4xl text-flare-600">{s.successProbability}%</p>
          <p className="mt-1 text-xs text-brand-500">
            Confidence interval {s.confidenceLow}%–{s.confidenceHigh}%
          </p>
          <div className="relative mt-4 h-3 w-full rounded-full bg-brand-200">
            <div
              className="absolute h-3 rounded-full bg-flare-200"
              style={{
                left: `${s.confidenceLow}%`,
                width: `${s.confidenceHigh - s.confidenceLow}%`,
              }}
            />
            <div
              className="absolute -top-1 h-5 w-1 rounded-full bg-flare-700"
              style={{ left: `${s.successProbability}%` }}
            />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {s.contributingFactors.map((f) => (
              <li key={f} className="flex gap-2 text-xs text-brand-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-flare-400" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-[10px] bg-brand-100 p-3 text-[11px] text-brand-500">
            <Info className="size-4 shrink-0" />
            Estimated from historical outcomes of comparable profiles. Indicative only — not a
            guarantee of any decision.
          </p>
        </Panel>

        <Panel title="Readiness score">
          <div className="flex items-center gap-4">
            <ScoreRing value={s.readiness} size={92} tone="brand" />
            <p className="text-xs leading-relaxed text-brand-600">
              Weighted from document completeness (40%), academics (35%) and experience (25%).
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {s.readinessBreakdown.map((f) => (
              <ProgressBar
                key={f.label}
                label={`${f.label} · ${f.weight}% weight`}
                value={f.value}
                tone="brand"
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Recommended next actions">
          <div className="flex flex-col gap-3">
            {s.recommendations.map((r) => (
              <div key={r.title} className="rounded-[12px] border border-brand-200 bg-brand-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-brand-900">{r.title}</p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      r.priority === "High"
                        ? "bg-flare-50 text-flare-800"
                        : r.priority === "Medium"
                          ? "bg-brand-200 text-brand-800"
                          : "bg-leaf-100 text-leaf-900",
                    )}
                  >
                    {r.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-500">{r.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Document checklist">
          <ProgressBar value={completion} label="Completion" />
          <ul className="mt-4 flex flex-col divide-y divide-brand-200">
            {s.documents.map((d) => (
              <li key={d.name} className="flex items-center gap-3 py-3">
                <StatusIcon status={d.status} />
                <span className="min-w-0 flex-1 truncate text-sm text-brand-800">{d.name}</span>
                <span className="metric text-[11px] text-brand-400">{d.type}</span>
                <StatusPill status={d.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <h2 className="mb-3 text-base font-bold text-brand-900">Similar opportunities</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map((r) => (
          <Link
            key={r.id}
            to="/scholarship/$id"
            params={{ id: r.id }}
            className="glass-card lift flex items-center gap-3 p-4"
          >
            <span className="text-2xl">{r.flag}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-brand-900">{r.name}</span>
              <span className="metric block text-xs text-leaf-700">{r.match}% match</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
