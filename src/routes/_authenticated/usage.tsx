import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { WorkspaceShell } from "@/components/app/WorkspaceShell";
import { getMyUsage } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/usage")({
  head: () => ({
    meta: [
      { title: "Your GovGuide usage" },
      { name: "description", content: "How many GovGuide answers you have received and the tokens used." },
      { property: "og:title", content: "Your GovGuide usage" },
      { property: "og:description", content: "Answers received and tokens used on GovGuide." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsagePage,
});

function UsagePage() {
  const load = useServerFn(getMyUsage);
  const usage = useQuery({ queryKey: ["usage"], queryFn: () => load({ data: undefined }) });
  const data = usage.data;

  const cards = [
    { label: "Answers received", value: data?.responses ?? 0 },
    { label: "Input tokens", value: data?.inputTokens ?? 0 },
    { label: "Output tokens", value: data?.outputTokens ?? 0 },
    { label: "Total tokens", value: data?.totalTokens ?? 0 },
  ];

  return (
    <WorkspaceShell>
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="mt-2 text-sm text-muted-foreground">A running total across your saved conversations.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <div key={card.label} className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {data && !data.tokensAvailable ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Token counts appear once the assistant reports them for your answers.
          </p>
        ) : null}
      </main>
    </WorkspaceShell>
  );
}