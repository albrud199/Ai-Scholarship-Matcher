'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  generateGroundedAnswer,
  loadChatHistory,
  saveChatHistory,
  makeChatMessage,
  COPILOT_SUGGESTIONS,
} from '@/lib/chat-service';
import { seedScholarships, seedProfile, seedApplications } from '@/lib/mock-data';
import type { ChatMessage, Citation } from '@/types';
import { MessageSquare, X, Send, Sparkles, Quote, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CITATION_SOURCE_LABEL: Record<Citation['source_type'], string> = {
  scholarship: 'Scholarship record',
  profile: 'Your profile',
  document: 'Document',
  application: 'Application',
};

export function MessageContent({ content }: { content: string }) {
  // Minimal markdown rendering: **bold**, lists, line breaks.
  return (
    <div className="space-y-1.5">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return null;
        const bullet = line.startsWith('- ');
        const text = bullet ? line.slice(2) : line;
        const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).filter(Boolean);
        return (
          <p key={i} className={cn('text-sm', bullet && 'pl-3 relative')}>
            {bullet && <span className="absolute left-0">•</span>}
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                );
              }
              if (/^\[\d+\]$/.test(part)) {
                return (
                  <sup key={j}>
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-[9px] font-bold align-super">
                      {part.slice(1, -1)}
                    </span>
                  </sup>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
        <Quote className="h-3 w-3" /> Grounded in:
      </p>
      {citations.map((c, i) => (
        <div key={c.id} className="rounded-md bg-background/80 border p-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary-100 text-primary-700 text-[8px] font-bold mr-1">
              {i + 1}
            </span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 mr-1">
              {CITATION_SOURCE_LABEL[c.source_type]}
            </Badge>
            {c.excerpt.length > 110 ? `${c.excerpt.slice(0, 110)}…` : c.excerpt}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Shared chat panel used by both the floating bubble and the /chat route. */
export function ChatPanel({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChatHistory());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isTyping) return;

    const userMsg = makeChatMessage('user', question);
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsTyping(true);

    // Retrieval + grounded generation (deterministic, local RAG pipeline).
    setTimeout(() => {
      const answer = generateGroundedAnswer(question, seedScholarships, seedProfile, seedApplications);
      const assistantMsg = makeChatMessage('assistant', answer.content, answer.citations);
      const withAnswer = [...next, assistantMsg];
      setMessages(withAnswer);
      saveChatHistory(withAnswer);
      setIsTyping(false);
    }, 700);
  };

  const clear = () => {
    setMessages([]);
    saveChatHistory([]);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <p className="text-sm font-semibold leading-none">AI Copilot</p>
            <p className="text-[11px] text-primary-100 mt-0.5">Grounded in your scholarships &amp; profile</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" aria-label="Clear chat" onClick={clear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {!compact && (
            <Link href="/chat" className="text-[11px] underline underline-offset-2 text-primary-100 hover:text-white px-1">
              Open full view
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Ask anything about scholarships, your profile, or applications. Every answer cites its sources.
            </p>
            <div className="flex flex-col gap-1.5 items-stretch">
              {COPILOT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-3 py-2 rounded-lg border bg-card hover:border-primary/50 hover:bg-primary-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2',
                m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border rounded-bl-sm'
              )}
            >
              <MessageContent content={m.content} />
              {m.role === 'assistant' && <CitationList citations={m.citations} />}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-xl rounded-bl-sm px-3 py-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                Retrieving from your data
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '240ms' }} />
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-card rounded-b-xl flex-shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about deadlines, eligibility, your weakest areas…"
            className="min-h-[40px] max-h-24 resize-none text-sm"
            aria-label="Chat message"
          />
          <Button size="icon" onClick={() => send()} disabled={!input.trim() || isTyping} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Floating chat bubble rendered inside the dashboard layout. */
export function CopilotFloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI Copilot chat' : 'Open AI Copilot chat'}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-card-hover flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-card border rounded-xl shadow-card-hover overflow-hidden animate-in slide-in-from-bottom-4 fade-in-0 duration-200">
          <ChatPanel />
        </div>
      )}
    </>
  );
}