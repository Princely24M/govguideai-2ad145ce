import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { WorkspaceShell } from "@/components/app/WorkspaceShell";
import { useTheme, type ThemeChoice } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { deleteAllConversations, getMyProfile, updateMyProfile } from "@/lib/account.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GovGuide" },
      { name: "description", content: "Manage your GovGuide profile, appearance and saved data." },
      { property: "og:title", content: "Settings — GovGuide" },
      { property: "og:description", content: "Manage your GovGuide account preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const loadProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const wipeConversations = useServerFn(deleteAllConversations);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => loadProfile({ data: undefined }) });
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile.data?.display_name) setDisplayName(profile.data.display_name);
  }, [profile.data?.display_name]);

  const save = useMutation({
    mutationFn: (input: { displayName?: string; theme?: ThemeChoice }) => saveProfile({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("We couldn't save that. Please try again."),
  });

  return (
    <WorkspaceShell>
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>

        <section className="glass mt-7 rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
          <label htmlFor="display-name" className="mt-4 block text-sm font-medium">
            Display name
          </label>
          <input
            id="display-name"
            value={displayName}
            maxLength={60}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-input bg-surface/80 px-3.5 py-2.5 text-sm focus:border-ring focus:outline-none"
          />
          <button
            type="button"
            disabled={save.isPending || displayName.trim().length < 2}
            onClick={() => save.mutate({ displayName: displayName.trim() })}
            className="mt-3 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
          >
            Save profile
          </button>
        </section>

        <section className="glass mt-4 rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold">Appearance</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {THEMES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  save.mutate({ theme: option.value });
                }}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  theme === option.value && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="font-display text-base font-semibold text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-foreground/80">
            Deleting your conversations is permanent and cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Delete every saved conversation? This cannot be undone.")) return;
                await wipeConversations({ data: undefined });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
                toast.success("All conversations deleted");
                await navigate({ to: "/dashboard" });
              }}
              className="rounded-2xl border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              Delete all conversations
            </button>
            <button
              type="button"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
                await navigate({ to: "/auth", replace: true });
              }}
              className="rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    </WorkspaceShell>
  );
}