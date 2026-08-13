import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AnswerBody } from "@/components/chat/AnswerBody";
import { Disclaimer } from "@/components/Disclaimer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { askGovGuide } from "@/lib/govguide.functions";
import { stashGuestConversation } from "@/lib/guest-conversation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask GovGuide — AI assistant for SA government services" },
      {
        name: "description",
        content:
          "Ask about Smart IDs, passports, licences, SASSA grants, UIF and company registration. Every GovGuide answer links to the official South African source.",
      },
      { property: "og:title", content: "Ask GovGuide — AI assistant for SA government services" },
      {
        property: "og:description",
        content:
          "Plain-language answers on South African government procedures, with verified documents, steps and official sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Source = {
  slug: string;
  serviceName: string;
  authority: string;
  url: string;
  lastVerified: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
};

const STARTERS = [
  "What documents do I need for a Smart ID?",
  "How do I apply for a passport?",
  "How do I get a driver's licence?",
  "Where can I apply for a SASSA grant?",
  "What government services can you help me with?",
];

const STORAGE_KEY = "govguide.conversation.v1";

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ChatPage() {
  const ask = useServerFn(askGovGuide);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { conversationId: string; messages: Message[] };
        setConversationId(parsed.conversationId || newId());
        setMessages(Array.isArray(parsed.messages) ? parsed.messages : []);
        return;
      }
    } catch {
      /* ignore corrupted history */
    }
    setConversationId(newId());
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId, messages }));
    } catch {
      /* storage unavailable — history simply is not kept */
    }
  }, [conversationId, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  // Keep a guest transcript ready so signing in can save it to an account.
  useEffect(() => {
    if (user || messages.length === 0) return;
    stashGuestConversation(
      messages
        .filter((m) => !m.isError)
        .map(({ role, content }) => ({ role, content })),
    );
  }, [messages, user]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || pending) return;

      const nextMessages: Message[] = [
        ...messages.filter((m) => !m.isError),
        { id: newId(), role: "user", content: question },
      ];
      setMessages(nextMessages);
      setInput("");
      setPending(true);

      try {
        const result = await ask({
          data: {
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
          },
        });

        if ("error" in result) {
          setMessages((prev) => [
            ...prev,
            { id: newId(), role: "assistant", content: result.error, isError: true },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", content: result.answer, sources: result.sources },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content:
              "I couldn't reach the assistant. Please check your connection and try asking again.",
            isError: true,
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [ask, messages, pending],
  );

  const clearConversation = () => {
    setMessages([]);
    setConversationId(newId());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    toast.success("Conversation cleared");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="mesh-light relative flex min-h-screen flex-col">
      <SiteHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-40 pt-6 sm:px-6 sm:pb-44">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              GovGuide Assistant
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified information on 8 South African services, with the source behind every answer.
            </p>
          </div>
          {!isEmpty ? (
            <div className="flex items-center gap-2">
            {!user ? (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                Save this conversation
              </Link>
            ) : null}
            <button
              type="button"
              onClick={clearConversation}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Clear conversation
            </button>
            </div>
          ) : null}
        </div>

        {isEmpty ? (
          <EmptyState onPick={send} />
        ) : (
          <ol className="mt-7 space-y-6" aria-live="polite">
            {messages.map((message) => (
              <li key={message.id}>
                {message.role === "user" ? (
                  <UserBubble content={message.content} />
                ) : (
                  <AssistantBubble message={message} conversationId={conversationId} />
                )}
              </li>
            ))}
          </ol>
        )}

        {pending ? <Thinking /> : null}
        <div ref={endRef} />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/90 to-transparent pb-4 pt-8">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="glass flex items-end gap-2 rounded-3xl p-2.5"
          >
            <label htmlFor="chat-input" className="sr-only">
              Ask about a government service
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              rows={1}
              value={input}
              maxLength={2000}
              onChange={(event) => {
                setInput(event.target.value);
                const el = event.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about IDs, passports, licences, grants, UIF or registering a business…"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.95rem] text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              aria-label="Send question"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:shadow-none"
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </button>
          </form>
          <Disclaimer compact className="mt-2.5 border-transparent bg-transparent" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mt-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 p-2.5">
        <BrandMark size="lg" className="h-10" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
        What do you need help with?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Ask in your own words. If your question could mean a few different things, GovGuide will ask
        you a short follow-up before answering.
      </p>
      <div className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
        {STARTERS.map((starter, index) => (
          <button
            key={starter}
            type="button"
            onClick={() => onPick(starter)}
            className="lift glass-secondary rounded-full px-4 py-2.5 text-left text-sm font-medium text-foreground/85 hover:lift-hover"
            style={{ transitionDelay: `${index * 20}ms` }}
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-primary px-4 py-3 text-[0.94rem] leading-relaxed text-primary-foreground shadow-soft sm:max-w-[75%]">
        {content}
      </p>
    </div>
  );
}

function Thinking() {
  return (
    <div className="mt-6 flex items-center gap-3" role="status" aria-label="GovGuide is thinking">
      <span className="glass-secondary flex items-center gap-1.5 rounded-full px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-primary"
            style={{ animation: "thinking 1.4s var(--ease-soft) infinite", animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        Checking the verified knowledge base…
      </span>
    </div>
  );
}

function AssistantBubble({
  message,
  conversationId,
}: {
  message: Message;
  conversationId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [rated, setRated] = useState<"helpful" | "not_helpful" | null>(null);
  const sources = useMemo(() => message.sources ?? [], [message.sources]);

  if (message.isError) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-destructive/25 bg-destructive/5 px-4 py-3.5">
        <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-destructive" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-foreground/90">{message.content}</p>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy that answer");
    }
  };

  const rate = async (rating: "helpful" | "not_helpful") => {
    setRated(rating);
    const { error } = await supabase.from("chat_feedback").insert({
      conversation_id: conversationId,
      message_id: message.id,
      rating,
      answer: message.content.slice(0, 4000),
    });
    if (error) {
      toast.error("Couldn't save your feedback");
      setRated(null);
      return;
    }
    toast.success(rating === "helpful" ? "Thanks — glad it helped" : "Thanks — we'll use this to improve");
  };

  return (
    <div className="glass rounded-3xl rounded-bl-lg p-5 sm:p-6">
      <AnswerBody content={message.content} />

      {sources.length > 0 ? (
        <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
          {sources.map((source) => (
            <div
              key={source.slug}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl bg-surface-muted/70 px-3.5 py-2.5"
            >
              <div className="text-xs">
                <p className="font-semibold text-foreground">Source: {source.authority}</p>
                <p className="text-muted-foreground">
                  {source.serviceName} · last verified {source.lastVerified}
                </p>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                View official information
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Helpful?</span>
          {(["helpful", "not_helpful"] as const).map((value) => (
            <button
              key={value}
              type="button"
              disabled={rated !== null}
              onClick={() => void rate(value)}
              aria-label={value === "helpful" ? "Helpful" : "Not helpful"}
              className={cn(
                "grid size-8 place-items-center rounded-full border border-border/80 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground disabled:opacity-70",
                rated === value && "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              {value === "helpful" ? (
                <ThumbsUp className="size-3.5" aria-hidden="true" />
              ) : (
                <ThumbsDown className="size-3.5" aria-hidden="true" />
              )}
            </button>
          ))}
        </span>
      </div>

      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
        Government information changes. Confirm fees, documents and deadlines with the official
        source before you act. Need the full service page?{" "}
        <Link to="/services" className="font-semibold text-primary hover:underline">
          Browse services
        </Link>
        .
      </p>
    </div>
  );
}
