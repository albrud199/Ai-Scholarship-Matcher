import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Send,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/scholar/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { scholarships, student } from "@/lib/scholarship-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot | ScholarMatch AI" },
      {
        name: "description",
        content:
          "Ask grounded questions about your scholarship matches, readiness and application plan.",
      },
    ],
  }),
  component: Copilot,
});

type Message = { role: "assistant" | "user"; content: string; citations?: string[] };

const starters = [
  "Which scholarship should I apply to first?",
  "What is the biggest gap in my profile?",
  "Compare Chevening and DAAD for me",
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "I’ve reviewed your current profile, match scores and document checklist. Ask me about fit, deadlines, funding or what to do next.",
    citations: ["Profile facts", "6 matched scholarships"],
  },
];

function answerQuestion(question: string): Message {
  const normalized = question.toLowerCase();
  if (normalized.includes("compare")) {
    return {
      role: "assistant",
      content:
        "Chevening is the stronger immediate target: your match is 92% and the deadline is in 9 days, but your SOP and second reference still need work. DAAD is an 87% match with 23 days left and asks for a more explicit development-impact narrative, so it is the better second application.",
      citations: ["Chevening · 92% match · 9 days", "DAAD EPOS · 87% match · 23 days"],
    };
  }
  if (normalized.includes("gap") || normalized.includes("weak")) {
    return {
      role: "assistant",
      content:
        "Your biggest readiness gap is application evidence, not academics. Your GPA and language score are already competitive; finishing the SOP and confirming a second recommender would improve the most applications at once.",
      citations: ["Profile fit · GPA 3.78/4.0", "Chevening checklist · 2 open items"],
    };
  }
  return {
    role: "assistant",
    content:
      "Apply to Chevening first. It has your highest match score, only 9 days remaining, and two unfinished requirements. Finish the SOP today, then send the second reference request before doing lower-impact profile polishing.",
    citations: ["Chevening · 92% match", "Deadline · 9 days", "Readiness · 74%"],
  };
}

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const topMatch = scholarships[0]!;
  const contextItems: [LucideIcon, string][] = [
    [FileText, `${student.gpa} GPA · ${student.ielts} IELTS`],
    [Clock3, `${topMatch.daysLeft} days to your next deadline`],
    [CheckCircle2, `${topMatch.readiness}% application readiness`],
  ];

  const submit = (question = input) => {
    const trimmed = question.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, answerQuestion(trimmed)]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <AppShell
      title="AI Copilot"
      subtitle="Grounded guidance from your profile, live matches and application evidence."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="glass-card overflow-hidden border-brand-200/80 bg-brand-50/90">
          <div className="flex items-center gap-3 border-b border-brand-200/80 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-leaf-100 text-leaf-800">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-900">ScholarMatch advisor</p>
              <p className="text-xs text-brand-500">Grounded in your current workspace</p>
            </div>
            <Badge className="rounded-full bg-leaf-100 text-[10px] text-leaf-800">Ready</Badge>
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="flex min-h-[390px] flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn("flex gap-3", message.role === "user" && "justify-end")}
                >
                  {message.role === "assistant" ? (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-800 text-brand-50">
                      <Sparkles className="size-4" />
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "bg-leaf-500 text-leaf-950"
                        : "border border-brand-200 bg-white/45 text-brand-700",
                    )}
                  >
                    <p>{message.content}</p>
                    {message.citations ? (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-200/70 pt-2">
                        {message.citations.map((citation) => (
                          <span
                            key={citation}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold text-brand-600"
                          >
                            <CheckCircle2 className="size-3 text-leaf-700" /> {citation}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {message.role === "user" ? (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf-200 text-leaf-900">
                      <UserRound className="size-4" />
                    </span>
                  ) : null}
                </div>
              ))}
              {isTyping ? (
                <div className="flex items-center gap-2 text-xs text-brand-500">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-800 text-brand-50">
                    <Bot className="size-4" />
                  </span>
                  Reviewing your workspace...
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <Button
                  key={starter}
                  variant="outline"
                  onClick={() => submit(starter)}
                  className="h-auto rounded-full border-brand-200 bg-brand-50 px-3 py-2 text-left text-xs font-medium text-brand-700 hover:border-leaf-400 hover:bg-leaf-50"
                >
                  {starter}
                </Button>
              ))}
            </div>
            <form
              className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-white/50 p-2 focus-within:border-leaf-500 focus-within:ring-2 focus-within:ring-leaf-200"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a scholarship, deadline or next step"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-brand-900 outline-none placeholder:text-brand-400"
                aria-label="Ask the ScholarMatch advisor"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send question"
                className="size-9 rounded-lg"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-2 text-[10px] text-brand-400">
              Guidance is based on the evidence shown in your workspace. Verify final requirements
              with each official source.
            </p>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card className="glass-card border-flare-200 bg-brand-50/90">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-flare-700">
                <Sparkles className="size-4" />
                <p className="text-xs font-bold tracking-wide uppercase">Best next action</p>
              </div>
              <h2 className="mt-3 text-lg font-bold text-brand-900">Finish your Chevening SOP</h2>
              <p className="mt-2 text-xs leading-5 text-brand-600">
                +9 readiness points · 45 minutes · affects 6 open applications
              </p>
              <Link
                to="/scholarship/$id"
                params={{ id: topMatch.id }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-leaf-800 hover:text-leaf-900"
              >
                Open application workspace <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card border-brand-200/80 bg-brand-50/90">
            <CardContent className="p-5">
              <p className="text-xs font-bold tracking-wide text-brand-500 uppercase">
                Context used
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {contextItems.map(([Icon, label]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2 text-xs text-brand-700"
                  >
                    <Icon className="size-4 shrink-0 text-leaf-700" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/profile"
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-900"
              >
                Update profile <ExternalLink className="size-3" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
