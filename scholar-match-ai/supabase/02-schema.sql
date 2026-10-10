-- ScholarMatch AI — Part 2 schema: scholarship catalog + application tracker.
-- Run in Supabase SQL Editor AFTER 01-schema.sql (the original schema.sql).

-- ============================================================
-- 1. SCHOLARSHIP CATALOG (shared, readable by authenticated users)
-- ============================================================
create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  provider text not null default '',
  provider_type text not null default 'government'
    check (provider_type in ('government','university','foundation','corporate','international_org')),
  country text not null default '',
  country_code text not null default '',
  degree_level text not null default 'any'
    check (degree_level in ('bachelor','master','phd','postdoc','any')),
  field_of_study text[] not null default '{}',
  deadline date,
  description text not null default '',
  eligibility_criteria text not null default '',
  benefits text[] not null default '{}',
  application_url text not null default '',
  source_url text not null default '',
  source_verified_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','expired','draft','archived')),
  requirements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scholarships enable row level security;

drop policy if exists "Catalog readable by authenticated users" on public.scholarships;
create policy "Catalog readable by authenticated users"
  on public.scholarships for select to authenticated using (true);

-- ============================================================
-- 2. APPLICATION TRACKER (per-user, RLS-scoped)
-- ============================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft','in_progress','submitted','under_review','accepted','rejected','waitlisted','withdrawn')),
  readiness_score int not null default 0 check (readiness_score between 0 and 100),
  sop_content text,
  notes text not null default '',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scholarship_id)
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  type text not null default 'other'
    check (type in ('transcript','cv','sop','recommendation_letter','language_test','passport','other')),
  file_name text not null,
  storage_path text not null,
  file_size int not null default 0,
  mime_type text not null default 'application/octet-stream',
  verification_state text not null default 'pending'
    check (verification_state in ('pending','verified','failed','needs_review')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.application_references (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  name text not null,
  institution text not null default '',
  email text not null default '',
  relationship text not null default '',
  status text not null default 'requested' check (status in ('requested','submitted','declined')),
  requested_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists idx_applications_user on public.applications (user_id);
create index if not exists idx_applications_scholarship on public.applications (scholarship_id);
create index if not exists idx_docs_application on public.application_documents (application_id);
create index if not exists idx_refs_application on public.application_references (application_id);

alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_references enable row level security;

-- applications
drop policy if exists "Users CRUD their own applications" on public.applications;
create policy "Users CRUD their own applications"
  on public.applications for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- documents (ownership via parent application)
drop policy if exists "Users CRUD docs on own applications" on public.application_documents;
create policy "Users CRUD docs on own applications"
  on public.application_documents for all to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- references
drop policy if exists "Users CRUD refs on own applications" on public.application_references;
create policy "Users CRUD refs on own applications"
  on public.application_references for all to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_applications_updated on public.applications;
create trigger trg_applications_updated
  before update on public.applications
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_scholarships_updated on public.scholarships;
create trigger trg_scholarships_updated
  before update on public.scholarships
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- 3. SEED: real, well-known fully-funded scholarships
--    (deadlines are indicative; verify at source before applying)
-- ============================================================
insert into public.scholarships
  (slug, name, provider, provider_type, country, country_code, degree_level,
   field_of_study, deadline, description, eligibility_criteria, benefits, application_url, source_url, requirements)
values
  ('chevening', 'Chevening Scholarships', 'UK Government (FCDO)', 'government', 'United Kingdom', 'GB', 'master',
   '{any}', '2026-11-05',
   'The UK government''s flagship international award funding a one-year master''s degree at any UK university, with a focus on leadership and public impact.',
   'Undergraduate degree, 2+ years (2,800 hours) of work experience, return to home country for 2 years, strong leadership network fit.',
   '{Full tuition, Monthly stipend, Return flights, Arrival allowance, Visa fee}',
   'https://www.chevening.org/scholarships/', 'https://www.chevening.org/scholarships/',
   '[{"id":"r1","scholarship_id":"","field":"work_experience_years","operator":"gte","value":2,"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"degree_level","operator":"in","value":["master"],"is_hard_requirement":true,"weight":1},
     {"id":"r3","scholarship_id":"","field":"ielts","operator":"gte","value":6.5,"is_hard_requirement":false,"weight":0.5}]'::jsonb),

  ('daad-epos', 'DAAD EPOS Development-Related Masters', 'DAAD (German Academic Exchange Service)', 'government', 'Germany', 'DE', 'master',
   '{engineering,economics,public_policy,environmental_science,health}', '2026-10-31',
   'Fully-funded master''s programmes in Germany for professionals from developing countries with at least two years of relevant work experience.',
   'Bachelor''s (usually 2nd class or above), 2+ years professional experience, degree no older than 6 years, development-related field.',
   '{Full tuition, Monthly stipend (EUR 992+), Travel allowance, Health insurance}',
   'https://www.daad.de/en/study-and-research-in-germany/scholarships/development-related-postgraduate-courses/', 'https://www.daad.de/en/',
   '[{"id":"r1","scholarship_id":"","field":"work_experience_years","operator":"gte","value":2,"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"degree_level","operator":"in","value":["master"],"is_hard_requirement":true,"weight":1}]'::jsonb),

  ('fulbright-foreign', 'Fulbright Foreign Student Program', 'U.S. Department of State', 'government', 'United States', 'US', 'master',
   '{any}', '2026-05-31',
   'The flagship U.S. exchange program funding graduate study in the U.S. for international students, administered by binational commissions.',
   'Bachelor''s degree, English proficiency (TOEFL/IELTS), country-specific requirements, return home after the program.',
   '{Full tuition, Living stipend, Airfare, Health benefits, Pre-academic training}',
   'https://foreign.fulbrightonline.org/', 'https://foreign.fulbrightonline.org/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["master","phd"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"toefl","operator":"gte","value":90,"is_hard_requirement":false,"weight":0.5},
     {"id":"r3","scholarship_id":"","field":"ielts","operator":"gte","value":6.5,"is_hard_requirement":false,"weight":0.5}]'::jsonb),

  ('erasmus-mundus', 'Erasmus Mundus Joint Masters (EMJM)', 'European Commission', 'government', 'Multiple (EU)', 'EU', 'master',
   '{any}', '2027-01-15',
   'EU-funded integrated master''s programs run by consortia of European universities; students study in 2–3 countries and receive a joint degree.',
   'Bachelor''s degree in a related field, English proficiency, open to all nationalities; strong academic record preferred.',
   '{Full tuition, Monthly allowance (EUR 1,400), Travel costs, Installation cost, Insurance}',
   'https://www.eacea.ec.europa.eu/scholarships/emjm-catalogue_en', 'https://www.eacea.ec.europa.eu/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["master"],"is_hard_requirement":true,"weight":1}]'::jsonb),

  ('australia-awards', 'Australia Awards Scholarships', 'Australian Government (DFAT)', 'government', 'Australia', 'AU', 'master',
   '{any}', '2026-04-30',
   'Long-term development awards for students from partner countries in the Indo-Pacific, Africa, and the Middle East.',
   'Citizen of a participating country, minimum 2 years work/home-country residency, return home for 2 years after study.',
   '{Full tuition, Return air travel, Establishment allowance, Contribution to living expenses, Overseas student health cover}',
   'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships', 'https://www.dfat.gov.au/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["master","phd"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"work_experience_years","operator":"gte","value":1,"is_hard_requirement":false,"weight":0.5}]'::jsonb),

  (' gates-cambridge', 'Gates Cambridge Scholarship', 'Gates Cambridge Trust', 'foundation', 'United Kingdom', 'GB', 'phd',
   '{any}', '2026-12-03',
   'Full-cost postgraduate scholarships at the University of Cambridge for outstanding applicants from outside the UK.',
   'Apply to a full-time postgraduate course at Cambridge, outstanding intellectual ability, leadership capacity, commitment to improving the lives of others.',
   '{Full cost of study, Maintenance allowance, Airfare, Family allowance, Academic development funding}',
   'https://www.gatescambridge.org/', 'https://www.gatescambridge.org/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["phd","master"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"gpa","operator":"gte","value":3.7,"is_hard_requirement":false,"weight":0.8},
     {"id":"r3","scholarship_id":"","field":"research","operator":"gte","value":1,"is_hard_requirement":false,"weight":0.5}]'::jsonb),

  ('rhodes', 'Rhodes Scholarship', 'Rhodes Trust', 'foundation', 'United Kingdom', 'GB', 'master',
   '{any}', '2026-07-01',
   'The oldest international graduate scholarship, funding full-time study at the University of Oxford for exceptional young leaders.',
   'Age 19–27 (country-specific), outstanding intellect, character, leadership, and service; bachelor''s degree required.',
   '{All university fees, Annual stipend (GBP 19,000+), Two economy flights, Settling-in allowance}',
   'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/', 'https://www.rhodeshouse.ox.ac.uk/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["master","phd"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"gpa","operator":"gte","value":3.7,"is_hard_requirement":false,"weight":0.8},
     {"id":"r3","scholarship_id":"","field":"leadership","operator":"gte","value":1,"is_hard_requirement":false,"weight":0.6}]'::jsonb),

  ('mext-japan', 'MEXT Japanese Government Scholarship (Research Students)', 'Government of Japan (MEXT)', 'government', 'Japan', 'JP', 'phd',
   '{engineering,science,computer_science,medicine,economics}', '2026-06-10',
   'Japanese government scholarship covering research/master''s study in Japan, initially as a research student with thesis-track promotion.',
   'Under 35 years old, bachelor''s degree, academic excellence; Japanese/English proficiency per program.',
   '{Full tuition, Monthly stipend (JPY 143,000–145,000), Round-trip airfare, No service obligation}',
   'https://www.studyinjapan.go.jp/en/planning/scholarship/', 'https://www.studyinjapan.go.jp/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["master","phd"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"gpa","operator":"gte","value":3.0,"is_hard_requirement":false,"weight":0.7}]'::jsonb),

  ('ksa-kaust', 'KAUST Fellowship', 'King Abdullah University of Science and Technology', 'university', 'Saudi Arabia', 'SA', 'phd',
   '{engineering,science,computer_science}', '2027-01-10',
   'All admitted KAUST students receive the fellowship: full tuition plus generous stipend at a research university on the Red Sea.',
   'Strong academic record in science/engineering, English proficiency (TOEFL 79+/IELTS 6.5+), GRE optional, research aptitude.',
   '{Full tuition, Monthly living allowance (USD 2,000–2,900), Housing, Medical coverage, Relocation support}',
   'https://admissions.kaust.edu.sa/', 'https://admissions.kaust.edu.sa/',
   '[{"id":"r1","scholarship_id":"","field":"degree_level","operator":"in","value":["phd","master"],"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"ielts","operator":"gte","value":6.5,"is_hard_requirement":false,"weight":0.5},
     {"id":"r3","scholarship_id":"","field":"toefl","operator":"gte","value":79,"is_hard_requirement":false,"weight":0.5}]'::jsonb),

  ('ewh-rotary', 'Rotary Peace Fellowship', 'Rotary International', 'foundation', 'Multiple', 'XX', 'master',
   '{public_policy,peace_studies,international_relations,development_studies}', '2026-05-15',
   'Fully funded master''s degree in peace and development studies at one of Rotary''s partner universities.',
   'Bachelor''s degree, 3+ years relevant work experience in peace/development, strong commitment to community service, English proficiency.',
   '{Tuition and fees, Room and board, Round-trip transportation, Internship and field-study expenses}',
   'https://www.rotary.org/en/our-programs/peace-fellowships', 'https://www.rotary.org/',
   '[{"id":"r1","scholarship_id":"","field":"work_experience_years","operator":"gte","value":3,"is_hard_requirement":true,"weight":1},
     {"id":"r2","scholarship_id":"","field":"degree_level","operator":"in","value":["master"],"is_hard_requirement":true,"weight":1}]'::jsonb)

on conflict (slug) do nothing;
