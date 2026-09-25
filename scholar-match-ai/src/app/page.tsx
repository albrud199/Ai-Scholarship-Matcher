'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, GraduationCap, Search, Brain, Target, Upload, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              <span>Scholarship Application Intelligence Platform</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Your Personal Scholarship{' '}
              <span className="text-primary">Operating System</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, match, and apply to scholarships with AI-powered intelligence. 
              Get deterministic match scores, personalized recommendations, and the single 
              best next action to maximize your chances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  Start Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Built for <span className="text-primary">Results</span>, Not Just Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature serves the core loop: Profile → Match → Evidence → Readiness → Best Next Action
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'Smart Discovery',
                description: 'Search 150+ curated scholarships with real eligibility requirements, deadlines, and source verification.',
                href: '/scholarships',
              },
              {
                icon: Brain,
                title: 'Deterministic Matching',
                description: 'Transparent, explainable match scores computed from structured requirements — never a black-box AI percentage.',
                href: '/dashboard/matches',
              },
              {
                icon: Target,
                title: 'Best Next Action',
                description: 'Get the single highest-impact action ranked by impact, effort, deadline risk, and reuse across applications.',
                href: '/dashboard/readiness',
              },
              {
                icon: Upload,
                title: 'Document Intelligence',
                description: 'Upload transcripts, CVs, and SOPs. AI extracts structured evidence and maps it to your profile automatically.',
                href: '/dashboard/documents',
              },
              {
                icon: CheckCircle,
                title: 'AI Copilot (RAG)',
                description: 'Grounded, cited answers about scholarships, requirements, and your applications — never hallucinated.',
                href: '/chat',
              },
              {
                icon: GraduationCap,
                title: 'Application Readiness',
                description: 'Real-time readiness scores from eligibility, documents, references, SOP completion, and deadline safety.',
                href: '/dashboard/readiness',
              },
            ].map((feature) => (
              <Card key={feature.title} className="hover:shadow-card-hover transition-shadow h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href={feature.href}>Learn more <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Profile', desc: 'Education, GPA, language scores, research, leadership, goals, constraints' },
              { step: '02', title: 'Discover & Match', desc: 'Search scholarships, get deterministic match scores with evidence breakdown' },
              { step: '03', title: 'Understand Fit', desc: 'See positive/negative factors, missing requirements, deadline risk, source freshness' },
              { step: '04', title: 'Take Action', desc: 'Upload docs, complete SOP, request refs — guided by Best Next Action recommendations' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-primary-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center">
          <Card className="bg-primary text-primary-foreground max-w-2xl mx-auto">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Find Your Scholarship?</h2>
              <p className="text-primary-100 mb-8 text-lg">
                Join students worldwide using ScholarMatch AI to navigate the scholarship application process with confidence.
              </p>
              <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>ScholarMatch AI — Built with deterministic matching, grounded AI, and evidence-based decisions.</p>
          <p className="mt-2">Not an admission predictor. Match scores reflect profile fit only.</p>
        </div>
      </footer>
    </div>
  );
}