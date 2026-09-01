import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { ProgressBar } from "@/components/scholar/primitives";
import { roadmap } from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";
import { Check, CircleDashed, Circle } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Personalised Application Roadmap | ScholarMatch AI" },
      {
        name: "description",
        content:
          "A milestone-by-milestone preparation roadmap across immediate, 3–6 month and 1 year horizons for your scholarship applications.",
      },
      { property: "og:title", content: "Application Roadmap | ScholarMatch AI" },
      {
        property: "og:description",
        content: "Plan IELTS, SOP, references and submissions across a phased timeline.",
      },
    ],
  }),
  component: Roadmap,
});

type Status = "Done" | "In Progress" | "Not Started";
const order: Status[] = ["Not Started", "In Progress", "Done"];

function Roadmap() {
  const [states, setStates] = useState<Record<string, Status>>(() =>
    Object.fromEntries(
      roadmap.flatMap((p) => p.milestones.map((m) => [m.title, m.status as Status])),
    ),
  );

  const all = Object.values(states);
  const progress = Math.round(
    (all.filter((s) => s === "Done").length / all.length) * 100,
  );

  const cycle = (title: string) =>
    setStates((prev) => {
      const current = prev[title] ?? "Not Started";
      const next = order[(order.indexOf(current) + 1) % order.length] ?? "Not Started";
      return { ...prev, [title]: next };
    });

  return (
    <AppShell
      title="Roadmap"
      subtitle="Tap any milestone to move it through Not Started → In Progress → Done."
    >
      <div className="glass-card mb-8 p-5">
        <ProgressBar value={progress} label="Overall roadmap progress" />
        <p className="mt-2 text-xs text-brand-500">
          {all.filter((s) => s === "Done").length} of {all.length} milestones completed
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {roadmap.map((phase) => (
          <section key={phase.phase}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-brand-900">{phase.phase}</h2>
              <span className="text-xs text-brand-500">{phase.window}</span>
            </div>
            <ol className="relative flex flex-col gap-3 border-l border-brand-300 pl-6">
              {phase.milestones.map((m) => {
                const status = states[m.title];
                const Icon =
                  status === "Done" ? Check : status === "In Progress" ? CircleDashed : Circle;
                return (
                  <li key={m.title} className="relative">
                    <span
                      className={cn(
                        "absolute top-5 -left-[33px] grid size-4 place-items-center rounded-full ring-4 ring-brand-100",
                        status === "Done"
                          ? "bg-leaf-500"
                          : status === "In Progress"
                            ? "bg-flare-300"
                            : "bg-brand-300",
                      )}
                    />
                    <button
                      onClick={() => cycle(m.title)}
                      className="glass-card lift flex w-full items-center gap-4 p-4 text-left"
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          status === "Done"
                            ? "text-leaf-700"
                            : status === "In Progress"
                              ? "text-flare-600"
                              : "text-brand-400",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brand-900">{m.title}</p>
                        <p className="text-xs text-brand-500">{m.linked}</p>
                      </div>
                      <span className="metric text-xs text-brand-600">{m.date}</span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          status === "Done"
                            ? "bg-leaf-100 text-leaf-900"
                            : status === "In Progress"
                              ? "bg-flare-50 text-flare-800"
                              : "bg-brand-200 text-brand-700",
                        )}
                      >
                        {status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
