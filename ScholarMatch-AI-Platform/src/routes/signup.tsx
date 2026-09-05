import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, GraduationCap, Plus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your ScholarMatch AI account" },
      {
        name: "description",
        content:
          "Four-step onboarding: personal details, academics, experience and documents — then get matched to funded scholarships.",
      },
      { property: "og:title", content: "Create an account | ScholarMatch AI" },
      {
        property: "og:description",
        content: "Build your student profile and unlock personalised scholarship matches.",
      },
    ],
  }),
  component: Signup,
});

const steps = ["Personal", "Academics", "Experience", "Documents"];

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string | undefined;
  placeholder?: string | undefined;
}) {
  const valid = value.trim().length > 0 && !error;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-brand-700">{label}</span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border bg-brand-50 px-3 py-2.5 pr-9 text-sm text-brand-900 placeholder:text-brand-400 focus:ring-2 focus:ring-leaf-300/50 focus:outline-none",
            error ? "border-flare-500" : valid ? "border-leaf-500" : "border-brand-200",
          )}
        />
        {valid ? (
          <Check className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-leaf-600" />
        ) : null}
      </span>
      {error ? <span className="mt-1 block text-[11px] text-flare-700">{error}</span> : null}
    </label>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    nationality: "Bangladesh",
    dob: "",
    level: "MSc",
    field: "",
    institution: "",
    gpa: "",
    scale: "4.0",
    ielts: "",
  });
  const [entries, setEntries] = useState<string[]>(["Research: Federated learning survey"]);
  const [entry, setEntry] = useState("");
  const [docs, setDocs] = useState<Record<string, boolean>>({
    Passport: false,
    Transcripts: false,
    "Curriculum vitae": false,
    "Statement of purpose": false,
  });

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const emailError =
    f.email.length > 0 && !f.email.includes("@") ? "Enter a valid email address" : undefined;
  const gpaError =
    f.gpa.length > 0 && (Number(f.gpa) <= 0 || Number(f.gpa) > Number(f.scale))
      ? `GPA must be between 0 and ${f.scale}`
      : undefined;

  return (
    <main className="aurora relative min-h-screen overflow-hidden px-4 py-10">
      <div className="blob absolute -top-24 -left-24 size-96 rounded-full bg-leaf-300/50" />
      <div className="glass-card relative mx-auto w-full max-w-2xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-leaf-500 text-leaf-900">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-brand-900">Create your profile</h1>
            <p className="text-xs text-brand-500">
              Step {step + 1} of 4 · {steps[step]}
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                  i < step
                    ? "bg-leaf-500 text-leaf-900"
                    : i === step
                      ? "bg-brand-800 text-brand-50"
                      : "bg-brand-200 text-brand-500",
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i < step ? "bg-leaf-400" : "bg-brand-200",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={f.name} onChange={set("name")} placeholder="Jane Doe" />
            <Field
              label="Email"
              value={f.email}
              onChange={set("email")}
              error={emailError}
              placeholder="you@university.edu"
            />
            <Field
              label="Password"
              type="password"
              value={f.password}
              onChange={set("password")}
            />
            <Field
              label="Nationality"
              value={f.nationality}
              onChange={set("nationality")}
            />
            <Field label="Date of birth" type="date" value={f.dob} onChange={set("dob")} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-brand-700">
                Degree level
              </span>
              <select
                value={f.level}
                onChange={(e) => set("level")(e.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 focus:border-leaf-500 focus:outline-none"
              >
                <option>BSc</option>
                <option>MSc</option>
                <option>PhD</option>
              </select>
            </label>
            <Field
              label="Field of study"
              value={f.field}
              onChange={set("field")}
              placeholder="Computer Science"
            />
            <Field
              label="Institution"
              value={f.institution}
              onChange={set("institution")}
              placeholder="BUET"
            />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="GPA / CGPA" value={f.gpa} onChange={set("gpa")} error={gpaError} />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-brand-700">Scale</span>
                <select
                  value={f.scale}
                  onChange={(e) => set("scale")(e.target.value)}
                  className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 focus:border-leaf-500 focus:outline-none"
                >
                  <option>4.0</option>
                  <option>5.0</option>
                  <option>10.0</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <Field
              label="IELTS / TOEFL score"
              value={f.ielts}
              onChange={set("ielts")}
              placeholder="7.0"
            />
            <div>
              <span className="mb-1.5 block text-xs font-medium text-brand-700">
                Research, leadership & community entries
              </span>
              <div className="flex gap-2">
                <input
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Leadership: IEEE student branch chair"
                  className="flex-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-400 focus:border-leaf-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!entry.trim()) return;
                    setEntries((p) => [...p, entry.trim()]);
                    setEntry("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-leaf-600"
                >
                  <Plus className="size-4" /> Add
                </button>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {entries.map((e, i) => (
                  <li
                    key={e + i}
                    className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800"
                  >
                    <span className="flex-1">{e}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${e}`}
                      onClick={() => setEntries((p) => p.filter((_, j) => j !== i))}
                      className="text-brand-400 hover:text-flare-600"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(docs).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDocs((p) => ({ ...p, [d]: !p[d] }))}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] border border-dashed p-4 text-left text-sm",
                  docs[d]
                    ? "border-leaf-500 bg-leaf-50 text-leaf-900"
                    : "border-brand-300 text-brand-600 hover:border-brand-400",
                )}
              >
                {docs[d] ? <Check className="size-4" /> : <Upload className="size-4" />}
                <span className="font-medium">
                  {docs[d] ? `${d} uploaded` : `Upload ${d.toLowerCase()}`}
                </span>
              </button>
            ))}
            <p className="text-xs text-brand-500 sm:col-span-2">
              You can add recommenders and remaining documents later from the Documents screen.
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-[10px] border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-200/60"
            >
              Back
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-brand-500 hover:text-brand-800"
            >
              I already have an account
            </Link>
          )}
          <button
            onClick={() => (step < 3 ? setStep((s) => s + 1) : navigate({ to: "/" }))}
            className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-leaf-600 active:scale-[0.98]"
          >
            {step < 3 ? "Next" : "Complete profile"}
          </button>
        </div>
      </div>
    </main>
  );
}
