'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScholarshipCard } from '@/components/scholarship-card';
import { seedScholarships, COUNTRIES, FIELDS_OF_STUDY, DEGREE_LEVELS } from '@/lib/mock-data';
import { computeMatch, getMatchDataCoverage, MATCH_DATA_COVERAGE_THRESHOLD } from '@/lib/matching';
import { useStudentProfile } from '@/lib/use-student-profile';
import { Search, SlidersHorizontal, X, User, ArrowRight } from 'lucide-react';

interface Filters {
  query: string;
  country: string;
  degree: string;
  field: string;
  deadlineWindow: string;
}

const INITIAL_FILTERS: Filters = { query: '', country: 'any', degree: 'any', field: 'any', deadlineWindow: 'any' };

const DEADLINE_WINDOWS = [
  { value: 'any', label: 'Any time' },
  { value: '30', label: 'Next 30 days' },
  { value: '60', label: 'Next 60 days' },
  { value: '90', label: 'Next 90 days' },
];

export default function ScholarshipsPage() {
  const { profile, loading, hasSavedProfile } = useStudentProfile();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return seedScholarships
      .filter((s) => {
        if (s.status !== 'active') return false;
        if (filters.country !== 'any' && s.country !== filters.country) return false;
        if (filters.degree !== 'any' && s.degree_level !== 'any' && s.degree_level !== filters.degree) return false;
        if (filters.field !== 'any' && !s.field_of_study.includes('any') && !s.field_of_study.includes(filters.field)) return false;
        if (filters.deadlineWindow !== 'any') {
          const days = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / 86400000);
          if (days > Number(filters.deadlineWindow)) return false;
        }
        if (q) {
          const haystack = `${s.name} ${s.provider} ${s.country} ${s.description} ${s.eligibility_criteria}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .map((s) => ({ scholarship: s, match: computeMatch(profile, s) }))
      .sort((a, b) => b.match.score.score - a.match.score.score);
  }, [filters, profile]);

  // How much of the score the student's current profile actually supports.
  const dataCoverage = results.length
    ? Math.round(results.reduce((acc, r) => acc + getMatchDataCoverage(r.match), 0) / results.length)
    : 0;
  const matchScoresReady = dataCoverage >= MATCH_DATA_COVERAGE_THRESHOLD;

  const activeFilterCount =
    (filters.country !== 'any' ? 1 : 0) +
    (filters.degree !== 'any' ? 1 : 0) +
    (filters.field !== 'any' ? 1 : 0) +
    (filters.deadlineWindow !== 'any' ? 1 : 0) +
    (filters.query ? 1 : 0);

  const handleSave = (scholarship: { id: string }) => setSavedIds((ids) => [...ids, scholarship.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scholarships</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {seedScholarships.filter((s) => s.status === 'active').length} verified awards. Open any card&apos;s
          <span className="font-medium"> Details </span> button for eligibility, benefits and why a scholarship fits you.
        </p>
      </div>

      {/* Profile progress: the honest reason a score can be missing */}
      {!loading && !matchScoresReady && (
        <Card className="border-primary/30 bg-primary-50/40">
          <CardContent className="p-5 flex flex-wrap items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-[240px]">
              <p className="font-semibold">
                {hasSavedProfile ? 'Your profile is missing a few details' : 'Add a few details to unlock your match scores'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We can only build {dataCoverage}% of the match score from what we know about you, so instead of showing a
                number that mostly reflects missing information, each card tells you what is still needed. Add your GPA,
                English test score, experience and target field to see real scores.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/profile">
                Complete my profile <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => setFilter('query', e.target.value)}
          placeholder="Search by name, provider, country, or keyword…"
          className="pl-9 h-11"
          aria-label="Search scholarships"
        />
      </div>

      {/* Filter row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="grid sm:grid-cols-4 gap-2 flex-1 min-w-0">
              <Select value={filters.country} onValueChange={(v) => setFilter('country', v)}>
                <SelectTrigger aria-label="Filter by country">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All countries</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.degree} onValueChange={(v) => setFilter('degree', v)}>
                <SelectTrigger aria-label="Filter by degree level">
                  <SelectValue placeholder="Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All degrees</SelectItem>
                  {DEGREE_LEVELS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.field} onValueChange={(v) => setFilter('field', v)}>
                <SelectTrigger aria-label="Filter by field of study">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS_OF_STUDY.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.deadlineWindow} onValueChange={(v) => setFilter('deadlineWindow', v)}>
                <SelectTrigger aria-label="Filter by deadline">
                  <SelectValue placeholder="Deadline" />
                </SelectTrigger>
                <SelectContent>
                  {DEADLINE_WINDOWS.map((w) => (
                    <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No scholarships match your filters. Try widening the deadline window or clearing filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => setFilters(INITIAL_FILTERS)}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{results.length} results</Badge>
            <span>
              · {matchScoresReady ? 'sorted by your match score' : 'sorted by best available fit — add your details for exact scores'}
            </span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map(({ scholarship, match }) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                match={match}
                profile={profile}
                isSaved={savedIds.includes(scholarship.id)}
                onAddApplication={handleSave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}