import { Link } from "@tanstack/react-router";
import type { Scholarship } from "@/lib/scholarship-data";
import { DaysBadge, FundingBadge, ScoreRing } from "./primitives";
import { ArrowRight, Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { applicationRecord, useApplicationState } from "@/lib/application-state";

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const { applications, updateApplication } = useApplicationState();
  const application = applicationRecord(applications, s);
  const isTopMatch = s.match >= 85 || s.bucket === "Apply Now";

  return (
    <article
      className={cn(
        "glass-card lift flex flex-col gap-4 p-5",
        isTopMatch && "animated-gradient-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-brand-500">
            <span className="text-base leading-none">{s.flag}</span>
            <span className="truncate">{s.country}</span>
          </div>
          <h3 className="mt-1 text-base leading-snug font-bold text-brand-900">{s.name}</h3>
          <p className="metric mt-1 text-sm text-brand-600">{s.amountLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateApplication(s.id, { saved: !application.saved })}
            aria-label={application.saved ? `Remove ${s.name} from saved` : `Save ${s.name}`}
            title={application.saved ? "Remove from saved" : "Save scholarship"}
            className={cn(
              "grid size-8 place-items-center rounded-full border transition-colors",
              application.saved
                ? "border-leaf-400 bg-leaf-100 text-leaf-700"
                : "border-brand-200 bg-brand-50/60 text-brand-400 hover:border-leaf-400 hover:text-leaf-700",
            )}
          >
            <Bookmark className={cn("size-4", application.saved && "fill-current")} />
          </button>
          <FundingBadge type={s.fundingType} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <ScoreRing value={s.match} label="Match" />
        <ScoreRing value={s.readiness} tone="brand" label="Ready" />
        <div className="ml-auto flex flex-col items-end gap-2">
          <DaysBadge daysLeft={s.daysLeft} />
          <span className="text-[11px] text-brand-500">{s.degree}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {application.status !== "Saved" ? (
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {application.status}
          </span>
        ) : null}
        <Link
          to="/scholarship/$id"
          params={{ id: s.id }}
          className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-leaf-600"
        >
          View details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
