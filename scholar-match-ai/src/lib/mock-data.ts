import {
  Profile,
  Scholarship,
  ScholarshipRequirement,
  Application,
  ApplicationDocument,
  Reference,
} from '@/types';

/** Build a deadline N days from today so the seeded data always looks live. */
export function deadlineInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

function req(
  scholarshipId: string,
  field: string,
  operator: ScholarshipRequirement['operator'],
  value: ScholarshipRequirement['value'],
  isHard: boolean,
  evidenceSpan: string,
  weight: number
): ScholarshipRequirement {
  return {
    id: `${scholarshipId}-req-${field}-${String(value)}`,
    scholarship_id: scholarshipId,
    field,
    operator,
    value,
    is_hard_requirement: isHard,
    evidence_span: evidenceSpan,
    weight,
  };
}

export const seedScholarships: Scholarship[] = [
  {
    id: 'chevening',
    name: 'Chevening Scholarship',
    provider: 'UK Foreign, Commonwealth & Development Office',
    provider_type: 'government',
    country: 'United Kingdom',
    country_code: 'GB',
    degree_level: 'master',
    field_of_study: ['any'],
    deadline: deadlineInDays(45),
    description:
      "The UK government's international awards programme aimed at developing global leaders. Offers full funding for a one-year master's degree at any UK university.",
    eligibility_criteria:
      'Applicants must have at least two years (2,800 hours) of work experience, an undergraduate degree, and apply to three UK courses. English language proficiency required by course providers.',
    benefits: ['Full tuition fees', 'Monthly living stipend', 'Return economy flights', 'Arrival and departure allowances'],
    application_url: 'https://chevening.org/scholarships/',
    source_url: 'https://chevening.org/scholarships/',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('chevening', 'degree_level', 'eq', 'master', true, "Funded one-year master's degree at any UK university", 0.3),
      req('chevening', 'work_experience_years', 'gte', 2, true, 'At least two years (2,800 hours) of work experience', 0.4),
      req('chevening', 'ielts', 'gte', 6.5, false, 'English language proficiency required by UK course providers', 0.15),
      req('chevening', 'field_of_study', 'in', ['any'], false, 'Open to all fields of study', 0.15),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'daad-epos',
    name: 'DAAD EPOS Development-Related Postgraduate Courses',
    provider: 'German Academic Exchange Service (DAAD)',
    provider_type: 'government',
    country: 'Germany',
    country_code: 'DE',
    degree_level: 'master',
    field_of_study: ['engineering', 'economics', 'public_policy', 'environmental_science', 'agriculture'],
    deadline: deadlineInDays(120),
    description:
      'Scholarships for professionals from developing countries to pursue development-related postgraduate courses at German universities.',
    eligibility_criteria:
      "Bachelor's degree (usually four years) in a related subject, at least two years of professional experience, and proof of English (IELTS 6.0) or German proficiency.",
    benefits: ['Full tuition coverage', 'Monthly stipend of €992', 'Health insurance', 'Travel allowance'],
    application_url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    source_url: 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('daad-epos', 'degree_level', 'eq', 'master', true, "Development-related postgraduate (master's) courses", 0.3),
      req('daad-epos', 'work_experience_years', 'gte', 2, true, 'At least two years of professional experience', 0.3),
      req('daad-epos', 'ielts', 'gte', 6.0, true, 'Proof of English: IELTS band 6.0', 0.2),
      req('daad-epos', 'field_of_study', 'in', ['engineering', 'economics', 'public_policy', 'environmental_science', 'agriculture'], false, 'Development-related subject areas', 0.2),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'fulbright-foreign',
    name: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State',
    provider_type: 'government',
    country: 'United States',
    country_code: 'US',
    degree_level: 'master',
    field_of_study: ['any'],
    deadline: deadlineInDays(20),
    description:
      "Brings international graduate students to the United States for master's and PhD programs. Administered by binational commissions in each country.",
    eligibility_criteria:
      "Bachelor's degree before the grant starts, English proficiency (TOEFL ~90+ or IELTS 6.5+), leadership potential, and country-specific requirements.",
    benefits: ['Tuition and fees', 'Monthly living stipend', 'Airfare', 'Health benefits'],
    application_url: 'https://foreign.fulbrightonline.org/',
    source_url: 'https://foreign.fulbrightonline.org/fulbright-foreign-student-program-1',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('fulbright-foreign', 'degree_level', 'in', ['master', 'phd'], true, "Master's and PhD programs in the United States", 0.3),
      req('fulbright-foreign', 'ielts', 'gte', 6.5, true, 'English proficiency: IELTS 6.5 or equivalent', 0.3),
      req('fulbright-foreign', 'gpa', 'gte', 3.0, false, "Strong academic record (bachelor's degree)", 0.2),
      req('fulbright-foreign', 'work_experience_years', 'gte', 1, false, 'Leadership and community engagement valued', 0.2),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'erasmus-mundus',
    name: 'Erasmus Mundus Joint Master Scholarships',
    provider: 'European Commission',
    provider_type: 'international_org',
    country: 'Multiple (Europe)',
    country_code: 'EU',
    degree_level: 'master',
    field_of_study: ['any'],
    deadline: deadlineInDays(75),
    description:
      "Excellence scholarships for joint master's programs delivered by consortia of European universities. Study in at least two different European countries.",
    eligibility_criteria:
      "Bachelor's degree in a relevant field, English proficiency (typically IELTS 6.5 / TOEFL 92). Specific programs have additional requirements.",
    benefits: ['Full participation costs', 'Monthly allowance of €1,400', 'Travel and installation costs'],
    application_url: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students',
    source_url: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters-scholarships',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('erasmus-mundus', 'degree_level', 'eq', 'master', true, "Joint master's programs only", 0.35),
      req('erasmus-mundus', 'ielts', 'gte', 6.5, true, 'English proficiency: typically IELTS 6.5 / TOEFL 92', 0.3),
      req('erasmus-mundus', 'gpa', 'gte', 3.0, false, "Bachelor's degree in a relevant field", 0.2),
      req('erasmus-mundus', 'field_of_study', 'in', ['any'], false, 'Wide range of program fields', 0.15),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'mext-japan',
    name: 'MEXT Japanese Government Scholarship (Research Students)',
    provider: 'Government of Japan (MEXT)',
    provider_type: 'government',
    country: 'Japan',
    country_code: 'JP',
    degree_level: 'phd',
    field_of_study: ['any'],
    deadline: deadlineInDays(60),
    description:
      'Japanese government scholarship for research students pursuing graduate studies in Japan, covering social sciences through natural sciences.',
    eligibility_criteria:
      "Under 35 years of age, bachelor's degree (or master's for doctoral track), GPA of 2.30/3.00 or better on the last two years, willingness to learn Japanese.",
    benefits: ['Full tuition', 'Monthly stipend of ¥143,000–145,000', 'Round-trip airfare', 'No service obligation after graduation'],
    application_url: 'https://www.studyinjapan.go.jp/en/planning/scholarship/',
    source_url: 'https://www.studyinjapan.go.jp/en/planning/scholarship/type-a/',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('mext-japan', 'degree_level', 'in', ['master', 'phd'], true, "Graduate research students (master's or doctoral track)", 0.3),
      req('mext-japan', 'gpa', 'gte', 3.05, true, 'GPA of 2.30/3.00 or better on the last two years (≈3.05/4.00)', 0.35),
      req('mext-japan', 'field_of_study', 'in', ['any'], false, 'Social sciences through natural sciences', 0.2),
      req('mext-japan', 'research', 'gte', 1, false, 'Research plan and academic background assessed', 0.15),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'commonwealth-shared',
    name: 'Commonwealth Shared Scholarship',
    provider: 'Commonwealth Scholarship Commission (CSC)',
    provider_type: 'government',
    country: 'United Kingdom',
    country_code: 'GB',
    degree_level: 'master',
    field_of_study: ['engineering', 'public_health', 'agriculture', 'environmental_science', 'economics'],
    deadline: deadlineInDays(35),
    description:
      'For students from least developed Commonwealth countries who could not otherwise afford to study in the UK. Focus on development-impact themes.',
    eligibility_criteria:
      'Citizen of a least developed Commonwealth country, undergraduate degree of upper second class (2:1) standard or better, unable to afford UK study without the scholarship.',
    benefits: ['Full tuition and fees', 'Monthly stipend', 'Airfare', 'Thesis grant'],
    application_url: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/',
    source_url: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('commonwealth-shared', 'degree_level', 'eq', 'master', true, "Taught master's courses in development-relevant subjects", 0.3),
      req('commonwealth-shared', 'gpa', 'gte', 3.3, true, 'Undergraduate degree of upper second class (2:1) standard or better', 0.35),
      req('commonwealth-shared', 'field_of_study', 'in', ['engineering', 'public_health', 'agriculture', 'environmental_science', 'economics'], false, 'Development-impact themes', 0.2),
      req('commonwealth-shared', 'leadership', 'gte', 1, false, 'Commitment to development impact in home country', 0.15),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'knight-hennessy',
    name: 'Knight-Hennessy Scholars',
    provider: 'Stanford University',
    provider_type: 'university',
    country: 'United States',
    country_code: 'US',
    degree_level: 'phd',
    field_of_study: ['any'],
    deadline: deadlineInDays(15),
    description:
      "Stanford's flagship graduate scholarship funding full study across all seven Stanford graduate schools for up to three years.",
    eligibility_criteria:
      "Bachelor's degree earned within the last seven years, application to a full-time Stanford graduate program, English proficiency.",
    benefits: ['Full tuition', 'Living and academic expense stipend', 'Travel stipend', 'Leadership development program'],
    application_url: 'https://knight-hennessy.stanford.edu/admission',
    source_url: 'https://knight-hennessy.stanford.edu/admission/application-requirements',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('knight-hennessy', 'degree_level', 'in', ['master', 'phd'], true, 'Full-time Stanford graduate programs', 0.3),
      req('knight-hennessy', 'gpa', 'gte', 3.5, false, 'Highly competitive academic record', 0.3),
      req('knight-hennessy', 'leadership', 'gte', 1, false, 'Independent thought, purposeful leadership, civic commitment', 0.25),
      req('knight-hennessy', 'ielts', 'gte', 7.0, true, 'English proficiency for Stanford graduate admission', 0.15),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'gates-cambridge',
    name: 'Gates Cambridge Scholarship',
    provider: 'Bill & Melinda Gates Foundation / University of Cambridge',
    provider_type: 'foundation',
    country: 'United Kingdom',
    country_code: 'GB',
    degree_level: 'phd',
    field_of_study: ['any'],
    deadline: deadlineInDays(95),
    description:
      'Postgraduate scholarships for outstanding applicants from outside the UK to pursue a full-time degree at the University of Cambridge.',
    eligibility_criteria:
      'Apply to Cambridge, outstanding intellectual ability, commitment to improving the lives of others, English proficiency (IELTS 7.5 for most courses).',
    benefits: ['Full cost of studying at Cambridge', 'Maintenance allowance (~£20,000)', 'Airfare', 'Academic development funding'],
    application_url: 'https://www.gatescambridge.org/apply/',
    source_url: 'https://www.gatescambridge.org/apply/eligibility/',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('gates-cambridge', 'degree_level', 'in', ['master', 'phd'], true, 'Full-time postgraduate degrees at Cambridge', 0.3),
      req('gates-cambridge', 'ielts', 'gte', 7.5, true, 'English proficiency: IELTS 7.5 for most Cambridge courses', 0.3),
      req('gates-cambridge', 'gpa', 'gte', 3.7, false, 'Outstanding intellectual ability', 0.2),
      req('gates-cambridge', 'research', 'gte', 1, false, 'Research and leadership commitment to improving lives of others', 0.2),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'gks-korea',
    name: 'Global Korea Scholarship (GKS)',
    provider: 'National Institute for International Education (NIIED), Korea',
    provider_type: 'government',
    country: 'South Korea',
    country_code: 'KR',
    degree_level: 'any',
    field_of_study: ['any'],
    deadline: deadlineInDays(30),
    description:
      "Korean government scholarship program for international students pursuing bachelor's, master's, or PhD degrees in Korea, including one year of Korean language training.",
    eligibility_criteria:
      'Under 25 (bachelor\'s) or under 40 (graduate), GPA above 80% (or 2.64/4.0), health certification, must not be a Korean citizen.',
    benefits: ['Full tuition', 'Monthly allowance of ₩900,000–1,000,000', 'Airfare', 'One-year Korean language program', 'Medical insurance'],
    application_url: 'https://www.studyinkorea.go.kr/en/scholarship/GKS.do',
    source_url: 'https://www.studyinkorea.go.kr/en/sub/gks/allnew_invitation.do',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('gks-korea', 'gpa', 'gte', 2.64, true, 'GPA above 80% of full scale (2.64/4.0)', 0.4),
      req('gks-korea', 'degree_level', 'in', ['bachelor', 'master', 'phd'], true, "Bachelor's, master's, or PhD degrees", 0.3),
      req('gks-korea', 'field_of_study', 'in', ['any'], false, 'Open to all fields', 0.3),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'swiss-excellence',
    name: 'Swiss Government Excellence Scholarships',
    provider: 'Swiss Confederation (FCS)',
    provider_type: 'government',
    country: 'Switzerland',
    country_code: 'CH',
    degree_level: 'phd',
    field_of_study: ['any'],
    deadline: deadlineInDays(150),
    description:
      'Research-oriented scholarships for foreign scholars to pursue doctoral or postdoctoral research at Swiss universities, federal institutes of technology, and universities of applied sciences.',
    eligibility_criteria:
      "Master's degree before starting, born after a cutoff year (typically under 35), confirmed academic host at a Swiss institution, research proposal.",
    benefits: ['Monthly stipend of CHF 1,920', 'Tuition fee waiver', 'Health insurance', 'Housing allowance'],
    application_url: 'https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html',
    source_url: 'https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('swiss-excellence', 'degree_level', 'in', ['phd', 'postdoc'], true, 'Doctoral or postdoctoral research in Switzerland', 0.4),
      req('swiss-excellence', 'research', 'gte', 2, true, 'Research proposal and confirmed academic host required', 0.3),
      req('swiss-excellence', 'gpa', 'gte', 3.3, false, 'Strong academic record', 0.3),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards Scholarships',
    provider: 'Australian Government (DFAT)',
    provider_type: 'government',
    country: 'Australia',
    country_code: 'AU',
    degree_level: 'master',
    field_of_study: ['public_health', 'agriculture', 'environmental_science', 'economics', 'public_policy'],
    deadline: deadlineInDays(55),
    description:
      'Long-term development awards for emerging leaders from partner countries to study at Australian universities with a focus on development impact.',
    eligibility_criteria:
      'Citizen of a participating country, at least two years of work experience in a relevant field, English proficiency (IELTS 6.5), return to home country for two years after study.',
    benefits: ['Full tuition', 'Return air travel', 'Establishment allowance', 'Contribution to living expenses', 'Overseas student health cover'],
    application_url: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
    source_url: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('australia-awards', 'degree_level', 'eq', 'master', true, "Master's-level study at Australian universities", 0.25),
      req('australia-awards', 'work_experience_years', 'gte', 2, true, 'At least two years of relevant work experience', 0.3),
      req('australia-awards', 'ielts', 'gte', 6.5, true, 'English proficiency: IELTS 6.5', 0.25),
      req('australia-awards', 'field_of_study', 'in', ['public_health', 'agriculture', 'environmental_science', 'economics', 'public_policy'], false, 'Development-focused fields of study', 0.2),
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'vanier-canada',
    name: 'Vanier Canada Graduate Scholarships',
    provider: 'Government of Canada',
    provider_type: 'government',
    country: 'Canada',
    country_code: 'CA',
    degree_level: 'phd',
    field_of_study: ['health_sciences', 'engineering', 'natural_sciences', 'social_sciences'],
    deadline: deadlineInDays(80),
    description:
      "Canada's premier doctoral scholarship attracting world-class PhD talent in health sciences, natural sciences/engineering, and social sciences/humanities. CAD $50,000 per year for three years.",
    eligibility_criteria:
      'Nominated by a Canadian institution, enrolled in (or applying to) a doctoral program, first-class academic record, research and leadership excellence.',
    benefits: ['CAD $50,000 per year for three years', 'No tuition restriction', 'Prestige and research community access'],
    application_url: 'https://vanier.gc.ca/en/nomination_process-processus_de_mise_en_canidature.html',
    source_url: 'https://vanier.gc.ca/en/home-accueil.html',
    source_verified_at: now,
    status: 'active',
    requirements: [
      req('vanier-canada', 'degree_level', 'eq', 'phd', true, 'Doctoral programs only', 0.35),
      req('vanier-canada', 'gpa', 'gte', 3.7, true, 'First-class academic record', 0.25),
      req('vanier-canada', 'field_of_study', 'in', ['health_sciences', 'engineering', 'natural_sciences', 'social_sciences'], false, 'Health, natural sciences/engineering, social sciences/humanities', 0.2),
      req('vanier-canada', 'research', 'gte', 2, false, 'Research excellence and leadership', 0.2),
    ],
    created_at: now,
    updated_at: now,
  },
];

export const seedProfile: Profile = {
  id: 'profile-1',
  user_id: 'user-1',
  full_name: 'Alex Johnson',
  nationality: 'Vietnam',
  current_degree: 'bachelor',
  current_institution: 'Hanoi University of Science and Technology',
  target_degree_level: 'master',
  target_field_of_study: 'environmental_science',
  gpa: 3.6,
  gpa_scale: '4.0',
  ielts_score: 7.0,
  toefl_score: 98,
  other_language_scores: {},
  research_experience: [
    {
      id: 'res-1',
      title: 'Undergraduate thesis on urban air quality modeling',
      institution: 'Hanoi University of Science and Technology',
      description:
        'Built a regression model predicting PM2.5 concentrations in Hanoi using open sensor data; findings presented at a national student research conference.',
      start_date: monthsAgo(14),
      end_date: monthsAgo(6),
      is_current: false,
    },
  ],
  work_experience: [
    {
      id: 'work-1',
      title: 'Environmental Analyst Intern',
      organization: 'Center for Environmental Research (CER)',
      description:
        'Analyzed water quality datasets for two provinces and co-authored quarterly monitoring reports used by local authorities.',
      start_date: monthsAgo(30),
      end_date: monthsAgo(20),
      is_current: false,
    },
    {
      id: 'work-2',
      title: 'Research Assistant (part-time)',
      organization: 'HUST Environmental Engineering Lab',
      description: 'Supported data collection and lab analysis for a municipal wastewater treatment study.',
      start_date: monthsAgo(12),
      is_current: true,
    },
  ],
  leadership_experience: [
    {
      id: 'lead-1',
      role: 'President',
      organization: 'University Green Club',
      description:
        'Led a 40-member student club running campus recycling campaigns and a tree-planting program with two local schools.',
      start_date: monthsAgo(18),
      end_date: monthsAgo(8),
      is_current: false,
    },
  ],
  publications: [],
  awards: [
    {
      id: 'award-1',
      name: 'National Student Research Competition — Second Prize',
      issuer: 'Ministry of Education and Training (Vietnam)',
      year: new Date().getFullYear() - 1,
      description: 'Awarded for the urban air quality modeling thesis project.',
    },
  ],
  goals:
        'I want to become an environmental policy researcher focused on air quality governance in fast-growing Southeast Asian cities. A master\'s degree abroad will give me the technical and policy skills to design evidence-based pollution control programs before returning home to work with regional policymakers.',
  constraints: {
    preferred_countries: ['United Kingdom', 'Germany', 'Japan', 'Australia'],
    max_tuition_budget: 5000,
    funding_type: 'full',
    language_requirements: ['IELTS'],
    exclude_countries: [],
  },
  created_at: now,
  updated_at: now,
};

export const seedDocuments: ApplicationDocument[] = [
  {
    id: 'doc-1',
    application_id: 'app-1',
    type: 'transcript',
    file_name: 'academic_transcript_final.pdf',
    storage_path: 'documents/user-1/academic_transcript_final.pdf',
    file_size: 842112,
    mime_type: 'application/pdf',
    extracted_text:
      'Official transcript. Cumulative GPA: 3.6/4.0. Degree: Bachelor of Environmental Engineering Technology.',
    verification_state: 'verified',
    uploaded_at: now,
  },
  {
    id: 'doc-2',
    application_id: 'app-1',
    type: 'cv',
    file_name: 'alex_johnson_cv_v3.pdf',
    storage_path: 'documents/user-1/alex_johnson_cv_v3.pdf',
    file_size: 121402,
    mime_type: 'application/pdf',
    extracted_text:
      'CV — 2 pages. Experience: Environmental Analyst Intern (CER), Research Assistant (HUST). Leadership: President, University Green Club.',
    verification_state: 'verified',
    uploaded_at: now,
  },
  {
    id: 'doc-3',
    application_id: 'app-1',
    type: 'language_test',
    file_name: 'ielts_result_2026.pdf',
    storage_path: 'documents/user-1/ielts_result_2026.pdf',
    file_size: 210944,
    mime_type: 'application/pdf',
    extracted_text:
      'IELTS Test Report Form. Overall band score: 7.0. Listening 7.5, Reading 7.0, Writing 6.5, Speaking 6.5.',
    verification_state: 'needs_review',
    uploaded_at: now,
  },
];

export const seedReferences: Reference[] = [
  {
    id: 'ref-1',
    application_id: 'app-1',
    name: 'Prof. Minh Nguyen',
    institution: 'Hanoi University of Science and Technology',
    email: 'minh.nguyen@hust.edu.vn',
    relationship: 'Thesis supervisor',
    status: 'submitted',
    requested_at: now,
    submitted_at: now,
  },
  {
    id: 'ref-2',
    application_id: 'app-1',
    name: 'Dr. Lan Pham',
    institution: 'Center for Environmental Research',
    email: 'lan.pham@cer.org.vn',
    relationship: 'Internship mentor',
    status: 'requested',
    requested_at: now,
  },
];

export const seedApplications: Application[] = [
  {
    id: 'app-1',
    user_id: 'user-1',
    scholarship_id: 'chevening',
    status: 'in_progress',
    readiness_score: 0,
    documents: seedDocuments,
    references: seedReferences,
    sop_content:
      'Draft statement of purpose: Growing up in Hanoi, I watched air pollution shape daily life...',
    notes: 'Need to finalize the third course choice for the Chevening application.',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'app-2',
    user_id: 'user-1',
    scholarship_id: 'daad-epos',
    status: 'draft',
    readiness_score: 0,
    documents: [],
    references: [],
    notes: 'Shortlist EPOS development-related courses in environmental engineering.',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'app-3',
    user_id: 'user-1',
    scholarship_id: 'mext-japan',
    status: 'in_progress',
    readiness_score: 0,
    documents: [seedDocuments[0]],
    references: [],
    sop_content: '',
    notes: 'Contact potential MEXT professors before embassy recommendation round.',
    created_at: now,
    updated_at: now,
  },
];

export const COUNTRIES = [
  'United Kingdom',
  'United States',
  'Germany',
  'Canada',
  'Australia',
  'Japan',
  'South Korea',
  'Switzerland',
  'Netherlands',
  'Sweden',
  'Multiple (Europe)',
];

export const FIELDS_OF_STUDY = [
  { value: 'any', label: 'Any field' },
  { value: 'engineering', label: 'Engineering & Technology' },
  { value: 'environmental_science', label: 'Environmental Science' },
  { value: 'economics', label: 'Economics' },
  { value: 'public_policy', label: 'Public Policy' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'health_sciences', label: 'Health Sciences' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'social_sciences', label: 'Social Sciences & Humanities' },
];

export const DEGREE_LEVELS = [
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
  { value: 'postdoc', label: 'Postdoc' },
];