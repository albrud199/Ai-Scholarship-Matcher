'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { COUNTRIES, FIELDS_OF_STUDY } from '@/lib/mock-data';
import type { Profile } from '@/types';
import {
  EMPTY_PROFILE_FORM,
  isFormBlank,
  loadDraft,
  mergeForms,
  rowToFormState,
  saveDraft,
  toProfileRow,
  type ProfileFormState,
} from '@/lib/profile-form';
import {
  User,
  GraduationCap,
  BarChart3,
  Briefcase,
  Target,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const AUTOSAVE_DELAY_MS = 400;
/** How long a pause counts as "finished for now" before the form is pushed to Supabase. */
const BACKGROUND_SYNC_DELAY_MS = 1500;

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User, description: 'Identity and current studies' },
  { id: 'education', label: 'Education', icon: GraduationCap, description: 'Degree target and field' },
  { id: 'scores', label: 'Scores', icon: BarChart3, description: 'GPA and language tests' },
  { id: 'experience', label: 'Experience', icon: Briefcase, description: 'Work, research, leadership' },
  { id: 'goals', label: 'Goals', icon: Target, description: 'Your story and ambitions' },
  { id: 'constraints', label: 'Constraints', icon: SlidersHorizontal, description: 'Countries, budget, funding' },
];

export default function ProfilePage() {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'local'>('idle');
  // Null until the local draft has been read. Seeding state during render would
  // make the server render and the browser render disagree, which React resolves
  // by throwing the whole form away and re-mounting it as blank.
  const [form, setForm] = useState<ProfileFormState | null>(null);
  // The signed-in student, once Supabase reports one. Scopes the local draft and
  // marks what has already been pushed to the database.
  const [userId, setUserId] = useState<string | null>(null);
  const lastSynced = useRef('');
  const formRef = useRef<ProfileFormState | null>(null);

  // Hydrate from the local draft after mount, then keep the draft in step with
  // every keystroke. Both run against the in-memory mirror in profile-form, so the
  // answers survive a trip to another page even when the browser refuses to write
  // localStorage. Scribbling a half-typed profile to the database is only done
  // once the student pauses typing (see below).
  //
  // This must stay idempotent rather than guarded by a ref: React StrictMode
  // mounts, discards, and re-mounts, so a one-shot guard would run against the
  // thrown-away tree and leave the real one stuck on the loading state forever.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      formRef.current = draft;
      setForm(draft);
    } else {
      // No draft yet — show the blank form immediately instead of waiting on the
      // database round trip. The saved row, if any, replaces it below.
      setForm((current) => current ?? EMPTY_PROFILE_FORM);
    }
  }, []);

  useEffect(() => {
    if (!form) return;
    formRef.current = form;
    const timer = setTimeout(() => saveDraft(form, userId), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [form, userId]);

  // Load the saved profile and the signed-in user together, so nothing typed
  // before the account is known can be attributed to the wrong student.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const load = async () => {
      const { data: authData } = await supabase!.auth.getUser();
      if (cancelled) return;

      const uid = authData.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;

      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (cancelled || error || !data) return;

      const savedForm = rowToFormState(data as Partial<Profile>);
      const draft = loadDraft(uid);
      const merged = mergeForms(savedForm, draft);

      setForm((current) => (isFormBlank(current ?? EMPTY_PROFILE_FORM) ? merged : current));
      lastSynced.current = JSON.stringify(merged);
      saveDraft(merged, uid);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Push the form to Supabase; resolve false when it only made it to this device. */
  const syncToServer = async (current: ProfileFormState, uid: string | null): Promise<boolean> => {
    if (!supabase || !uid) return false;

    setStatus('saving');
    const { error } = await supabase
      .from('profiles')
      .upsert(toProfileRow(current, uid), { onConflict: 'user_id' });

    if (error) {
      setSaveError(`Saved on this device only — could not sync: ${error.message}`);
      setStatus('local');
      return false;
    }

    lastSynced.current = JSON.stringify(current);
    saveDraft(current, uid);
    setSaveError('');
    setStatus('saved');
    return true;
  };

  // Quietly mirror the profile to the database after the student pauses typing, so
  // a change is never lost just because the page was left before pressing "Save draft".
  useEffect(() => {
    if (!supabase || !userId || !form) return;
    const serialized = JSON.stringify(form);
    if (serialized === lastSynced.current) return;

    const timer = setTimeout(() => {
      void syncToServer(form, userId);
    }, BACKGROUND_SYNC_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, userId]);

  const set = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((f) => ({ ...(f ?? EMPTY_PROFILE_FORM), [key]: value }));
    setSaved(false);
    setSaveError('');
    setStatus('idle');
  };

  const activeForm = form ?? EMPTY_PROFILE_FORM;

  const completion = useMemo(() => {
    const checks = [
      activeForm.fullName.trim().length > 0,
      activeForm.nationality.trim().length > 0,
      activeForm.currentInstitution.trim().length > 0,
      activeForm.targetFieldOfStudy.trim().length > 0,
      activeForm.gpa.trim().length > 0,
      activeForm.ielts.trim().length > 0 || activeForm.toefl.trim().length > 0,
      activeForm.work.length + activeForm.leadership.length > 0,
      activeForm.research.length + activeForm.publications.length > 0,
      activeForm.goals.trim().length > 50,
      activeForm.preferredCountries.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [activeForm]);

  const handleSave = async () => {
    // The draft is already mirrored on every keystroke; this is the explicit
    // "keep it on this device now" write before any network work happens.
    saveDraft(activeForm, userId);
    setSaveError('');

    const ok = await syncToServer(activeForm, userId);
    if (!ok && !userId) {
      setSaveError('Saved on this device only — sign in again to sync your profile.');
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header + completion */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every field feeds the deterministic match engine — stronger facts, better scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{completion}% complete</p>
            <Progress value={completion} className="w-32 mt-1" />
            {status !== 'idle' && (
              <p
                className={cn('text-xs mt-1', status === 'local' ? 'text-warning-600' : 'text-muted-foreground')}
                role="status"
              >
                {status === 'saving' ? 'Saving…' : status === 'saved' ? 'All changes saved' : 'Saved on this device'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Profile steps">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={step === i}
            onClick={() => setStep(i)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              step === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{STEPS[step].label}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form === null ? (
            <p className="text-sm text-muted-foreground">Loading your saved profile…</p>
          ) : (
            <>
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Alex Johnson" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
                <Select value={form.nationality} onValueChange={(v) => set('nationality', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input label="Current institution" value={form.currentInstitution} onChange={(e) => set('currentInstitution', e.target.value)} placeholder="University name" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current degree</label>
                <Select value={form.currentDegree} onValueChange={(v) => set('currentDegree', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High school</SelectItem>
                    <SelectItem value="bachelor">Bachelor&apos;s student</SelectItem>
                    <SelectItem value="master">Master&apos;s student</SelectItem>
                    <SelectItem value="phd">PhD student</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target degree level</label>
                <Select value={form.targetDegreeLevel} onValueChange={(v) => set('targetDegreeLevel', v as Profile['target_degree_level'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="postdoc">Postdoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target field of study</label>
                <Select value={form.targetFieldOfStudy} onValueChange={(v) => set('targetFieldOfStudy', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS_OF_STUDY.filter((f) => f.value !== 'any').map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Degree level is a hard gate for most scholarships — a master&apos;s target excludes PhD-only awards like Vanier Canada.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="GPA" type="number" step="0.01" min="0" value={form.gpa} onChange={(e) => set('gpa', e.target.value)} placeholder="3.60" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Scale</label>
                  <Select value={form.gpaScale} onValueChange={(v) => set('gpaScale', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.0">4.0</SelectItem>
                      <SelectItem value="5.0">5.0</SelectItem>
                      <SelectItem value="10.0">10.0</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div />
              <Input
                label="IELTS overall band (optional)"
                type="number"
                step="0.5"
                min="0"
                max="9"
                value={form.ielts}
                onChange={(e) => set('ielts', e.target.value)}
                placeholder="7.0"
                helperText="Most fully-funded scholarships require 6.5+"
              />
              <Input
                label="TOEFL total (optional)"
                type="number"
                min="0"
                max="120"
                value={form.toefl}
                onChange={(e) => set('toefl', e.target.value)}
                placeholder="98"
                helperText="Commonly 90–100 for competitive awards"
              />
            </div>
          )}

          {step === 3 && <ExperienceStep form={form} set={set} />}
          {step === 4 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Your goals</label>
              <Textarea
                value={form.goals}
                onChange={(e) => set('goals', e.target.value)}
                rows={8}
                placeholder="What do you want to study, why, and what impact will it have back home? (aim for 100+ words)"
              />
              <p className="text-xs text-muted-foreground">
                {form.goals.trim() ? form.goals.trim().split(/\s+/).length : 0} words — this feeds the Scholarship Fit factor (15% of your match score).
              </p>
            </div>
          )}
          {step === 5 && <ConstraintsStep form={form} set={set} />}
            </>
          )}
        </CardContent>
      </Card>

      {/* Nav */}
      {saveError && <p className="text-sm text-destructive" role="alert">{saveError}</p>}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSave} disabled={form === null}>
            <Save className="mr-2 h-4 w-4" />
            {saved ? 'Saved!' : 'Save draft'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={form === null}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={form === null}>
              <Check className="mr-2 h-4 w-4" /> Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type SetFn = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void;

function ExperienceStep({ form, set }: { form: ProfileFormState; set: SetFn }) {
  const addResearch = () =>
    set('research', [
      ...form.research,
      { id: `res-${Date.now()}`, title: '', institution: '', description: '', start_date: '', end_date: undefined, is_current: false },
    ]);
  const addWork = () =>
    set('work', [
      ...form.work,
      { id: `work-${Date.now()}`, title: '', organization: '', description: '', start_date: '', end_date: undefined, is_current: false },
    ]);
  const addLeadership = () =>
    set('leadership', [
      ...form.leadership,
      { id: `lead-${Date.now()}`, role: '', organization: '', description: '', start_date: '', end_date: undefined, is_current: false },
    ]);

  const rowCls = 'grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-start rounded-lg border p-3';

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Research experience ({form.research.length})</h3>
          <Button type="button" variant="outline" size="sm" onClick={addResearch}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.research.map((r, i) => (
            <div key={r.id} className={rowCls}>
              <Input
                value={r.title}
                onChange={(e) => set('research', form.research.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                placeholder="Research title (e.g. thesis project)"
              />
              <Input
                value={r.institution}
                onChange={(e) => set('research', form.research.map((x, j) => (j === i ? { ...x, institution: e.target.value } : x)))}
                placeholder="Institution"
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove research item" onClick={() => set('research', form.research.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          {form.research.length === 0 && <p className="text-xs text-muted-foreground">No research entries — theses and projects go here.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Work experience ({form.work.length})</h3>
          <Button type="button" variant="outline" size="sm" onClick={addWork}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.work.map((w, i) => (
            <div key={w.id} className={rowCls}>
              <Input
                value={w.title}
                onChange={(e) => set('work', form.work.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                placeholder="Job title"
              />
              <Input
                value={w.organization}
                onChange={(e) => set('work', form.work.map((x, j) => (j === i ? { ...x, organization: e.target.value } : x)))}
                placeholder="Organization"
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove work item" onClick={() => set('work', form.work.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          {form.work.length === 0 && <p className="text-xs text-muted-foreground">No work entries — Chevening-style awards require 2+ years.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Leadership experience ({form.leadership.length})</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLeadership}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.leadership.map((l, i) => (
            <div key={l.id} className={rowCls}>
              <Input
                value={l.role}
                onChange={(e) => set('leadership', form.leadership.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                placeholder="Role (e.g. President)"
              />
              <Input
                value={l.organization}
                onChange={(e) => set('leadership', form.leadership.map((x, j) => (j === i ? { ...x, organization: e.target.value } : x)))}
                placeholder="Organization"
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove leadership item" onClick={() => set('leadership', form.leadership.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          {form.leadership.length === 0 && <p className="text-xs text-muted-foreground">No leadership entries — clubs, volunteering, and community roles count.</p>}
        </div>
      </section>
    </div>
  );
}

function ConstraintsStep({ form, set }: { form: ProfileFormState; set: SetFn }) {
  const togglePreferred = (country: string) => {
    set(
      'preferredCountries',
      form.preferredCountries.includes(country)
        ? form.preferredCountries.filter((c) => c !== country)
        : [...form.preferredCountries, country]
    );
  };
  const toggleExclude = (country: string) => {
    set(
      'excludeCountries',
      form.excludeCountries.includes(country)
        ? form.excludeCountries.filter((c) => c !== country)
        : [...form.excludeCountries, country]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred countries</label>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => togglePreferred(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.preferredCountries.includes(c)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:border-primary/50'
              }`}
              aria-pressed={form.preferredCountries.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exclude countries</label>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleExclude(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.excludeCountries.includes(c)
                  ? 'bg-destructive text-destructive-foreground border-destructive'
                  : 'bg-background text-muted-foreground hover:border-destructive/50'
              }`}
              aria-pressed={form.excludeCountries.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Max tuition budget (USD/year, optional)"
          type="number"
          min="0"
          value={form.maxTuitionBudget}
          onChange={(e) => set('maxTuitionBudget', e.target.value)}
          placeholder="5000"
          helperText="Fully-funded awards count as $0 tuition"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Funding type</label>
          <Select value={form.fundingType} onValueChange={(v) => set('fundingType', v as ProfileFormState['fundingType'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full funding only</SelectItem>
              <SelectItem value="partial">Partial funding OK</SelectItem>
              <SelectItem value="any">Any funding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}