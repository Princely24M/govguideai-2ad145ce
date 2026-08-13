import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Archive,
  BarChart3,
  Home,
  LogOut,
  Menu,
  MessageSquarePlus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { BrandLogo, BrandMark } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import {
  createConversation,
  listConversations,
  searchConversations,
  type ConversationRow,
} from "@/lib/account.functions";
import { cn } from "@/lib/utils";

export function WorkspaceShell({
  children,
  activeConversationId,
}: {
  children: ReactNode;
  activeConversationId?: string | undefined;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [activeConversationId]);

  return (
    <div className="mesh-light flex min-h-screen">
      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-sidebar/70 backdrop-blur-xl lg:block">
        <SidebarBody activeConversationId={activeConversationId} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[19rem] max-w-[86vw] border-r border-border/70 bg-sidebar shadow-elevated">
            <SidebarBody activeConversationId={activeConversationId} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-xl border border-border bg-surface/70"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <BrandMark size="xs" />
          <span className="font-display text-sm font-semibold tracking-tight">GovGuide AI</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SidebarBody({
  activeConversationId,
  onNavigate,
}: {
  activeConversationId?: string | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  const load = useServerFn(listConversations);
  const search = useServerFn(searchConversations);
  const startConversation = useServerFn(createConversation);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(timer);
  }, [term]);

  const recent = useQuery({
    queryKey: ["conversations", "active"],
    queryFn: () => load({ data: { status: "active" as const, limit: 25 } }),
  });

  const results = useQuery({
    queryKey: ["conversations", "search", debounced],
    queryFn: () => search({ data: { q: debounced } }),
    enabled: debounced.length > 1,
  });

  const create = useMutation({
    mutationFn: () => startConversation({ data: undefined }),
    onSuccess: async (conversation: ConversationRow) => {
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onNavigate?.();
      await navigate({ to: "/c/$conversationId", params: { conversationId: conversation.id } });
    },
    onError: () => toast.error("We couldn't start a new conversation."),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.invalidate();
    await navigate({ to: "/auth", replace: true });
  };

  const list = debounced.length > 1 ? (results.data ?? []) : (recent.data ?? []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <Link to="/" onClick={onNavigate} aria-label="GovGuide AI — home" className="flex items-center">
          <BrandLogo size="sm" />
        </Link>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-xl border border-border/70"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110 disabled:opacity-60"
        >
          <MessageSquarePlus className="size-4" aria-hidden="true" />
          New conversation
        </button>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="conversation-search" className="sr-only">
            Search your conversations
          </label>
          <input
            id="conversation-search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-2xl border border-input bg-surface/80 py-2.5 pl-9 pr-3 text-sm focus:border-ring focus:outline-none"
          />
        </div>
      </div>

      <nav className="mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-4" aria-label="Conversations">
        <p className="px-2 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {debounced.length > 1 ? "Search results" : "Recent"}
        </p>
        {list.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {debounced.length > 1 ? "No conversations matched." : "No saved conversations yet."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {list.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to="/c/$conversationId"
                  params={{ conversationId: conversation.id }}
                  onClick={onNavigate}
                  className={cn(
                    "block truncate rounded-xl px-3 py-2.5 text-sm text-foreground/85 transition-colors hover:bg-secondary",
                    activeConversationId === conversation.id && "bg-secondary font-semibold text-foreground",
                  )}
                >
                  {conversation.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-border/70 p-2">
        {[
          { to: "/archived", label: "Archived", icon: Archive },
          { to: "/usage", label: "Usage", icon: BarChart3 },
          { to: "/settings", label: "Settings", icon: Settings },
          { to: "/", label: "Public site", icon: Home },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-foreground"
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}

        <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{user?.email}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}