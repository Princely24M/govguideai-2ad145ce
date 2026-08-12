import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquareText } from "lucide-react";

import { WorkspaceShell } from "@/components/app/WorkspaceShell";
import { listConversations } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your GovGuide conversations" },
      { name: "description", content: "Pick up any saved GovGuide conversation or start a new one." },
      { property: "og:title", content: "Your GovGuide conversations" },
      { property: "og:description", content: "Your saved government-service conversations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const load = useServerFn(listConversations);
  const conversations = useQuery({
    queryKey: ["conversations", "active"],
    queryFn: () => load({ data: { status: "active" as const, limit: 25 } }),
  });

  return (
    <WorkspaceShell>
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Your conversations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you ask GovGuide while signed in is saved here, with the sources kept alongside each answer.
        </p>

        <ul className="mt-7 space-y-2">
          {(conversations.data ?? []).map((conversation) => (
            <li key={conversation.id}>
              <Link
                to="/c/$conversationId"
                params={{ conversationId: conversation.id }}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5"
              >
                <MessageSquareText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{conversation.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {conversations.isSuccess && (conversations.data ?? []).length === 0 ? (
          <p className="glass mt-7 rounded-2xl px-4 py-6 text-center text-sm text-muted-foreground">
            No saved conversations yet — use "New conversation" to start one.
          </p>
        ) : null}
      </main>
    </WorkspaceShell>
  );
}