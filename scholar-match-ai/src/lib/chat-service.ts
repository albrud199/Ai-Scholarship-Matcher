import { ChatMessage, Citation, Profile, Scholarship, Application } from '@/types';
import { getDaysUntil } from '@/lib/utils';

const STORAGE_KEY = 'scholarmatch:chat-history';

/**
 * Retrieval-augmented generation, local edition.
 *
 * The "retriever" scores knowledge chunks (scholarship records, profile facts,
 * application state) against the user's question using deterministic keyword
 * overlap. Only retrieved chunks may inform the answer, and every answer
 * segment carries a citation back to the chunk it came from.
 */

interface KnowledgeChunk {
  id: string;
  source_type: Citation['source_type'];
  source_id: string;
  title: string;
  text: string;
  keywords: string[];
}

function buildKnowledgeBase(
  scholarships: Scholarship[],
  profile: Profile,
  applications: Application[]
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  scholarships.forEach((s) => {
    chunks.push({
      id: `sch-${s.id}-overview`,
      source_type: 'scholarship',
      source_id: s.id,
      title: s.name,
      text: `${s.name} (${s.provider}, ${s.country}). ${s.description} Deadline: ${new Date(s.deadline).toLocaleDateString(
        'en-US',
        { month: 'long', day: 'numeric', year: 'numeric' }
      )}. Benefits: ${s.benefits.join(', ')}.`,
      keywords: [s.name.toLowerCase(), s.provider.toLowerCase(), s.country.toLowerCase(), 'scholarship', 'deadline', 'benefits', 'funding'],
    });
    chunks.push({
      id: `sch-${s.id}-eligibility`,
      source_type: 'scholarship',
      source_id: s.id,
      title: `${s.name} — eligibility`,
      text: `${s.name} eligibility: ${s.eligibility_criteria} Degree level: ${s.degree_level}. Fields: ${s.field_of_study
        .join(', ')
        .replace(/_/g, ' ')}.`,
      keywords: ['eligibility', 'requirement', 'eligible', 'qualification', s.name.toLowerCase(), 'gpa', 'ielts', 'toefl', 'experience'],
    });
  });

  chunks.push({
    id: 'profile-summary',
    source_type: 'profile',
    source_id: profile.id,
    title: 'Your profile',
    text: `You are ${profile.full_name} from ${profile.nationality}, targeting a ${profile.target_degree_level} in ${profile.target_field_of_study.replace(
      /_/g,
      ' '
    )}. GPA ${profile.gpa ?? 'not set'}/${profile.gpa_scale ?? '4.0'} at ${profile.current_institution}. ${
      profile.ielts_score ? `IELTS ${profile.ielts_score}.` : ''
    } ${profile.work_experience.length + profile.leadership_experience.length} experience entries, ${
      profile.research_experience.length
    } research items. Preferred countries: ${profile.constraints.preferred_countries.join(', ') || 'none set'}.`,
    keywords: ['profile', 'my', 'me', 'gpa', 'ielts', 'experience', 'nationality', 'field'],
  });

  applications.forEach((a) => {
    const s = scholarships.find((x) => x.id === a.scholarship_id);
    if (!s) return;
    chunks.push({
      id: `app-${a.id}`,
      source_type: 'application',
      source_id: a.id,
      title: `Your application to ${s.name}`,
      text: `Application to ${s.name} is ${a.status.replace(/_/g, ' ')}. ${a.documents.length} document(s) uploaded, ${
        a.references.filter((r) => r.status === 'submitted').length
      }/${a.references.length} references submitted. SOP: ${
        a.sop_content ? 'drafted' : 'not started'
      }. Deadline in ${Math.max(0, getDaysUntil(s.deadline))} days. Notes: ${a.notes}`,
      keywords: ['application', 'my application', s.name.toLowerCase(), 'progress', 'documents', 'references', 'status'],
    });
  });

  return chunks;
}

/** Deterministic keyword-overlap retrieval with simple TF scoring. */
export function retrieveChunks(
  question: string,
  knowledgeBase: KnowledgeChunk[],
  topK = 4
): Array<{ chunk: KnowledgeChunk; score: number }> {
  const tokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = knowledgeBase.map((chunk) => {
    let score = 0;
    const haystack = (chunk.title + ' ' + chunk.text).toLowerCase();
    tokens.forEach((token) => {
      if (chunk.keywords.some((k) => k.includes(token) || token.includes(k))) score += 3;
      else if (haystack.includes(token)) score += 1;
    });
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export interface CopilotAnswer {
  content: string;
  citations: Citation[];
}

/** Generate a grounded answer strictly from retrieved chunks. */
export function generateGroundedAnswer(
  question: string,
  scholarships: Scholarship[],
  profile: Profile,
  applications: Application[]
): CopilotAnswer {
  const kb = buildKnowledgeBase(scholarships, profile, applications);
  const q = question.toLowerCase();
  const retrieved = retrieveChunks(question, kb);

  if (retrieved.length === 0) {
    return {
      content:
        "I couldn't find anything in your scholarships, profile, or applications that answers that. Try asking about specific scholarships (e.g. \"Chevening eligibility\"), your deadlines, or what to work on next.",
      citations: [],
    };
  }

  const citations: Citation[] = retrieved.map((r, i) => ({
    id: `cite-${i + 1}`,
    source_type: r.chunk.source_type,
    source_id: r.chunk.source_id,
    excerpt: r.chunk.text.slice(0, 220),
    relevance_score: Math.min(1, r.score / 12),
  }));

  const cite = (i: number) => ` [${i + 1}]`;

  // Intent: deadlines
  if (q.includes('deadline') || q.includes('due') || q.includes('when')) {
    const list = scholarships
      .slice()
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 6)
      .map(
        (s) =>
          `- **${s.name}**: ${new Date(s.deadline).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })} (${Math.max(0, getDaysUntil(s.deadline))} days)`
      )
      .join('\n');
    return {
      content: `Here are the current deadlines from your scholarship list:\n\n${list}`,
      citations: citations.slice(0, 3),
    };
  }

  // Intent: eligibility of a named scholarship
  const namedSch = scholarships.find((s) => q.includes(s.name.toLowerCase().split(' ')[0].toLowerCase()));
  if ((q.includes('eligible') || q.includes('eligibility') || q.includes('requirement')) && namedSch) {
    return {
      content: `${namedSch.name} eligibility: ${namedSch.eligibility_criteria}${cite(0)}\n\nKey structured requirements: ${namedSch.requirements
        .map((r) => `${r.field.replace(/_/g, ' ')} (${r.is_hard_requirement ? 'hard' : 'soft'})`)
        .join(', ')}. Your deterministic score against these is shown on the My Matches page.`,
      citations,
    };
  }

  // Intent: compare
  if (q.includes('compare') || q.includes(' vs ') || q.includes('versus')) {
    const mentioned = scholarships.filter((s) => q.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())).slice(0, 2);
    if (mentioned.length === 2) {
      const [a, b] = mentioned;
      const fmt = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        content: `**${a.name}** (${a.country}) — deadline ${fmt(a.deadline)}; ${a.benefits[0]?.toLowerCase()}; degree level ${a.degree_level}.${cite(
          0
        )}\n\n**${b.name}** (${b.country}) — deadline ${fmt(b.deadline)}; ${b.benefits[0]?.toLowerCase()}; degree level ${b.degree_level}.${cite(
          1
        )}\n\nCheck the My Matches page for your deterministic, weighted score for each — and the "why not recommended" breakdown for the lower one.`,
        citations: citations.slice(0, 2),
      };
    }
  }

  // Intent: weakest areas / next steps
  if (q.includes('weak') || q.includes('improve') || q.includes('next') || q.includes('should i')) {
    const missingLang = profile.ielts_score == null && profile.toefl_score == null;
    const expCount = profile.work_experience.length + profile.leadership_experience.length;
    const draftApps = applications.filter((a) => a.status === 'draft').length;
    const urgent = scholarships.filter((s) => getDaysUntil(s.deadline) <= 30).map((s) => s.name);
    return {
      content: [
        `Based on your current profile and applications:${cite(0)}`,
        missingLang
          ? '- **Language score missing** — a hard requirement for most fully-funded awards that caps your Language factor.'
          : '',
        expCount === 0
          ? '- **No recorded experience** — the Experience factor carries 20% of every match score.'
          : '',
        draftApps > 0
          ? `- **${draftApps} application(s) still in draft** — they earn zero readiness points until documents, SOP, and references progress.`
          : '',
        urgent.length ? `- **Deadline pressure:** ${urgent.join(', ')} close within 30 days.${cite(1)}` : '',
        '- Your single highest-impact action is always shown on the Readiness page.',
      ]
        .filter(Boolean)
        .join('\n'),
      citations,
    };
  }

  // Default: summarize top retrieved chunks with inline citations
  const lines = retrieved.map((r, i) => `- ${r.chunk.text}${cite(i)}`);
  return {
    content: `Here's what I found in your data:\n\n${lines.join('\n')}`,
    citations,
  };
}

/** Persist chat history to localStorage (harmless UI state per the roadmap). */
export function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
  } catch {
    // Storage full or unavailable — history is non-critical.
  }
}

export function clearChatHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function makeChatMessage(
  role: ChatMessage['role'],
  content: string,
  citations: Citation[] = []
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    thread_id: 'main',
    role,
    content,
    citations,
    created_at: new Date().toISOString(),
  };
}

export const COPILOT_SUGGESTIONS = [
  'Which scholarships should I apply to first?',
  'What are my weakest areas?',
  'Compare Chevening vs DAAD for me',
  'What are the upcoming deadlines?',
  'Am I eligible for Fulbright?',
];