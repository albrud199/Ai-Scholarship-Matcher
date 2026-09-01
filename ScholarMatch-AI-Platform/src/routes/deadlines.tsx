import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { DaysBadge, UrgencyBadge } from "@/components/scholar/primitives";
import { scholarships } from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";
import { BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/deadlines")({
  head: () => ({
    meta: [
      { title: "Scholarship Deadlines & Alerts | ScholarMatch AI" },
      {
        name: "description",
        content:
          "A prioritised timeline of every scholarship deadline with urgency levels and 30/14/7-day reminder alerts.",
      },
      { property: "og:title", content: "Scholarship Deadlines | ScholarMatch AI" },
      {
        property: "og:description",
        content: "Track and prioritise upcoming scholarship deadlines in one timeline.",
      },
    ],
  }),
  component: Deadlines,
});

const alerts = [
  { window: "30-day", text: "Erasmus Mundus consortium selection opens", tone: "brand" },
  { window: "14-day", text: "DAAD EPOS document upload window closing", tone: "brand" },
  { window: "7-day", text: "Chevening final submission reminder", tone: "flare" },
  { window: "Final day", text: "Chevening portal closes 12:00 GMT", tone: "flare" },
];

function Deadlines() {
  const [sort, setSort] = useState("soonest");
  const list = [...scholarships].sort((a, b) =>
    sort === "soonest"
      ? a.daysLeft - b.daysLeft
      : sort === "match"
        ? b.match - a.match
        : b.readiness - a.readiness,
  );

  return (
    <AppShell
      title="Deadlines"
      subtitle="Every open application ordered by urgency, with preparation effort estimates."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {alerts.map((a) => (
          <Card
            key={a.window}
            className={cn(
              "glass-card border-brand-200/80 bg-brand-50/88",
              a.tone === "flare" ? "border-flare-200" : "",
            )}
          >
            <CardContent className="flex gap-3 p-4">
              <BellRing
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  a.tone === "flare" ? "text-flare-600" : "text-brand-500",
                )}
              />
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs font-semibold text-brand-800">{a.window} reminder</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 rounded-full px-2 text-[10px]",
                      a.tone === "flare"
                        ? "bg-flare-100 text-flare-800"
                        : "bg-brand-200 text-brand-800",
                    )}
                  >
                    Alert
                  </Badge>
                </div>
                <p className="text-[11px] text-brand-500">{a.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex justify-end">
        <div className="min-w-44">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="rounded-[10px] border-brand-200 bg-brand-50 text-xs font-medium text-brand-700">
              <SelectValue placeholder="Sort deadlines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soonest">Sort: Soonest first</SelectItem>
              <SelectItem value="match">Sort: Match score</SelectItem>
              <SelectItem value="readiness">Sort: Readiness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ol className="relative flex flex-col gap-3 border-l border-brand-300 pl-6">
        {list.map((s) => (
          <li key={s.id} className="relative">
            <span
              className={cn(
                "absolute top-6 -left-[31px] size-3 rounded-full ring-4 ring-brand-100",
                s.daysLeft <= 14
                  ? "bg-flare-600"
                  : s.daysLeft <= 30
                    ? "bg-brand-500"
                    : "bg-leaf-500",
              )}
            />
            <Link
              to="/scholarship/$id"
              params={{ id: s.id }}
              className="glass-card lift flex flex-wrap items-center gap-4 border-brand-200/80 bg-brand-50/88 p-4"
            >
              <span className="text-2xl">{s.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-900">{s.name}</p>
                <p className="text-xs text-brand-500">
                  {s.country} · {s.amountLabel}
                </p>
              </div>
              <span className="metric text-xs text-brand-600">{s.match}% match</span>
              <span className="metric text-xs text-brand-600">{s.readiness}% ready</span>
              <UrgencyBadge daysLeft={s.daysLeft} />
              <DaysBadge daysLeft={s.daysLeft} />
            </Link>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
