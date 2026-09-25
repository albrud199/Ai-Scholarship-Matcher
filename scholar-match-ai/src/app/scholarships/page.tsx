'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { seedScholarships, COUNTRIES, DEGREE_LEVELS, FIELDS_OF_STUDY } from '@/lib/mock-data';
import { getDaysUntil } from '@/lib/utils';
import { Search, ArrowRight, GraduationCap, ShieldCheck, Calendar } from 'lucide-react';

export default function PublicScholarshipsPage() {
  const active = useMemo(() => seedScholarships.filter((s) => s.status === 'active'), []);
  const countries = new Set(active.map((s) => s.country));

  const samples = useMemo(
    () =>
      active
        .slice()
        .sort((a, b) => getDaysUntil(a.deadline) - getDaysUntil(b.deadline))
        .slice(0, 6),
    [active]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">ScholarMatch</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign up free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-background py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Badge variant="secondary" className="gap-1.5 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
            {active.length} verified awards · {countries.size} destinations
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Explore the <span className="text-primary">scholarship database</span>
          </h1>
          <p className="text-muted-foreground">
            Every record is manually curated with structured eligibility requirements, real deadlines, and a source link.
            Sign up to see how each one scores against your profile.
          </p>
        </div>
      </section>

      {/* Sample cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {samples.map((s) => (
              <Card key={s.id} className="flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold leading-snug">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="outline">{s.country}</Badge>
                    <Badge variant="outline">{DEGREE_LEVELS.find((d) => d.value === s.degree_level)?.label ?? s.degree_level}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {getDaysUntil(s.deadline)} days left
                    </span>
                    <a href={s.application_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
                      Official site
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10 rounded-xl border bg-secondary-50 p-8">
            <h2 className="text-xl font-semibold mb-2">See your match score for each of these</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Create a free profile to unlock deterministic matching with full evidence breakdowns.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        Data is manually curated and source-linked. Deadlines change — always confirm on the official page.
      </footer>
    </div>
  );
}