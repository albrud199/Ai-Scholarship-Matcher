import { cn } from "@/lib/utils";
import type { DocStatus, FundingType } from "@/lib/scholarship-data";
import { urgency } from "@/lib/scholarship-data";
import { CheckCircle2, CircleDashed, CircleAlert } from "lucide-react";

export function ScoreRing({
  value,
  size = 72,
  stroke = 7,
  tone = "leaf",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "leaf" | "flare" | "brand";
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    tone === "leaf"
      ? "var(--leaf-500)"
      : tone === "flare"
        ? "var(--flare-500)"
        : "var(--brand-600)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--brand-200)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={
              {
                "--ring-circumference": `${c}px`,
                animation: "ring-fill 1s cubic-bezier(0.22,1,0.36,1)",
              } as React.CSSProperties
            }
          />
        </svg>
        <span
          className="metric absolute inset-0 flex items-center justify-center text-brand-900"
          style={{ fontSize: size * 0.26 }}
        >
          {value}%
        </span>
      </div>
      {label ? (
        <span className="text-[11px] font-medium tracking-wide text-brand-500 uppercase">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "leaf",
  suffix,
}: {
  value: number;
  label?: string;
  tone?: "leaf" | "flare" | "brand";
  suffix?: string;
}) {
  const bg =
    tone === "leaf" ? "bg-leaf-500" : tone === "flare" ? "bg-flare-500" : "bg-brand-500";
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-brand-700">{label}</span>
          <span className="metric text-brand-600">
            {value}
            {suffix ?? "%"}
          </span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-200">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", bg)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function UrgencyBadge({ daysLeft }: { daysLeft: number }) {
  const u = urgency(daysLeft);
  const map = {
    critical: "bg-flare-700 text-white",
    urgent: "bg-flare-100 text-flare-800",
    moderate: "bg-brand-200 text-brand-800",
    relaxed: "bg-leaf-100 text-leaf-900",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        map[u.tone],
      )}
    >
      {u.label}
    </span>
  );
}

export function DaysBadge({ daysLeft }: { daysLeft: number }) {
  const tone =
    daysLeft <= 14
      ? "bg-flare-50 text-flare-800 border-flare-200"
      : daysLeft <= 30
        ? "bg-brand-100 text-brand-800 border-brand-300"
        : "bg-leaf-50 text-leaf-900 border-leaf-200";
  return (
    <span
      className={cn("metric rounded-full border px-2.5 py-1 text-[11px]", tone)}
    >
      {daysLeft}d left
    </span>
  );
}

export function FundingBadge({ type }: { type: FundingType }) {
  const map: Record<FundingType, string> = {
    Full: "bg-leaf-200 text-leaf-900",
    Partial: "bg-brand-200 text-brand-800",
    "Self-Funded": "bg-flare-50 text-flare-800",
  };
  return (
    <span
      className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", map[type])}
    >
      {type}
    </span>
  );
}

export function StatusIcon({ status }: { status: DocStatus }) {
  if (status === "Done")
    return <CheckCircle2 className="size-4 shrink-0 text-leaf-700" aria-hidden />;
  if (status === "In Progress")
    return <CircleDashed className="size-4 shrink-0 text-brand-500" aria-hidden />;
  return <CircleAlert className="size-4 shrink-0 text-flare-600" aria-hidden />;
}

export function StatusPill({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, string> = {
    Done: "bg-leaf-100 text-leaf-900",
    "In Progress": "bg-brand-200 text-brand-800",
    Missing: "bg-flare-50 text-flare-800",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", map[status])}>
      {status}
    </span>
  );
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-brand-900">{title}</h2>
        {hint ? <p className="mt-0.5 text-sm text-brand-500">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
