import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new GovGuide password" },
      { name: "description", content: "Choose a new password for your GovGuide account." },
      { property: "og:title", content: "Set a new GovGuide password" },
      { property: "og:description", content: "Choose a new password for your GovGuide account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return setError("Include at least one letter and one number.");
    if (password !== confirm) return setError("Those passwords don't match.");

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError("That reset link has expired. Please request a new one.");
      return;
    }
    toast.success("Password updated");
    await navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mesh-light flex min-h-screen items-center justify-center px-5 py-12">
      <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 p-2">
          <BrandMark size="md" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a password you haven't used on GovGuide before.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground/90">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-input bg-surface/80 px-3.5 py-2.5 text-sm focus:border-ring focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirm-new" className="block text-sm font-medium text-foreground/90">
              Confirm new password
            </label>
            <input
              id="confirm-new"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-input bg-surface/80 px-3.5 py-2.5 text-sm focus:border-ring focus:outline-none"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Update password
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
