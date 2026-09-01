import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { SectionHeading } from "@/components/scholar/primitives";
import {
  alternativeFunding,
  careerPathways,
  costModel,
  scholarships,
  totalCost,
} from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/funding")({
  head: () => ({
    meta: [
      { title: "Funding Gap Analyser & Career Pathways | ScholarMatch AI" },
      {
        name: "description",
        content:
          "Compare tuition and living costs against scholarship coverage, see your remaining funding gap and explore grants, loans and work-study options.",
      },
      { property: "og:title", content: "Funding Analysis | ScholarMatch AI" },
      {
        property: "og:description",
        content: "Model your study costs, scholarship coverage and remaining funding gap.",
      },
    ],
  }),
  component: Funding,
});

const money = (n: number) => `$${n.toLocaleString()}`;

function Funding() {
  const [selected, setSelected] = useState("chevening");
  const active = scholarships.find((s) => s.id === selected) ?? scholarships[0]!;
  const covered = Math.min(active.amount, totalCost);
  const gap = Math.max(totalCost - covered, 0);
  const pct = Math.round((covered / totalCost) * 100);

  const costRows = [
    { label: "Tuition", value: costModel.tuition },
    { label: "Living expenses", value: costModel.living },
    { label: "Travel", value: costModel.travel },
    { label: "Visa & insurance", value: costModel.visaInsurance },
  ];

  return (
    <AppShell
      title="Funding"
      subtitle="Estimated one-year cost of study compared against scholarship coverage."
    >
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="glass-card border-brand-200/80 bg-brand-50/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-brand-900">Cost breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
          <ul className="divide-y divide-brand-200">
            {costRows.map((c) => (
              <li key={c.label} className="flex items-center justify-between py-3 text-sm">
                <span className="text-brand-700">{c.label}</span>
                <span className="metric text-brand-900">{money(c.value)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between pt-3 text-sm font-bold">
              <span className="text-brand-900">Total</span>
              <span className="metric text-brand-900">{money(totalCost)}</span>
            </li>
          </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-brand-200/80 bg-brand-50/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-brand-900">Coverage & gap</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="mb-4 h-10 rounded-[10px] border-brand-200 bg-brand-50 text-sm text-brand-800">
                <SelectValue placeholder="Select scholarship" />
              </SelectTrigger>
              <SelectContent>
                {scholarships.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {money(s.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          <div className="flex h-6 w-full overflow-hidden rounded-full bg-brand-200">
            <div
              className="h-full bg-leaf-500 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
            <div className="h-full flex-1 bg-flare-200" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="metric text-lg text-leaf-700">{money(covered)}</p>
              <p className="text-[11px] text-brand-500">Covered ({pct}%)</p>
            </div>
            <div>
              <p className="metric text-lg text-flare-700">{money(gap)}</p>
              <p className="text-[11px] text-brand-500">Remaining gap</p>
            </div>
            <div>
              <p className="metric text-lg text-brand-900">{money(totalCost)}</p>
              <p className="text-[11px] text-brand-500">Total cost</p>
            </div>
          </div>
          <p className="mt-4 rounded-[10px] bg-brand-100 p-3 text-xs text-brand-600">
            {gap === 0
              ? "This award fully covers your modelled cost of study."
              : `You would need ${money(gap)} from savings, work-study or an alternative source.`}
          </p>
          </CardContent>
        </Card>
      </div>

      <SectionHeading
        title="Scenario comparison"
        hint="Coverage of the same cost model across your top awards"
      />
      <div className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {scholarships.slice(0, 4).map((s) => {
          const c = Math.min(s.amount, totalCost);
          const p = Math.round((c / totalCost) * 100);
          return (
            <Button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={cn(
                "glass-card lift h-auto w-full items-start justify-start whitespace-normal p-4 text-left",
                selected === s.id ? "border-leaf-500" : "",
              )}
              variant="outline"
            >
              <p className="w-full break-words text-sm font-bold text-brand-900">
                {s.flag} {s.name}
              </p>
              <p className="metric mt-2 text-2xl text-leaf-700">{p}%</p>
              <p className="text-[11px] text-brand-500">covered</p>
              <p className="metric mt-2 text-xs text-flare-700">
                {money(Math.max(totalCost - c, 0))} gap
              </p>
            </Button>
          );
        })}
      </div>

      <SectionHeading title="Alternative funding" hint="Grants, loans and work-study options" />
      <div className="mb-10 grid gap-3 md:grid-cols-2">
        {alternativeFunding.map((f) => (
          <a
            key={f.name}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="glass-card lift flex items-start gap-3 border-brand-200/80 bg-brand-50/88 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full bg-brand-200 text-[11px] text-brand-800">
                  {f.kind}
                </Badge>
                <span className="metric text-xs text-leaf-700">{f.amount}</span>
              </div>
              <p className="mt-2 break-words text-sm font-semibold text-brand-900">{f.name}</p>
              <p className="mt-0.5 break-words text-xs text-brand-500">{f.eligibility}</p>
            </div>
            <ExternalLink className="size-4 shrink-0 text-brand-400" />
          </a>
        ))}
      </div>

      <SectionHeading
        title="Career pathways"
        hint="Where each award typically leads after graduation"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {careerPathways.map((c) => (
          <Card key={c.scholarship} className="glass-card border-brand-200/80 bg-brand-50/88">
            <CardContent className="p-4">
            <p className="text-sm font-bold text-brand-900">{c.scholarship}</p>
            <p className="mt-2 text-xs text-brand-600">{c.pathway}</p>
            <p className="mt-2 text-xs font-semibold text-leaf-800">{c.outcome}</p>
            <p className="metric mt-1 text-xs text-brand-500">{c.salary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
