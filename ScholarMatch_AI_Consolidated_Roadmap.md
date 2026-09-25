_Version 3.0 — Consolidated Edition_ 

# **SCHOLARMATCH AI** 

## **Consolidated Master Roadmap** 

_Synthesized from six draft roadmaps into one build-ready, $0-budget execution plan_ 

|**Positoning**|Scholarship Decision & Applicaton Intelligence Platorm|
|---|---|
|**Guiding Principle**|Fewer capabilites, built extremely well, with a deterministc core and evidence-<br>backed AI|
|**Development Budget**|$0.00 — 100% free-ter infrastructure|
|**Core Timeline**|12-Week Critcal Path (90-day build order incl. polish)|
|**Source Drafs**|6 prior roadmap drafs reconciled into this document|
|**Version**|3.0 — Consolidated Editon|
|**Date**|September 2, 2026|



_“A recruiter is far more impressed by one working, well-tested, thoughtfully-explained matching engine than by a README listing thirty half-built features.”_ 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 1 of 23 

_Version 3.0 — Consolidated Edition_ 

### **Table of Contents** 

|1. Executve Summary....................................................................................................................................3|
|---|
|2. What This Roadmap Keeps, Cuts, and Defers............................................................................................3|
|3. Target Product Experience.........................................................................................................................6|
|4. System Architecture...................................................................................................................................6|
|5. Unifed Data Model....................................................................................................................................8|
|6. AI Gateway & RAG Design........................................................................................................................10|
|7. Phased Build Plan — 12-Week Critcal Path............................................................................................12|
|8. Security & Trust........................................................................................................................................16|
|9. Testng Strategy & CI/CD..........................................................................................................................16|
|10. Evaluaton & Observability.....................................................................................................................18|
|11. Free-First Technology Stack...................................................................................................................18|
|12. Portolio & Interview Positoning...........................................................................................................20|
|13. Defniton of Done..................................................................................................................................21|
|14. 12-Week Build Order at a Glance..........................................................................................................22|
|15. Deferred Feature Backlog......................................................................................................................22|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 2 of 23 

_Version 3.0 — Consolidated Edition_ 

### **1. Executive Summary** 

Six earlier drafts approached the same project — ScholarMatch AI — from different angles: one prioritized realism and a $0 budget, one proposed a 30-feature tier list, one scoped everything down to a single flagship AI feature, one leaned into vector databases and SHAP-based explainability, and two were full LaTeXformatted 12-to-16-week plans. Each got something right, and each carried something worth cutting. This document merges them into one execution plan: it keeps the disciplined engineering philosophy, the honest treatment of AI (deterministic scoring, AI-generated explanation), the richest data model, and the most defensible technology choices, while explicitly deferring anything that adds infrastructure complexity or unverifiable claims before the core product is real. 

The result is a single roadmap organized as: a philosophy of what to build now versus later, a system architecture, a unified data model, an AI system design, a 12-week phased build plan, and a Definition of Done — followed by a clearly-labeled backlog of the strong ideas from the richer drafts that are genuinely worth building, just not first. 

#### **1.1 Core Positioning** 

ScholarMatch AI is an application intelligence engine, not a scholarship listing site with a chatbot bolted on. It ingests scholarship requirements, verifies sources, evaluates a student profile against them, explains fit in plain language, identifies missing evidence, and recommends the single next action with the highest impact. 

#### **1.2 What Makes This Version Different From Any Single Draft** 

- **It is deterministic where it matters.** The match score is always a rules-based calculation the student can audit; the LLM explains the score, it never invents it. 

- **It is honest about data.** Nothing claims to predict admission probability until real historical outcome data exists to support it. 

- **It is infrastructure-minimal.** One Postgres instance (Supabase) does auth, relational data, full-text search, and vector search — no separate ML microservice, no external vector database, no container orchestration. 

- **It is sequenced for proof, not breadth.** A working vertical slice ships before the feature surface widens, and every later feature is justified by what it demonstrates technically. 

### **2. What This Roadmap Keeps, Cuts, and Defers** 

Rather than silently picking a favorite draft, every consequential idea from all six sources is listed below with an explicit decision. This table is itself part of the portfolio value of the project: it shows the reasoning behind scope decisions, which is exactly what gets asked in interviews. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 3 of 23 

_Version 3.0 — Consolidated Edition_ 

|**Idea**|**Source Draf(s)**|**Decision**|**Ratonale**|
|---|---|---|---|
|8-12 deep capabilites<br>instead of ~30 features|Enhanced Full<br>Roadmap; Realistc<br>Build (v3)|**KEEP**|A coherent, deeply-built product demonstrates<br>more engineering maturity than a long feature<br>list of shallow screens.|
|Deterministc match<br>score; AI only explains it|Enhanced Full<br>Roadmap; Realistc<br>Build (v3)|**KEEP — core rule**|Letng an LLM directly generate the score<br>makes results unauditable, inconsistent<br>between runs, and impossible to regression-<br>test.|
|Separate FastAPI ML<br>microservice + split<br>hostng|Advanced<br>Engineering<br>Roadmap|**CUT**|Unnecessary infrastructure at student-project<br>scale; a modular monolith with a clean AI<br>Gateway interface gives the same separaton<br>of concerns without a second deployment<br>target.|
|Random Forest + SHAP<br>admission-probability<br>predictor|Advanced<br>Engineering<br>Roadmap|**DEFER**|No real historical outcome dataset exists yet.<br>Presentng a probability without labeled<br>admit/reject data would be an unsupported<br>claim, not a feature.|
|External vector<br>database (Pinecone /<br>Qdrant)|Advanced<br>Engineering<br>Roadmap|**CUT → use**<br>**pgvector**|Supabase's built-in pgvector extension covers<br>retrieval needs inside the same free Postgres<br>instance already used for everything else.|
|Full 30-item ter list<br>(country hub, world<br>map, PWA, dark mode,<br>i18n, analytcs…)|Enhancement<br>Roadmap v2; LaTeX<br>v1|**DEFER to backlog**|High polish value, low AI-engineering signal.<br>Sequenced afer the intelligence core is proven<br>(see Secton 14).|
|Vertcal-slice-frst<br>delivery strategy|LaTeX v2|**KEEP as**<br>**philosophy**|Ship one true end-to-end loop (profle →<br>match → explain → chat) before widening the<br>feature surface.|
|“Best Next Acton”<br>signature feature|Enhanced Full<br>Roadmap|**KEEP — fagship**|Unique across all six drafs; demonstrates<br>decision-system thinking, not just CRUD-plus-<br>LLM.|
|Scholarship change<br>detecton / source<br>freshness|Enhanced Full<br>Roadmap;<br>Enhancement<br>Roadmap v2|**KEEP**|No other draf treats staleness of scraped data<br>as a frst-class risk, and deadline data going<br>stale is a real user harm.|
|Manually curated +<br>community-submited<br>seed data (80–150<br>scholarships)|Realistc Build (v3)|**KEEP for Phase 1**|A fragile scraper is the wrong frst bet. Manual<br>seeding unblocks matching, RAG, and the<br>copilot immediately.|
|Full scraping + parsing<br>pipeline with admin<br>review queue|Enhanced Full<br>Roadmap;<br>Enhancement<br>Roadmap v2|**KEEP, sequenced**<br>**later**|Necessary to scale past ~150 records, but not<br>required to prove the core product works.|
|One fagship AI feature|Realistc Build (v3)|**KEEP**|Build one deeply rather than fve shallowly;|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 4 of 23 

_Version 3.0 — Consolidated Edition_ 

|**Idea**|**Source Draf(s)**|**Decision**|**Ratonale**|
|---|---|---|---|
|(SOP Reviewer or<br>Interview Simulator)<br>instead of fve at once|||document the other as planned.|
|AI evaluaton suite + AI<br>Ops dashboard|Enhanced Full<br>Roadmap|**KEEP**|The only draf that treats AI quality as<br>something to be measured, not assumed — a<br>strong interview diferentator.|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 5 of 23 

_Version 3.0 — Consolidated Edition_ 

### **3. Target Product Experience** 

The product should feel like a student's personal scholarship operating system, taking them through one continuous loop: 

1. Create profile — education, GPA, language scores, research, leadership, experience, goals, constraints. 

2. Discover opportunities — search and personalized ranking from a real, sourced scholarship database. 

3. Understand fit — hard eligibility, weighted match, evidence, missing requirements, deadline risk, source freshness. 

4. Build the application — documents, SOP/essay, references, timeline, and checklist. 

5. Optimize effort — see the single highest-impact next action and how it affects multiple applications at once. 

6. Prepare — use the AI Copilot and the one flagship differentiator feature (SOP critic or interview simulator). 

7. Track outcomes — application status, scholarship changes, and personal progress over time. 

#### **3.1 Signature Interaction: Best Next Action** 

##### **Example** 

“Upload your transcript: +9 readiness points, ~15 minutes, affects 6 open applications.” Instead of a flat task list, the system ranks candidate actions by impact, effort, deadline risk, and reuse across applications, and always surfaces exactly one recommendation at a time. 

### **4. System Architecture** 

A modular monolith, not a distributed system. Every draft that proposed splitting into a separate ML microservice or multiple databases added deployment surface without adding user value at this scale. Clear 

internal module boundaries can be extracted into services later only if real load ever requires it. 

Student Web App / Admin Console | v Next.js server functions / API layer | v +-------------------+-------------------+-------------------+ |   PostgreSQL       |   AI Gateway       |  Background Jobs  | |   (Supabase)        |                    |                    | |  profiles           |  prompt registry   |  ingestion         | |  scholarships       |  Gemini adapter     |  scraping          | |  applications        |  local-model fallback | alerts          | 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 6 of 23 

_Version 3.0 — Consolidated Edition_ 

|  documents            |  pgvector RAG      |  re-indexing       | 

|  evidence / evaluations| output validation |  cleanup           | 

+-------------------+-------------------+-------------------+ 

| v Object Storage / Full-Text + Vector Search / Sentry / CI-CD 

#### **4.1 Architecture Rules** 

- Business rules never live inside UI components — they live in server functions and a shared domain layer. 

- All AI providers are accessed through one AI Gateway interface; the rest of the app never imports a provider SDK directly. 

- Every LLM response is schema-validated (Zod) before it is used anywhere — malformed or unsupported output is rejected, not silently trusted. 

- Scholarship records retain source URL, fetch timestamp, verification state, and change history — nothing is silently overwritten. 

- User data is isolated with Postgres Row Level Security, enforced at the database layer, not just in application code. 

- All asynchronous jobs (ingestion, re-scoring, notifications) are idempotent so retries never duplicate records. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 7 of 23 

_Version 3.0 — Consolidated Edition_ 

### **5. Unified Data Model** 

This schema merges the entity lists proposed across drafts: the caching table for match scores (from the detailed LaTeX v1 schema) sits alongside the provenance-first scholarship tables and the AI observability tables (from the Enhanced Full Roadmap), which no other draft included. 

|**Table**|**Purpose**|**Key Fields**|
|---|---|---|
|profles|Student identty + setngs|id, name, natonality, degree, insttuton, goals|
|profle_facts|Structured evidence about the<br>student|type, value, source, confdence, updated_at|
|scholarships|Canonical scholarship records|name, provider, country, deadline, source_url,<br>status|
|scholarship_requirements|Normalized eligibility requirements|feld, operator, value, hard/sof fag, evidence<br>span|
|scholarship_versions|Change history for freshness<br>tracking|scholarship_id, snapshot, content_hash,<br>detected_at|
|applicatons|Student workfow state per<br>scholarship|user_id, scholarship_id, status, readiness_score|
|documents|Uploaded fles + extracted<br>metadata|type, storage_path, extracted_text,<br>verifcaton_state|
|match_scores|Cached deterministc score per pair|user_id, scholarship_id, score, breakdown<br>(JSONB), updated_at|
|references /<br>reference_requests|Referee workfow|name, insttuton, email, status, requested_at,<br>submited_at|
|chat_messages|Copilot conversaton, grounded +<br>cited|thread_id, role, content, citatons|
|ai_runs|AI observability|feature, model, prompt_version, latency, tokens,<br>status|
|evaluatons|Ofine / online AI test outcomes|dataset, case_id, metric, score, model_version|



#### **5.1 Relationship Pattern** 

- User 1–N Applications N–1 Scholarship 

- User 1–1 Profile 

- Scholarship 1–N Requirements, 1–N Versions 

- Application 1–N Documents, 1–N References, 1–N AI Runs 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 8 of 23 

_Version 3.0 — Consolidated Edition_ 

#### **5.2 Important Indexes** 

- scholarships(deadline); scholarships(country, degree_level) 

- scholarship_requirements(field, operator) 

- applications(user_id, status); applications(user_id, scholarship_id) UNIQUE 

- ai_runs(user_id, feature, created_at) 

- Full-text index on scholarships for search; pgvector index for RAG retrieval 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 9 of 23 

_Version 3.0 — Consolidated Edition_ 

### **6. AI Gateway & RAG Design** 

#### **6.1 Provider Abstraction** 

One interface, swappable adapters. No feature imports a model SDK directly — this is what lets the primary provider change (or fail over) without touching product code. 

###### interface AIProvider { 

generateStructured<T>(input: unknown, schema: ZodSchema<T>): Promise<T>; embed(input: string): Promise<number[]>; } // Adapters: Gemini (primary, free tier) -> Groq/OpenRouter (fallback) // -> Ollama local model (dev-time / offline fallback) // The rest of the app only ever talks to AIProvider. 

#### **6.2 The One Non-Negotiable Rule: Deterministic Score, AI Explanation** 

##### **Rule** 

The match score is always computed by code from structured requirements and profile facts. The LLM is only ever used to explain a score that already exists, extract structure from unstructured scholarship text, or generate grounded prose (chat answers, SOP feedback, interview questions). It never invents the number a student's future depends on. 

Recommended starting weights for the deterministic formula (tunable, versioned, and shown to the user as “Profile Fit” — never framed as an admission probability): 

|**Factor**|**Weight**|**Example Evidence**|
|---|---|---|
|Academics|30%|GPA, degree level, insttuton|
|Experience|20%|Work, volunteering, leadership|
|Research / profle ft|15%|Projects, publicatons, research goals|
|Language|10%|IELTS / TOEFL or language constraints|
|Scholarship ft|15%|Goals, feld, target populaton|
|Readiness / tmeline|10%|Document completeness and deadline risk|



#### **6.3 RAG Flow** 

Question → classify intent → retrieve current scholarship / profile / application facts via pgvector + full-text search → rank evidence → generate answer → validate against schema → attach citations. The model never has to “remember” scholarship details — current records are retrieved at request time, so answers stay accurate as scholarships change. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 10 of 23 

_Version 3.0 — Consolidated Edition_ 

#### **6.4 Prompt Registry** 

|**Prompt**|**Version**|**Purpose**|
|---|---|---|
|eligibility-extract|v1+|Convert scholarship text into structured requirements|
|match-explain|v1+|Explain a deterministc match result in plain language|
|copilot-answer|v1+|Grounded, cited, personalized Q&A|
|sop-review|v1+|Rubric-based essay critque|
|interview-score|v1+|Structured interview feedback|
|next-acton|v1+|Rank candidate actons by impact and efort|



#### **6.5 Explainability Requirements** 

- Show positive and negative factors behind every score. 

- Show which facts came from the student profile versus the scholarship requirements. 

- Show the source evidence span for important requirements. 

- Show what would change the score, and by roughly how much (feeds the What-If Simulator). 

- Show “Why not recommended” for low-ranked opportunities, not just the winners. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 11 of 23 

_Version 3.0 — Consolidated Edition_ 

### **7. Phased Build Plan — 12-Week Critical Path** 

This sequencing merges the disciplined week-by-week structure of the Realistic Build draft with the technical depth of the Enhanced Full Roadmap, folds in the strongest individual ideas from the two full LaTeX plans, and defers the 30-item feature surface from the Enhancement Roadmap v2 to the backlog in Section 15. 

#### **7.1 Phase 0: Engineering Baseline — Week 0–1** 

**Goal:** Make the current prototype safe to evolve before replacing its internals. 

- Repository cleanup: clear module boundaries, remove dead UI state and hardcoded data files. 

- Typed environment configuration with a documented .env.example. 

- Zod validation schemas for profile, scholarship, application, and all API inputs. 

- Route-level error boundaries and structured server error responses. 

- Testing skeleton: Vitest + React Testing Library + Playwright, one smoke test passing in CI. 

- Security baseline: security headers, upload constraints, secret hygiene, no secrets committed. 

- Observability baseline: structured logs + Sentry (free via GitHub Student Developer Pack if eligible). 

##### **Deliverable** 

A codebase where new features can be added without fighting hardcoded state — nothing user-facing yet, but everything after this is safer to build. 

#### **7.2 Phase 1: Real Data & Authentication — Weeks 1–3** 

**Goal:** Replace every hardcoded array and localStorage call with a real, authenticated backend. 

- Supabase project: Postgres schema + migrations via Drizzle ORM. 

- Supabase Auth: email/password plus Google/GitHub OAuth; protected routes; password reset. 

- Row Level Security so each user reads and writes only their own profile, applications, and documents. 

- Supabase Storage for documents: private buckets, short-lived signed URLs. 

- Replace localStorage application state with server mutations; keep localStorage only for harmless UI prefs (theme, sidebar). 

- Seed 80–150 real scholarships by manual curation (Chevening, DAAD, Fulbright, Erasmus, Commonwealth, MEXT) rather than building a scraper first. 

- Add a lightweight “Community Submit” form with an admin-approval queue to keep growing the dataset without a fragile scraper. 

##### **Deliverable** 

A working app with real signup/login, real scholarship data from a database, and a profile that persists across 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 12 of 23 

_Version 3.0 — Consolidated Edition_ 

sessions — zero hardcoded state remains. 

#### **7.3 Phase 2: Eligibility Extraction & Deterministic Matching — Weeks 4–5** 

**Goal:** Replace static match percentages with a real, explainable, two-stage matching engine. 

- Eligibility extraction: convert scholarship text into structured requirements (nationality, degree level, GPA/IELTS minimums, documents), AI-assisted but schema-validated and evidence-linked. 

- Two-stage matching: hard eligibility gate first, then the weighted scoring formula from Section 6.2 for everything that passes. 

- Explainability UI: positive/negative factors, evidence sources, “Why not recommended.” 

- Cache computed scores per user-scholarship pair; recompute automatically when the profile changes. 

- Design (but do not yet run at scale) the ingestion pipeline: fetch → parse → extract → normalize → validate → deduplicate → change-detect → admin review → publish. 

##### **Deliverable** 

A real, explainable AI matching system — deterministic, debuggable, and never a black-box percentage. 

#### **7.4 Phase 3: AI Copilot (RAG) — Weeks 6–7** 

**Goal:** Ship one genuinely impressive, grounded AI feature: a retrieval-augmented advisor. 

- Generate embeddings for scholarship records with a free Hugging Face sentence-transformer model. 

- Store and query vectors with Supabase pgvector — no external vector database. 

- Retrieve current scholarship + profile + application facts at request time; rank evidence; generate a grounded, cited answer; validate the output shape before rendering. 

- Chat UI: floating bubble + dedicated /chat route, markdown rendering, persisted history in chat_messages. 

- Support concrete query types: “Which scholarships should I apply to first?”, “What are my weakest areas?”, “Compare Chevening vs. DAAD for me.” 

##### **Deliverable** 

A working, grounded RAG chatbot — a legitimate retrieval implementation with citations, not a wrapped prompt. 

#### **7.5 Phase 4: One Flagship Differentiator + Document Intelligence — Week 8** 

**Goal:** Build one AI feature deeply rather than several shallowly, and make document upload real. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 13 of 23 

_Version 3.0 — Consolidated Edition_ 

- Choose one: AI SOP/Essay Reviewer (alignment score, grammar/tone/structure feedback, missing elements, readability, version history) OR AI Interview Simulator (scholarship-specific questions, text or Web Speech API answers, rubric-scored feedback report). 

- Document the un-chosen option as “planned” in the README rather than half-building both. 

- Wire up real document upload to Supabase Storage with drag-and-drop and progress indicators. 

- Basic AI verification checks (Gemini Vision, free tier): blurry scans, wrong language, CVs over the recommended length. 

- Map extracted document evidence back into structured profile facts. 

##### **Deliverable** 

One deeply polished, technically interesting AI feature plus a real, privacy-respecting document pipeline — the part of the demo that stands out most in a portfolio review. 

#### **7.6 Phase 5: Application Readiness & Best Next Action — Weeks 9–10** 

**Goal:** Turn all the real state gathered so far into the product's signature decision-support feature. 

- Application Readiness Score computed from eligibility, documents, SOP completion, references, profile strength, and deadline safety — all real, no placeholders. 

- Best Next Action ranking: impact, effort, deadline risk, and reuse-across-applications, surfaced as a single recommendation (Section 3.1). 

- Scholarship change detection: diff scholarship_versions and notify affected users when a saved scholarship changes. 

- “Why Not This Scholarship?” view built directly on the explainability data from Phase 2. 

##### **Deliverable** 

The full signature loop — profile → match → evidence → readiness → best next action — running on real data end-to-end. 

#### **7.7 Phase 6: Production Excellence & Portfolio Polish — Weeks 11–12** 

**Goal:** Make the project measurable, tested, deployable, and demo-ready. 

- AI evaluation suite: a versioned benchmark of extraction, matching, grounding, and review cases; every 

   - prompt/model change runs it before release (Section 10). 

- AI Ops dashboard: requests per feature/model, success and validation-failure rate, latency, cachedresponse rate, top failure categories. 

- Full testing layers: unit (Vitest), component (RTL), end-to-end (Playwright) covering signup → profile → match → chat → application → readiness. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 14 of 23 

_Version 3.0 — Consolidated Edition_ 

- CI/CD: GitHub Actions — lint → typecheck → unit → build → E2E → security checks → deploy preview → merge → production, branch protection required. 

- Security hardening: rate limiting on AI endpoints, CSP headers, upload validation, prompt-injection defenses (Section 8). 

- README rewrite: architecture diagram, setup, screenshots/demo GIF, limitations, privacy assumptions, and an explicit “Planned Features” section for the backlog in Section 15. 

##### **Deliverable** 

A tested, observable, CI-integrated, honestly-documented project ready to walk a recruiter or interviewer through end to end. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 15 of 23 

_Version 3.0 — Consolidated Edition_ 

### **8. Security & Trust** 

|**Area**|**Implementaton**|
|---|---|
|Authorizaton|Supabase Row Level Security + server-side checks on every mutaton|
|Secrets|Environment variables only; server keys never reach the browser bundle|
|Validaton|Zod schemas on all external inputs, including AI tool outputs|
|Uploads|Allowlisted MIME types, maximum size, private buckets, signed URLs|
|Rate limitng|Per-user / per-IP limits on AI and other expensive endpoints|
|AI safety|Retrieved web content is treated as untrusted; prompt-injecton defenses in place|
|Source trust|Ofcial source links + last-verifed tmestamps shown to the user|
|Privacy|Clear retenton policy; user-controlled export and deleton|
|Auditability|Critcal data changes and AI run metadata are recorded|
|Error handling|No stack traces or secret confguraton ever leak to the client|



#### **8.1 Prompt Injection Defense** 

Scholarship pages are untrusted text. Nothing scraped from a website is ever allowed to instruct the system to ignore developer rules, reveal secrets, or perform arbitrary actions. “Data to analyze” is always kept separate from “instructions to the model,” and every model output is validated against its expected schema before use — this is the same guarantee that makes the deterministic-score rule in Section 6.2 enforceable in practice, not just in principle. 

### **9. Testing Strategy & CI/CD** 

|**Layer**|**Examples**|
|---|---|
|Unit|Scoring formula, deadline-risk calculaton, status transitons, normalizaton logic|
|Component|Profle forms, flters, scholarship cards, readiness widgets|
|Integraton|Auth fows, database reads/writes, AI Gateway adapters|
|End-to-end|Signup → profle → match → save → applicaton → document → readiness|
|Data pipeline|Parsing, duplicate detecton, change detecton, validaton|
|AI regression|Fixed benchmark of extracton, matching, grounding, and review cases|
|Security|Authorizaton boundaries, invalid uploads, injecton-like inputs|



#### **9.1 Critical Edge Cases to Cover** 

- Missing GPA or language score. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 16 of 23 

_Version 3.0 — Consolidated Edition_ 

- Scholarship deadline absent or contradictory across sections of the source page. 

- A requirement says “preferred” rather than “required.” 

- The same scholarship appears under two different source URLs. 

- The AI returns malformed JSON, or a value unsupported by source evidence. 

- A scholarship changes after a student has already saved it. 

- A deadline is tomorrow but required documents are still incomplete. 

#### **9.2 CI/CD Pipeline** 

Pull Request 

- -> lint -> typecheck -> unit tests -> build -> E2E -> security checks 

- -> deploy preview -> merge -> production 

- GitHub Actions on standard hosted runners — free and unlimited for public repositories under current policy. 

- Database migrations kept explicit and reviewable; seed data only runs in non-production environments. 

- Dependabot or Renovate for dependency updates; main branch protected, CI required to pass. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 17 of 23 

_Version 3.0 — Consolidated Edition_ 

### **10. Evaluation & Observability** 

This is the capability that separates “we added an LLM” from “we built and measured an AI system.” None of the other five drafts scoped this out explicitly, and it is one of the strongest interview talking points available. 

|**Capability**|**Measure**|**Target Directon**|
|---|---|---|
|Eligibility extracton|Precision / recall / F1 by feld|Increase precision on hard constraints|
|Requirement classifcaton|Accuracy + schema-valid rate|Minimize invalid structured output|
|Matching|Top-3 recall / ranking quality vs. labeled<br>examples|Improve relevant recommendatons|
|Citaton grounding|Supported-claim rate|High — unsupported claims should be rare|
|SOP review|Agreement with a human rubric|Increase consistency|
|AI latency|p50 / p95|Lower|
|Failure rate|Request + validaton failures|Lower|



#### **10.1 Evaluation Dataset** 

A small, versioned benchmark built from manually reviewed scholarship pages and synthetic student profiles, deliberately including ambiguous, missing, contradictory, and malformed requirement cases. Every prompt or model change runs against this benchmark before release. 

#### **10.2 AI Ops Dashboard** 

- Requests per feature and model. 

- Success rate and validation-failure rate. 

- Average and p95 latency. 

- Cached-response rate and prompt-version distribution. 

- Top failure categories and user thumbs-up/down or correction feedback. 

### **11. Free-First Technology Stack** 

Every technology below has a free tier sufficient for a student project. Availability, limits, and pricing can change — verify current terms before relying on any of them in production. 

|**Need**|**Recommended**|**Notes**|
|---|---|---|
|Database / Auth /<br>Storage|Supabase (free ter)|Postgres, Auth, private fle storage, Row Level Security|
|ORM|Drizzle ORM|Typed schema + migratons|
|Vector search|Supabase pgvector|Built in, no external vector database or extra cost|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 18 of 23 

_Version 3.0 — Consolidated Edition_ 

|**Need**|**Recommended**|**Notes**|
|---|---|---|
|Primary AI|Google Gemini API (free ter)|Structured generaton, chat, explanatons, vision checks|
|Fallback AI|Groq / OpenRouter free models|Used if the primary provider is rate-limited or<br>unavailable|
|Local AI|Ollama|Local fallback for development and ofine<br>experimentaton|
|Embeddings|Hugging Face sentence-<br>transformers|Free inference for RAG embeddings|
|Scraping (Phase 1.5+)|Cheerio + Playwright|Cheerio for statc HTML, Playwright only where JS<br>executon is required|
|Scheduled jobs|Cloudfare Workers / GitHub<br>Actons|Ingeston, re-scoring, cleanup, subject to current free<br>limits|
|Email|Resend (free ter)|Notfcatons and reminders within current quota|
|Testng|Vitest + Playwright|Unit, component, and end-to-end coverage|
|Observability|Sentry via GitHub Student<br>Developer Pack (if eligible)|Errors and traces without paying during eligibility|
|Hostng|Cloudfare Pages + Workers|Preview deploys per PR, producton on merge to main|
|Charts (backlog)|Recharts|Analytcs, readiness, and comparison views once built|
|Maps (backlog)|Leafet + OpenStreetMap tles|Interactve geography without a paid map SDK|
|i18n (backlog)|react-i18next|Bengali frst, then additonal languages|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 19 of 23 

_Version 3.0 — Consolidated Edition_ 

### **12. Portfolio & Interview Positioning** 

#### **12.1 Resume Framing** 

Built an AI-powered scholarship application intelligence platform using TypeScript, Next.js, PostgreSQL/Supabase, deterministic eligibility and ranking, retrieval-augmented generation, automated scholarship ingestion, document intelligence, and AI evaluation/observability tooling. 

#### **12.2 Strong Interview Talking Points** 

- Why is the final match score deterministic instead of generated by the LLM? 

- How do you keep scholarship information fresh and auditable? 

- How do you defend against prompt injection from scraped web content? 

- How do you evaluate whether an AI change actually improved the system? 

- How do you keep AI provider dependencies replaceable? 

- How do you prevent one user from ever seeing another user's documents? 

- What happens when the AI provider is unavailable? 

- What is cached, and why? 

- How would this system scale beyond a student project? 

#### **12.3 Demo Sequence** 

8. Open the dashboard and show real scholarship records. 

9. Open one scholarship and show its official source, verification time, and structured requirements. 

10. Show a profile → deterministic match score → evidence breakdown. 

11. Click “Why not recommended?” on a lower-ranked scholarship. 

12. Upload a CV → watch facts get extracted → show the readiness score change. 

13. Ask the Copilot a deadline-aware question → show the citations. 

14. Use Best Next Action → walk through the impact/effort reasoning. 

15. Open the AI evaluation dashboard → show real metrics and one failed test case. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 20 of 23 

_Version 3.0 — Consolidated Edition_ 

### **13. Definition of Done** 

The project is portfolio-ready when every item below is true — combining the completion checklist from the Enhanced Full Roadmap with the Realistic Build draft's insistence on an honest, demo-ready scope rather than a longer but half-finished one. 

- No core scholarship or application state is hardcoded or stored only in localStorage. 

- Users can authenticate and only ever access their own data. 

- Scholarships come from a repeatable ingestion process with source provenance. 

- Eligibility is extracted into structured data and schema-validated. 

- Match scores are deterministic, explainable, and clearly labeled as “Profile Fit” — never an unsupported admission probability. 

- The AI Copilot retrieves current scholarship/profile evidence and cites sources. 

- Documents can be uploaded privately and contribute structured evidence to the profile. 

- Application Readiness and Best Next Action are computed from real state, not placeholders. 

- AI prompts are versioned and evaluated against a benchmark. 

- AI and backend failures are observable, not silent. 

- Core flows have automated tests, and CI runs on every pull request. 

- The README documents architecture, setup, screenshots, demo, limitations, and privacy assumptions — including an honest “Planned Features” backlog. 

- At least one feature demonstrates scholarship change detection or source freshness. 

ScholarMatch AI — Consolidated Master Roadmap   •   Page 21 of 23 

_Version 3.0 — Consolidated Edition_ 

### **14. 12-Week Build Order at a Glance** 

|**Weeks**|**Focus**|**Primary Outputs**|
|---|---|---|
|0–1|Engineering Baseline|Refactor, Zod schemas, error handling, test skeleton, env/security<br>baseline|
|1–3|Backend + Auth|Supabase, Drizzle, RLS, Auth, Storage, real applicaton state,<br>seeded scholarships|
|4–5|Matching Engine|Eligibility extracton, hard gate + weighted score, explainability,<br>search|
|6–7|AI Copilot (RAG)|pgvector retrieval, grounded + cited chat, prompt registry|
|8|Flagship Feature + Documents|SOP Reviewer or Interview Simulator, real document upload + AI<br>checks|
|9–10|Applicaton Intelligence|Readiness score, Best Next Acton, change detecton, Why Not<br>This Scholarship|
|11–12|Producton Excellence|Evaluaton suite, observability, testng, CI/CD, docs, demo polish|



Build the intelligence core first. The UI is then simply the surface of a system that is already real underneath it — the same principle every draft agreed on, even the ones that disagreed on almost everything else. 

### **15. Deferred Feature Backlog** 

These are strong ideas pulled from the Enhancement Roadmap v2, LaTeX v1, and LaTeX v2 drafts. None of them are cut — they are sequenced after the Definition of Done in Section 13 is met, and should be listed in the README as “Planned Features” so the roadmap's ambition stays visible without overclaiming what is actually built today. 

|**Feature**|**Why It's Sequenced Afer the Core**|
|---|---|
|Reference Leter Manager|Real coordinaton pain point; straightorward once auth + email exist.|
|Smart Calendar + Google/iCal Sync|High practcal value, low technical risk; good “week of” project.|
|Country Intelligence Hub|Useful context but data-heavy; needs several free external APIs wired up.|
|Personal Analytcs Dashboard|Match-score trends, pipeline funnel, profle-strength radar — pure read-side<br>work once real data exists.|
|Side-by-Side Scholarship<br>Comparison|Straightorward once match scores and requirements are structured.|
|Scholarship World Map|Strong visual discovery feature; not core AI-engineering signal.|
|Applicaton Strength Meter|Restates the readiness score visually; nice-to-have polish.|
|What-If Profle Simulator|High product value once the deterministc formula is live — promote to core if|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 22 of 23 

_Version 3.0 — Consolidated Edition_ 

|**Feature**|**Why It's Sequenced Afer the Core**|
|---|---|
||tme allows.|
|Smart Notfcatons & Alert Feed|Needs Realtme + email digestng; sequence afer core loop is stable.|
|PWA / Ofine Mode|Genuinely valuable for low-connectvity users; a well-scoped fnal-week<br>additon.|
|Dark Mode|Pure UI polish; cheap to add whenever, not a diferentator.|
|Internatonalizaton (Bengali frst)|Important for the real target audience; do afer the English product is proven.|
|Accessibility hardening (WCAG 2.1<br>AA)|Should happen before public launch, not before the product exists.|
|Community-submited<br>scholarships at scale + moderaton|Extends the Phase 1 community-submit form into a full workfow.|
|Explainable success predictor (real<br>ML model)|Only atempt once genuine historical outcome data has been collected — see<br>Secton 2.|



ScholarMatch AI — Consolidated Master Roadmap   •   Page 23 of 23 

