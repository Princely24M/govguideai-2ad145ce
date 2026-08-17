import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { WorkspaceShell } from "@/components/app/WorkspaceShell";
import { listConversations, setConversationStatus } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/archived")({
  head: () => ({
    meta: [
      { title: "Archived conversations — GovGuide" },
      { name: "description", content: "Conversations you have archived in GovGuide." },
      { property: "og:title", content: "Archived conversations — GovGuide" },
      { property: "og:description", content: "Conversations you have archived." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArchivedPage,
});

function ArchivedPage() {
  const queryClient = useQueryClient();
  const load = useServerFn(listConversations);
  const restore = useServerFn(setConversationStatus);

  const archived = useQuery({
    queryKey: ["conversations", "archived"],
    queryFn: () => load({ data: { status: "archived" as const, limit: 50 } }),
  });

  return (
    <WorkspaceShell>
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Archived</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Archived conversations stay saved but out of your recent list.
        </p>

        <ul className="mt-7 space-y-2">
          {(archived.data ?? []).map((conversation) => (
            <li
              key={conversation.id}
              className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5"
            >
              <Link
                to="/c/$conversationId"
                params={{ conversationId: conversation.id }}
                className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
              >
                {conversation.title}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await restore({ data: { id: conversation.id, status: "active" as const } });
                  await queryClient.invalidateQueries({ queryKey: ["conversations"] });
                  toast.success("Conversation restored");
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Restore
              </button>
            </li>
          ))}
        </ul>

        {archived.isSuccess && (archived.data ?? []).length === 0 ? (
          <p className="glass mt-7 rounded-2xl px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing archived yet.
          </p>
        ) : null}
      </main>
    </WorkspaceShell>
  );
}
