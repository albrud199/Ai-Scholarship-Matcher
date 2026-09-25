export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nationality: string;
  current_degree: string;
  current_institution: string;
  target_degree_level: 'bachelor' | 'master' | 'phd' | 'postdoc';
  target_field_of_study: string;
  gpa?: number;
  gpa_scale?: string;
  ielts_score?: number;
  toefl_score?: number;
  other_language_scores: Record<string, number>;
  research_experience: ResearchExperience[];
  work_experience: WorkExperience[];
  leadership_experience: LeadershipExperience[];
  publications: Publication[];
  awards: Award[];
  goals: string;
  constraints: ProfileConstraints;
  created_at: string;
  updated_at: string;
}

export interface ResearchExperience {
  id: string;
  title: string;
  institution: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface WorkExperience {
  id: string;
  title: string;
  organization: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface LeadershipExperience {
  id: string;
  role: string;
  organization: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  doi?: string;
  url?: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  year: number;
  description?: string;
}

export interface ProfileConstraints {
  preferred_countries: string[];
  max_tuition_budget?: number;
  funding_type: 'full' | 'partial' | 'any';
  language_requirements: string[];
  exclude_countries: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  provider_type: 'government' | 'university' | 'foundation' | 'corporate' | 'international_org';
  country: string;
  country_code: string;
  degree_level: 'bachelor' | 'master' | 'phd' | 'postdoc' | 'any';
  field_of_study: string[];
  deadline: string;
  description: string;
  eligibility_criteria: string;
  benefits: string[];
  application_url: string;
  source_url: string;
  source_verified_at: string;
  status: 'active' | 'expired' | 'draft' | 'archived';
  requirements: ScholarshipRequirement[];
  created_at: string;
  updated_at: string;
}

export interface ScholarshipRequirement {
  id: string;
  scholarship_id: string;
  field: string;
  operator: 'eq' | 'gte' | 'lte' | 'contains' | 'in' | 'not_in';
  value: string | number | boolean | string[];
  is_hard_requirement: boolean;
  evidence_span?: string;
  weight: number;
}

export interface Application {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
  readiness_score: number;
  documents: ApplicationDocument[];
  references: Reference[];
  sop_content?: string;
  notes: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  scholarship?: Scholarship;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  type: 'transcript' | 'cv' | 'sop' | 'recommendation_letter' | 'language_test' | 'passport' | 'other';
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  extracted_text?: string;
  verification_state: 'pending' | 'verified' | 'failed' | 'needs_review';
  uploaded_at: string;
}

export interface Reference {
  id: string;
  application_id: string;
  name: string;
  institution: string;
  email: string;
  relationship: string;
  status: 'requested' | 'submitted' | 'declined';
  requested_at: string;
  submitted_at?: string;
}

export interface MatchScore {
  user_id: string;
  scholarship_id: string;
  score: number;
  breakdown: MatchBreakdown;
  eligibility_passed: boolean;
  missing_hard_requirements: string[];
  updated_at: string;
}

export interface MatchBreakdown {
  academics: number;
  experience: number;
  research: number;
  language: number;
  scholarship_fit: number;
  readiness: number;
  total: number;
  factors: MatchFactor[];
}

export interface MatchFactor {
  category: string;
  label: string;
  score: number;
  max_score: number;
  evidence: string;
  is_positive: boolean;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface Citation {
  id: string;
  source_type: 'scholarship' | 'profile' | 'document' | 'application';
  source_id: string;
  excerpt: string;
  relevance_score: number;
}

export interface BestNextAction {
  id: string;
  application_id: string;
  action_type: 'upload_document' | 'complete_sop' | 'request_reference' | 'improve_language_score' | 'add_experience' | 'meet_deadline';
  title: string;
  description: string;
  impact_score: number;
  effort_minutes: number;
  deadline_risk: 'low' | 'medium' | 'high';
  affects_applications: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface ReadinessScore {
  application_id: string;
  overall_score: number;
  components: ReadinessComponent[];
  last_calculated: string;
}

export interface ReadinessComponent {
  name: string;
  score: number;
  max_score: number;
  weight: number;
  status: 'complete' | 'in_progress' | 'missing';
  details: string;
}

export interface ScholarshipVersion {
  id: string;
  scholarship_id: string;
  snapshot: Partial<Scholarship>;
  content_hash: string;
  detected_at: string;
  change_summary: string;
}

export interface AIRun {
  id: string;
  user_id: string;
  feature: 'eligibility_extract' | 'match_explain' | 'copilot_answer' | 'sop_review' | 'interview_score' | 'next_action';
  model: string;
  prompt_version: string;
  latency_ms: number;
  tokens_used: number;
  status: 'success' | 'validation_failed' | 'error';
  error_message?: string;
  created_at: string;
}