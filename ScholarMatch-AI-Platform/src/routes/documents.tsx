import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { ProgressBar, StatusIcon, StatusPill } from "@/components/scholar/primitives";
import { scholarships, type DocStatus } from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";
import { FileText, FileImage, FileType, Upload, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document Checklist & Application Tracker | ScholarMatch AI" },
      {
        name: "description",
        content:
          "Track every scholarship document — transcripts, SOP, references, test scores — with Done, In Progress and Missing statuses.",
      },
      { property: "og:title", content: "Documents | ScholarMatch AI" },
      {
        property: "og:description",
        content: "One checklist for every document each scholarship requires.",
      },
    ],
  }),
  component: Documents,
});

const order: DocStatus[] = ["Missing", "In Progress", "Done"];

type Row = { name: string; type: string; status: DocStatus; required: string[] };

function icon(type: string) {
  if (type === "Image") return FileImage;
  if (type === "DOCX") return FileType;
  return FileText;
}

function Documents() {
  const initial = useMemo(() => {
    const map = new Map<string, Row>();
    for (const s of scholarships) {
      for (const d of s.documents) {
        const existing = map.get(d.name);
        if (existing) {
          existing.required.push(s.name);
          if (order.indexOf(d.status) < order.indexOf(existing.status))
            existing.status = d.status;
        } else {
          map.set(d.name, {
            name: d.name,
            type: d.type,
            status: d.status,
            required: [s.name],
          });
        }
      }
    }
    return Array.from(map.values());
  }, []);

  const [rows, setRows] = useState<Row[]>(initial);
  const done = rows.filter((r) => r.status === "Done").length;
  const missing = rows.filter((r) => r.status === "Missing");

  const cycle = (name: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.name === name
          ? { ...r, status: order[(order.indexOf(r.status) + 1) % order.length] ?? "Missing" }
          : r,
      ),
    );

  return (
    <AppShell
      title="Documents"
      subtitle="Tap a document to cycle its status: Missing → In Progress → Done."
    >
      {missing.length > 0 ? (
        <Card className="glass-card mb-6 border-flare-200 bg-brand-50/90">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <TriangleAlert className="size-5 text-flare-600" />
            <p className="text-sm font-semibold text-brand-900">
              {missing.length} documents missing
            </p>
            <p className="break-words text-xs text-brand-500">
              {missing.map((m) => m.name).join(" · ")}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass-card mb-8 border-brand-200/80 bg-brand-50/90">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
        <div className="min-w-56 flex-1">
          <ProgressBar
            value={Math.round((done / rows.length) * 100)}
            label="Overall document completeness"
          />
        </div>
        <Button className="h-10 rounded-[10px] text-sm font-semibold">
          <Upload className="size-4" /> Upload document
        </Button>
        </CardContent>
      </Card>

      <div className="mb-10 grid gap-3 md:grid-cols-2">
        {rows.map((r) => {
          const Icon = icon(r.type);
          return (
            <Button
              key={r.name}
              onClick={() => cycle(r.name)}
              className="glass-card lift h-auto w-full items-start justify-start gap-3 whitespace-normal border-brand-200/80 bg-brand-50/88 p-4 text-left"
              variant="outline"
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  r.status === "Done"
                    ? "bg-leaf-100 text-leaf-800"
                    : r.status === "In Progress"
                      ? "bg-brand-200 text-brand-700"
                      : "bg-flare-50 text-flare-700",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <StatusIcon status={r.status} />
                  <span className="break-words text-sm font-semibold text-brand-900">
                    {r.name}
                  </span>
                </span>
                <span className="mt-1 block break-words text-[11px] text-brand-500">
                  Required by {r.required.length} scholarship
                  {r.required.length === 1 ? "" : "s"} · {r.required.join(", ")}
                </span>
              </span>
              <span className="shrink-0 self-start">
                <StatusPill status={r.status} />
              </span>
            </Button>
          );
        })}
      </div>

      <h2 className="mb-4 text-xl font-bold text-brand-900">Application tracker</h2>
      <Card className="glass-card overflow-x-auto border-brand-200/80 bg-brand-50/88 p-1">
        <Table className="min-w-[640px] text-left text-sm">
          <TableHeader>
            <TableRow className="border-brand-200 text-[11px] tracking-wide text-brand-500 uppercase hover:bg-transparent">
              <TableHead className="px-4 py-3 font-semibold text-brand-500">Scholarship</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-brand-500">Stage</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-brand-500">Documents</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-brand-500">Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-brand-200">
            {scholarships.map((s) => {
              const complete = s.documents.filter((d) => d.status === "Done").length;
              const stage =
                complete === s.documents.length
                  ? "Submitted"
                  : complete > 1
                    ? "In Progress"
                    : "Not Started";
              return (
                <TableRow key={s.id} className="border-brand-200/80 hover:bg-brand-100/60">
                  <TableCell className="px-4 py-3 font-medium text-brand-900">
                    {s.flag} {s.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        stage === "Submitted"
                          ? "bg-leaf-100 text-leaf-900"
                          : stage === "In Progress"
                            ? "bg-brand-200 text-brand-800"
                            : "bg-flare-50 text-flare-800",
                      )}
                      variant="secondary"
                    >
                      {stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="metric px-4 py-3 text-brand-600">
                    {complete}/{s.documents.length}
                  </TableCell>
                  <TableCell className="metric px-4 py-3 text-brand-600">{s.daysLeft} days</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
