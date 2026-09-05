import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/scholar/app-shell";
import { ProgressBar } from "@/components/scholar/primitives";
import { student } from "@/lib/scholarship-data";
import { clearSession } from "@/lib/auth-state";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile & Preferences | ScholarMatch AI" },
      {
        name: "description",
        content:
          "Update your academic record, language scores, experience and notification preferences to refine scholarship matching.",
      },
      { property: "og:title", content: "Your Profile | ScholarMatch AI" },
      {
        property: "og:description",
        content: "Keep your GPA, IELTS and experience current for accurate match scores.",
      },
    ],
  }),
  component: Profile,
});

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <Label className="text-xs font-medium text-brand-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border-brand-200 bg-brand-50 text-sm text-brand-900"
      />
    </label>
  );
}

function Profile() {
  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    nationality: student.nationality,
    degree: student.degree,
    institution: student.institution,
    gpa: String(student.gpa),
    ielts: String(student.ielts),
    publications: String(student.publications),
    leadership: String(student.leadership),
    budget: String(student.budgetPerYear),
  });
  const [prefs, setPrefs] = useState({ email: true, inApp: true, frequency: "Weekly" });

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell title="Profile" subtitle="Changes here immediately affect your match scores.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-brand-900">Personal</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={set("name")} />
              <Field label="Email" value={form.email} onChange={set("email")} type="email" />
              <Field
                label="Nationality"
                value={form.nationality}
                onChange={set("nationality")}
              />
              <Field
                label="Annual budget (USD)"
                value={form.budget}
                onChange={set("budget")}
                type="number"
              />
            </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-brand-900">Academic</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Degree & field" value={form.degree} onChange={set("degree")} />
              <Field
                label="Institution"
                value={form.institution}
                onChange={set("institution")}
              />
              <Field label="GPA (out of 4.0)" value={form.gpa} onChange={set("gpa")} />
              <Field label="IELTS score" value={form.ielts} onChange={set("ielts")} />
            </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-brand-900">Experience</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Research publications"
                value={form.publications}
                onChange={set("publications")}
                type="number"
              />
              <Field
                label="Leadership activities"
                value={form.leadership}
                onChange={set("leadership")}
                type="number"
              />
            </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => toast.success("Profile updated — match scores recalculated")}
              className="h-10 rounded-[10px] px-5 text-sm font-semibold"
            >
              Save changes
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-[10px] border-brand-300 bg-brand-50 px-5 text-sm font-semibold text-brand-700 hover:bg-brand-200/60"
            >
              Change password
            </Button>
            <Link
              to="/login"
              onClick={clearSession}
              className="inline-flex h-10 items-center rounded-[10px] px-5 text-sm font-semibold text-flare-700 hover:bg-flare-50"
            >
              Log out
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-brand-900">Profile strength</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
            <div className="flex flex-col gap-3">
              <ProgressBar label="Academic record" value={95} />
              <ProgressBar label="Language" value={80} />
              <ProgressBar label="Experience" value={68} />
              <ProgressBar label="Documents" value={62} tone="brand" />
            </div>
            <p className="mt-4 text-xs text-brand-500">
              Adding community service entries and a third publication would lift your average
              match by an estimated 4 points.
            </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-brand-900">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-0">
            {(
              [
                ["email", "Email alerts"],
                ["inApp", "In-app alerts"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between py-2 text-sm text-brand-700"
              >
                {label}
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [key]: checked }))}
                />
              </label>
            ))}
            <label className="mt-3 block space-y-1.5">
              <Label className="text-xs font-medium text-brand-700">Digest frequency</Label>
              <Select
                value={prefs.frequency}
                onValueChange={(value) => setPrefs((p) => ({ ...p, frequency: value }))}
              >
                <SelectTrigger className="h-10 rounded-lg border-brand-200 bg-brand-50 text-sm text-brand-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Only urgent deadlines">Only urgent deadlines</SelectItem>
                </SelectContent>
              </Select>
            </label>
            </CardContent>
          </Card>

          <Card className="glass-card border-flare-200 bg-brand-50/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-brand-900">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
            <p className="text-xs text-brand-500">
              Deleting your account removes your profile, documents and application history.
            </p>
            <Button
              variant="outline"
              className="mt-3 h-10 w-full rounded-[10px] border-flare-200 text-sm font-semibold text-flare-700 hover:bg-flare-50"
            >
              Delete account
            </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
