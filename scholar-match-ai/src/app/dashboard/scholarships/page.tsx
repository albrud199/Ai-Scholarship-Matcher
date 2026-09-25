'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScholarshipCard } from '@/components/scholarship-card';
import { seedScholarships, seedProfile, COUNTRIES, FIELDS_OF_STUDY, DEGREE_LEVELS } from '@/lib/mock-data';
import { computeMatch } from '@/lib/matching';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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
      .map((s) => ({ scholarship: s, match: computeMatch(seedProfile, s).score }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [filters]);

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
          {seedScholarships.filter((s) => s.status === 'active').length} verified, sourced awards. Ranked by your deterministic match score.
        </p>
      </div>

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
            <span>· sorted by match score</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map(({ scholarship, match }) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                matchScore={match}
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