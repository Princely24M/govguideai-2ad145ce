import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ArrowUp, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { WorkspaceShell } from "@/components/app/WorkspaceShell";
import { AnswerBody } from "@/components/chat/AnswerBody";
import { BrandMark } from "@/components/BrandLogo";
import { Disclaimer } from "@/components/Disclaimer";
import {
  askInConversation,
  deleteConversation,
  getConversation,
  setConversationStatus,
  type MessageRow,
} from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/c/$conversationId")({
  head: () => ({
    meta: [
      { title: "Conversation — GovGuide" },
      {
        name: "description",
        content: "A saved GovGuide conversation about South African government services.",
      },
      { property: "og:title", content: "Conversation — GovGuide" },
      { property: "og:description", content: "A saved GovGuide conversation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = useParams({ from: "/_authenticated/c/$conversationId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchConversation = useServerFn(getConversation);
  const ask = useServerFn(askInConversation);
  const archive = useServerFn(setConversationStatus);
  const remove = useServerFn(deleteConversation);

  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [optimistic, setOptimistic] = useState<MessageRow[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const conversation = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation({ data: { id: conversationId, limit: 60 } }),
  });

  useEffect(() => {
    setOptimistic([]);
    textareaRef.current?.focus();
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.data, optimistic, pending]);

  const messages = [...(conversation.data?.messages ?? []), ...optimistic];

  const send = async () => {
    const question = input.trim();
    if (!question || pending) return;
    setInput("");
    setPending(true);
    setOptimistic([
      {
        id: `local-${Date.now()}`,
        role: "user",
        content: question,
        sources: [],
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const result = await ask({ data: { conversationId, question } });
      if ("error" in result) toast.error(result.error);
    } catch {
      toast.error("We couldn't reach the assistant. Please try again.");
    } finally {
      setPending(false);
      setOptimistic([]);
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      textareaRef.current?.focus();
    }
  };

  return (
    <WorkspaceShell activeConversationId={conversationId}>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex min-w-0 items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <BrandMark size="xs" />
            <span className="truncate">
              {conversation.data?.conversation?.title ?? "Conversation"}
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await archive({ data: { id: conversationId, status: "archived" as const } });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
                toast.success("Conversation archived");
                await navigate({ to: "/dashboard" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Archive className="size-3.5" aria-hidden="true" />
              Archive
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Delete this conversation permanently?")) return;
                await remove({ data: { id: conversationId } });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
                toast.success("Conversation deleted");
                await navigate({ to: "/dashboard" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>

        <ol className="mt-7 space-y-6" aria-live="polite">
          {messages.map((message) => (
            <li key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-primary px-4 py-3 text-[0.94rem] leading-relaxed text-primary-foreground">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="glass rounded-3xl rounded-bl-lg p-5">
                  <AnswerBody content={message.content} />
                  {message.sources.length > 0 ? (
                    <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
                      {message.sources.map((source) => (
                        <div
                          key={source.slug}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-muted/70 px-3.5 py-2.5 text-xs"
                        >
                          <div>
                            <p className="font-semibold">Source: {source.authority}</p>
                            <p className="text-muted-foreground">
                              {source.serviceName} · last verified {source.lastVerified}
                            </p>
                          </div>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                          >
                            View official information
                            <ExternalLink className="size-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ol>

        {pending ? (
          <p className="mt-6 text-xs font-medium text-muted-foreground" role="status">
            Checking the verified knowledge base…
          </p>
        ) : null}
        <div ref={endRef} />

        <div className="sticky bottom-4 mt-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            className="glass flex items-end gap-2 rounded-3xl p-2.5"
          >
            <label htmlFor="conversation-input" className="sr-only">
              Ask about a government service
            </label>
            <textarea
              id="conversation-input"
              ref={textareaRef}
              rows={1}
              value={input}
              maxLength={2000}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask about IDs, passports, licences, grants, UIF or registering a business…"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.95rem] focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              aria-label="Send question"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </button>
          </form>
          <Disclaimer compact className="mt-2.5 border-transparent bg-transparent" />
        </div>
      </main>
    </WorkspaceShell>
  );
}
