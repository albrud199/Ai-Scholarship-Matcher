export type DocStatus = "Done" | "In Progress" | "Missing";
export type Bucket = "Apply Now" | "3 Months" | "6 Months" | "Next Year";
export type FundingType = "Full" | "Partial" | "Self-Funded";

export type Factor = { label: string; value: number; weight?: number };

export type Scholarship = {
  id: string;
  name: string;
  provider: string;
  country: string;
  flag: string;
  amount: number;
  amountLabel: string;
  match: number;
  readiness: number;
  daysLeft: number;
  bucket: Bucket;
  degree: string;
  fundingType: FundingType;
  description: string;
  applyUrl: string;
  scoreBreakdown: Factor[];
  readinessBreakdown: Factor[];
  successProbability: number;
  confidenceLow: number;
  confidenceHigh: number;
  contributingFactors: string[];
  recommendations: { title: string; detail: string; priority: "High" | "Medium" | "Low" }[];
  documents: { name: string; type: "PDF" | "DOCX" | "Image"; status: DocStatus }[];
};

export const student = {
  name: "Albin Rudro",
  initials: "AR",
  email: "albin.rudro@student.buet.ac.bd",
  nationality: "Bangladesh",
  degree: "BSc in Computer Science & Engineering",
  institution: "BUET",
  gpa: 3.78,
  gpaScale: 4.0,
  ielts: 7.0,
  publications: 2,
  leadership: 3,
  budgetPerYear: 6000,
};

export const scholarships: Scholarship[] = [
  {
    id: "chevening",
    name: "Chevening Scholarship",
    provider: "UK Government (FCDO)",
    country: "United Kingdom",
    flag: "🇬🇧",
    amount: 52000,
    amountLabel: "Fully funded + stipend",
    match: 92,
    readiness: 74,
    daysLeft: 9,
    bucket: "Apply Now",
    degree: "Master's",
    fundingType: "Full",
    description:
      "UK government global scholarship covering full tuition, monthly stipend, travel and visa costs for one-year master's programmes. Strong emphasis on leadership potential and post-study impact in the home country.",
    applyUrl: "https://www.chevening.org/scholarships/",
    scoreBreakdown: [
      { label: "Academic fit", value: 95 },
      { label: "Experience", value: 88 },
      { label: "Language", value: 90 },
      { label: "Profile fit", value: 94 },
      { label: "Timeline", value: 82 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 60, weight: 40 },
      { label: "Academics", value: 95, weight: 35 },
      { label: "Experience", value: 72, weight: 25 },
    ],
    successProbability: 74,
    confidenceLow: 65,
    confidenceHigh: 85,
    contributingFactors: [
      "GPA 3.78/4.0 is above the typical admitted range",
      "Two research publications strengthen the academic case",
      "Leadership evidence matches Chevening's core criteria",
      "IELTS 7.0 meets, but does not exceed, the requirement",
    ],
    recommendations: [
      {
        title: "Finalise your Statement of Purpose",
        detail: "Draft exists but is unfinished — Chevening weighs the leadership essay heavily.",
        priority: "High",
      },
      {
        title: "Confirm your second recommender",
        detail: "Dr. Rahman has not yet accepted the reference request.",
        priority: "High",
      },
      {
        title: "Retake IELTS targeting 7.5",
        detail: "Would raise your language sub-score from 90% to an estimated 98%.",
        priority: "Medium",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Curriculum vitae", type: "PDF", status: "Done" },
      { name: "Statement of purpose", type: "DOCX", status: "In Progress" },
      { name: "Reference letter 1", type: "PDF", status: "Done" },
      { name: "Reference letter 2", type: "PDF", status: "Missing" },
      { name: "IELTS score report", type: "PDF", status: "Done" },
    ],
  },
  {
    id: "daad",
    name: "DAAD EPOS Scholarship",
    provider: "German Academic Exchange Service",
    country: "Germany",
    flag: "🇩🇪",
    amount: 34000,
    amountLabel: "€992/month + tuition",
    match: 87,
    readiness: 58,
    daysLeft: 23,
    bucket: "Apply Now",
    degree: "Master's",
    fundingType: "Full",
    description:
      "Development-related postgraduate scholarship for graduates from developing countries, covering monthly stipend, health insurance, travel allowance and study/research subsidy.",
    applyUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    scoreBreakdown: [
      { label: "Academic fit", value: 92 },
      { label: "Experience", value: 78 },
      { label: "Language", value: 85 },
      { label: "Profile fit", value: 90 },
      { label: "Timeline", value: 74 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 40, weight: 40 },
      { label: "Academics", value: 90, weight: 35 },
      { label: "Experience", value: 55, weight: 25 },
    ],
    successProbability: 61,
    confidenceLow: 52,
    confidenceHigh: 72,
    contributingFactors: [
      "Two years of relevant professional experience is below the preferred minimum",
      "Field of study aligns with DAAD priority development areas",
      "Strong institutional reputation of BUET in the applicant pool",
    ],
    recommendations: [
      {
        title: "Upload your SOP tailored to development impact",
        detail: "DAAD requires an explicit link between your study plan and home-country impact.",
        priority: "High",
      },
      {
        title: "Add employer reference letter",
        detail: "EPOS requires a letter from your current employer confirming your work.",
        priority: "High",
      },
      {
        title: "Document community service entries",
        detail: "Currently empty in your profile — adds to the experience sub-score.",
        priority: "Low",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "DAAD application form", type: "PDF", status: "In Progress" },
      { name: "Statement of purpose", type: "DOCX", status: "Missing" },
      { name: "Employer reference", type: "PDF", status: "Missing" },
      { name: "IELTS score report", type: "PDF", status: "Done" },
    ],
  },
  {
    id: "australia-awards",
    name: "Australia Awards Scholarship",
    provider: "Australian Government (DFAT)",
    country: "Australia",
    flag: "🇦🇺",
    amount: 68000,
    amountLabel: "Full tuition + living allowance",
    match: 81,
    readiness: 66,
    daysLeft: 74,
    bucket: "3 Months",
    degree: "Master's",
    fundingType: "Full",
    description:
      "Long-term development awards covering full tuition, return air travel, establishment allowance, contribution to living expenses and overseas student health cover.",
    applyUrl: "https://www.dfat.gov.au/people-to-people/australia-awards",
    scoreBreakdown: [
      { label: "Academic fit", value: 88 },
      { label: "Experience", value: 74 },
      { label: "Language", value: 82 },
      { label: "Profile fit", value: 80 },
      { label: "Timeline", value: 92 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 55, weight: 40 },
      { label: "Academics", value: 88, weight: 35 },
      { label: "Experience", value: 62, weight: 25 },
    ],
    successProbability: 57,
    confidenceLow: 46,
    confidenceHigh: 69,
    contributingFactors: [
      "Comfortable lead time — 74 days to prepare a complete file",
      "Competitive cohort from South Asia raises the selection bar",
      "Priority field alignment with digital development",
    ],
    recommendations: [
      {
        title: "Prepare the development impact statement",
        detail: "A distinct essay from your SOP; allow two weeks of drafting.",
        priority: "Medium",
      },
      {
        title: "Certify your transcripts",
        detail: "DFAT requires notarised English translations.",
        priority: "Medium",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Certified transcripts", type: "PDF", status: "In Progress" },
      { name: "Development impact statement", type: "DOCX", status: "Missing" },
      { name: "Curriculum vitae", type: "PDF", status: "Done" },
      { name: "IELTS score report", type: "PDF", status: "Done" },
    ],
  },
  {
    id: "mext",
    name: "MEXT Research Scholarship",
    provider: "Government of Japan",
    country: "Japan",
    flag: "🇯🇵",
    amount: 45000,
    amountLabel: "¥144,000/month + tuition",
    match: 76,
    readiness: 49,
    daysLeft: 118,
    bucket: "6 Months",
    degree: "Master's / PhD",
    fundingType: "Full",
    description:
      "Japanese government scholarship for research students, including tuition exemption, monthly allowance and round-trip airfare. Requires a prospective supervisor's acceptance letter.",
    applyUrl: "https://www.studyinjapan.go.jp/en/planning/scholarship/",
    scoreBreakdown: [
      { label: "Academic fit", value: 90 },
      { label: "Experience", value: 70 },
      { label: "Language", value: 62 },
      { label: "Profile fit", value: 78 },
      { label: "Timeline", value: 86 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 35, weight: 40 },
      { label: "Academics", value: 86, weight: 35 },
      { label: "Experience", value: 45, weight: 25 },
    ],
    successProbability: 48,
    confidenceLow: 38,
    confidenceHigh: 60,
    contributingFactors: [
      "No prospective supervisor secured yet — the strongest single predictor",
      "Research publications are directly relevant to Japanese lab priorities",
      "No Japanese language ability recorded",
    ],
    recommendations: [
      {
        title: "Email 5 prospective supervisors",
        detail: "An acceptance letter roughly doubles historical success rates.",
        priority: "High",
      },
      {
        title: "Write the field of study & research plan",
        detail: "MEXT's core document — 2 pages, lab-specific.",
        priority: "High",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Research plan", type: "DOCX", status: "Missing" },
      { name: "Supervisor acceptance letter", type: "PDF", status: "Missing" },
      { name: "Recommendation from university", type: "PDF", status: "In Progress" },
    ],
  },
  {
    id: "eth-excellence",
    name: "ETH Excellence Scholarship",
    provider: "ETH Zürich",
    country: "Switzerland",
    flag: "🇨🇭",
    amount: 39000,
    amountLabel: "CHF 12,000/semester + tuition",
    match: 69,
    readiness: 61,
    daysLeft: 152,
    bucket: "6 Months",
    degree: "Master's",
    fundingType: "Partial",
    description:
      "Merit scholarship for outstanding master's applicants at ETH Zürich, covering living and study costs plus a tuition waiver. Awarded to roughly the top 5% of applicants.",
    applyUrl: "https://ethz.ch/en/studies/financial/scholarships.html",
    scoreBreakdown: [
      { label: "Academic fit", value: 84 },
      { label: "Experience", value: 66 },
      { label: "Language", value: 80 },
      { label: "Profile fit", value: 62 },
      { label: "Timeline", value: 90 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 58, weight: 40 },
      { label: "Academics", value: 84, weight: 35 },
      { label: "Experience", value: 48, weight: 25 },
    ],
    successProbability: 34,
    confidenceLow: 25,
    confidenceHigh: 45,
    contributingFactors: [
      "Extremely selective — top 5% of the applicant pool",
      "GPA is competitive but not in the top decile for this programme",
      "Publication record is a differentiator",
    ],
    recommendations: [
      {
        title: "Target a specific ETH research group",
        detail: "Named alignment in the motivation letter improves shortlisting.",
        priority: "Medium",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Motivation letter", type: "DOCX", status: "In Progress" },
      { name: "Curriculum vitae", type: "PDF", status: "Done" },
      { name: "Reference letter 2", type: "PDF", status: "Missing" },
    ],
  },
  {
    id: "erasmus-mundus",
    name: "Erasmus Mundus Joint Master",
    provider: "European Commission",
    country: "European Union",
    flag: "🇪🇺",
    amount: 58000,
    amountLabel: "€1,400/month + tuition + travel",
    match: 84,
    readiness: 63,
    daysLeft: 41,
    bucket: "3 Months",
    degree: "Master's",
    fundingType: "Full",
    description:
      "Two-year joint master's programmes delivered by consortia of European universities, with full tuition coverage, monthly subsistence, travel and installation allowance.",
    applyUrl: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students",
    scoreBreakdown: [
      { label: "Academic fit", value: 90 },
      { label: "Experience", value: 76 },
      { label: "Language", value: 88 },
      { label: "Profile fit", value: 82 },
      { label: "Timeline", value: 80 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 62, weight: 40 },
      { label: "Academics", value: 90, weight: 35 },
      { label: "Experience", value: 58, weight: 25 },
    ],
    successProbability: 64,
    confidenceLow: 54,
    confidenceHigh: 76,
    contributingFactors: [
      "Applying to three consortia raises combined odds substantially",
      "Mobility across two countries matches your stated preference",
      "Strong academic record relative to the admitted cohort",
    ],
    recommendations: [
      {
        title: "Shortlist three consortia",
        detail: "One application form covers up to three programmes.",
        priority: "High",
      },
      {
        title: "Request a second academic reference",
        detail: "Most consortia require two references dated within 12 months.",
        priority: "Medium",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Motivation letter", type: "DOCX", status: "In Progress" },
      { name: "Curriculum vitae", type: "PDF", status: "Done" },
      { name: "Reference letter 1", type: "PDF", status: "Done" },
      { name: "Reference letter 2", type: "PDF", status: "Missing" },
      { name: "IELTS score report", type: "PDF", status: "Done" },
    ],
  },
  {
    id: "commonwealth",
    name: "Commonwealth Master's Scholarship",
    provider: "Commonwealth Scholarship Commission",
    country: "United Kingdom",
    flag: "🇬🇧",
    amount: 49000,
    amountLabel: "Fully funded + stipend",
    match: 79,
    readiness: 55,
    daysLeft: 236,
    bucket: "Next Year",
    degree: "Master's",
    fundingType: "Full",
    description:
      "For students from low- and middle-income Commonwealth countries who could not otherwise afford to study in the UK. Nominated through approved national agencies and universities.",
    applyUrl: "https://cscuk.fcdo.gov.uk/scholarships/",
    scoreBreakdown: [
      { label: "Academic fit", value: 86 },
      { label: "Experience", value: 72 },
      { label: "Language", value: 88 },
      { label: "Profile fit", value: 76 },
      { label: "Timeline", value: 95 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 48, weight: 40 },
      { label: "Academics", value: 86, weight: 35 },
      { label: "Experience", value: 52, weight: 25 },
    ],
    successProbability: 52,
    confidenceLow: 41,
    confidenceHigh: 64,
    contributingFactors: [
      "Nomination route not yet identified",
      "Financial need statement aligns with eligibility",
      "Long runway allows a fully polished application",
    ],
    recommendations: [
      {
        title: "Identify your nominating body",
        detail: "Applications must be routed through an approved agency.",
        priority: "Medium",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Development impact statement", type: "DOCX", status: "Missing" },
      { name: "Reference letter 1", type: "PDF", status: "In Progress" },
    ],
  },
  {
    id: "nus-merit",
    name: "NUS Graduate Merit Award",
    provider: "National University of Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    amount: 21000,
    amountLabel: "50% tuition waiver",
    match: 64,
    readiness: 70,
    daysLeft: 195,
    bucket: "Next Year",
    degree: "Master's",
    fundingType: "Partial",
    description:
      "Partial tuition award for high-performing graduate coursework students, renewable subject to academic performance. Living costs are not covered.",
    applyUrl: "https://nus.edu.sg/registrar/prospective-students/graduate",
    scoreBreakdown: [
      { label: "Academic fit", value: 80 },
      { label: "Experience", value: 60 },
      { label: "Language", value: 84 },
      { label: "Profile fit", value: 55 },
      { label: "Timeline", value: 92 },
    ],
    readinessBreakdown: [
      { label: "Documents", value: 72, weight: 40 },
      { label: "Academics", value: 80, weight: 35 },
      { label: "Experience", value: 50, weight: 25 },
    ],
    successProbability: 58,
    confidenceLow: 47,
    confidenceHigh: 70,
    contributingFactors: [
      "Partial coverage leaves a significant funding gap",
      "Academic profile is comfortably within range",
    ],
    recommendations: [
      {
        title: "Model the remaining living-cost gap",
        detail: "Only 50% of tuition is covered — check the Funding screen.",
        priority: "Low",
      },
    ],
    documents: [
      { name: "Passport copy", type: "Image", status: "Done" },
      { name: "Academic transcripts", type: "PDF", status: "Done" },
      { name: "Curriculum vitae", type: "PDF", status: "Done" },
      { name: "Reference letter 1", type: "PDF", status: "In Progress" },
    ],
  },
];

export const buckets: Bucket[] = ["Apply Now", "3 Months", "6 Months", "Next Year"];

export function getScholarship(id: string) {
  return scholarships.find((s) => s.id === id);
}

export function urgency(daysLeft: number) {
  if (daysLeft <= 14) return { label: "Critical", tone: "critical" as const };
  if (daysLeft <= 30) return { label: "Urgent", tone: "urgent" as const };
  if (daysLeft <= 90) return { label: "Moderate", tone: "moderate" as const };
  return { label: "Relaxed", tone: "relaxed" as const };
}

export function docCompletion(s: Scholarship) {
  const done = s.documents.filter((d) => d.status === "Done").length;
  return Math.round((done / s.documents.length) * 100);
}

export type RoadmapPhase = {
  phase: string;
  window: string;
  milestones: {
    title: string;
    date: string;
    status: "Done" | "In Progress" | "Not Started";
    linked: string;
  }[];
};

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Immediate",
    window: "Next 30 days",
    milestones: [
      {
        title: "Finish Statement of Purpose",
        date: "26 Aug 2026",
        status: "In Progress",
        linked: "Chevening",
      },
      {
        title: "Secure second reference letter",
        date: "28 Aug 2026",
        status: "Not Started",
        linked: "Chevening, Erasmus Mundus",
      },
      {
        title: "Submit Chevening application",
        date: "30 Aug 2026",
        status: "Not Started",
        linked: "Chevening",
      },
      {
        title: "Complete DAAD application form",
        date: "10 Sep 2026",
        status: "In Progress",
        linked: "DAAD EPOS",
      },
    ],
  },
  {
    phase: "3–6 Months",
    window: "Oct 2026 – Feb 2027",
    milestones: [
      {
        title: "Retake IELTS targeting 7.5",
        date: "12 Oct 2026",
        status: "Not Started",
        linked: "All applications",
      },
      {
        title: "Shortlist three Erasmus consortia",
        date: "25 Sep 2026",
        status: "Not Started",
        linked: "Erasmus Mundus",
      },
      {
        title: "Contact MEXT prospective supervisors",
        date: "05 Nov 2026",
        status: "Not Started",
        linked: "MEXT",
      },
      {
        title: "Notarise and translate transcripts",
        date: "18 Nov 2026",
        status: "Not Started",
        linked: "Australia Awards",
      },
    ],
  },
  {
    phase: "1 Year",
    window: "Mar 2027 – Aug 2027",
    milestones: [
      {
        title: "Publish third research paper",
        date: "20 Mar 2027",
        status: "Not Started",
        linked: "MEXT, ETH Zürich",
      },
      {
        title: "Identify Commonwealth nominating body",
        date: "14 Apr 2027",
        status: "Not Started",
        linked: "Commonwealth",
      },
      {
        title: "Prepare visa and financial documents",
        date: "30 Jun 2027",
        status: "Not Started",
        linked: "All offers",
      },
    ],
  },
];

export type Notification = {
  id: string;
  group: "Deadline" | "Document" | "Match";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    group: "Deadline",
    title: "Chevening closes in 9 days",
    detail: "Your application is 74% ready. Two documents remain outstanding.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    group: "Document",
    title: "SOP missing for DAAD EPOS",
    detail: "The statement of purpose has not been uploaded for this application.",
    time: "5h ago",
    unread: true,
  },
  {
    id: "n3",
    group: "Match",
    title: "New scholarship match: 84%",
    detail: "Erasmus Mundus Joint Master matched your updated profile.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "n4",
    group: "Deadline",
    title: "DAAD EPOS closes in 23 days",
    detail: "Estimated 18 hours of preparation work remaining.",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "n5",
    group: "Document",
    title: "Reference letter 1 received",
    detail: "Prof. Nasrin uploaded her recommendation for Chevening.",
    time: "3 days ago",
    unread: false,
  },
];

export const costModel = {
  tuition: 32000,
  living: 16800,
  travel: 2200,
  visaInsurance: 1400,
};

export const totalCost =
  costModel.tuition + costModel.living + costModel.travel + costModel.visaInsurance;

export const alternativeFunding = [
  {
    name: "Aga Khan Foundation Grant",
    amount: "Up to $10,000/yr",
    kind: "Grant",
    eligibility: "Need-based, 50% loan / 50% grant split",
    url: "https://www.akdn.org/our-agencies/aga-khan-foundation",
  },
  {
    name: "HSBC Education Loan",
    amount: "Up to $40,000",
    kind: "Loan",
    eligibility: "Requires local guarantor and admission letter",
    url: "https://www.hsbc.com",
  },
  {
    name: "Graduate Teaching Assistantship",
    amount: "$6,000–$9,000/yr",
    kind: "Work-study",
    eligibility: "20 hrs/week, departmental selection after enrolment",
    url: "https://www.findaphd.com",
  },
  {
    name: "Prime Minister's Education Assistance Trust",
    amount: "৳300,000 one-off",
    kind: "Grant",
    eligibility: "Bangladeshi nationals with confirmed foreign admission",
    url: "https://www.pmeat.gov.bd",
  },
];

export const careerPathways = [
  {
    scholarship: "Chevening Scholarship",
    pathway: "MSc Advanced Computing — Imperial College London",
    outcome: "ML Engineer, UK tech sector",
    salary: "£62,000 median",
  },
  {
    scholarship: "DAAD EPOS",
    pathway: "MSc Data Engineering — TU Berlin",
    outcome: "Data platform engineer, EU industry",
    salary: "€68,000 median",
  },
  {
    scholarship: "MEXT Research",
    pathway: "Research Master → PhD — Tokyo Institute of Technology",
    outcome: "Research scientist / academia",
    salary: "¥7.2M median",
  },
];
