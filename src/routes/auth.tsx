import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { importGuestConversation } from "@/lib/account.functions";
import { clearGuestConversation, readGuestConversation } from "@/lib/guest-conversation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your GovGuide account" },
      {
        name: "description",
        content:
          "Create a free GovGuide account to save your government-service conversations and pick them up any time.",
      },
      { property: "og:title", content: "Sign in or create your GovGuide account" },
      {
        property: "og:description",
        content: "Save your GovGuide conversations and return to them whenever you need them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, loading } = useAuth();
  const importConversation = useServerFn(importGuestConversation);

  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saveGuest, setSaveGuest] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setPendingCount(readGuestConversation().length);
  }, []);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const finishSignIn = async () => {
    const guest = saveGuest ? readGuestConversation() : [];
    if (guest.length > 0) {
      try {
        const result = await importConversation({ data: { messages: guest } });
        clearGuestConversation();
        toast.success("Conversation saved to your account");
        router.invalidate();
        await navigate({ to: "/c/$conversationId", params: { conversationId: result.id } });
        return;
      } catch {
        toast.error("We couldn't save that conversation, but you're signed in.");
      }
    }
    clearGuestConversation();
    await navigate({ to: "/dashboard" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setNotice(null);

    if (mode === "forgot") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
      setBusy(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (resetError) return setError("We couldn't start the reset. Please try again shortly.");
      setNotice("If that email has an account, a reset link is on its way.");
      return;
    }

    if (mode === "signup") {
      if (displayName.trim().length < 2) return setError("Please enter your display name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
      if (password.length < 8) return setError("Use a password of at least 8 characters.");
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
        return setError("Include at least one letter and one number in your password.");
      if (password !== confirm) return setError("Those passwords don't match.");

      setBusy(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName.trim() },
        },
      });
      setBusy(false);

      if (signUpError) {
        const message = signUpError.message.toLowerCase();
        if (message.includes("already") || message.includes("registered")) {
          return setError("That email can't be used to create a new account. Try signing in instead.");
        }
        if (message.includes("password")) return setError("Please choose a stronger password.");
        return setError("We couldn't create your account. Please try again.");
      }

      if (!data.session) {
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      await finishSignIn();
      return;
    }

    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      const message = signInError.message.toLowerCase();
      if (message.includes("confirm"))
        return setError("Please confirm your email address before signing in.");
      return setError("That email and password combination didn't work.");
    }
    await finishSignIn();
  };

  return (
    <div className="mesh-light flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to GovGuide
        </Link>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            {mode === "signup"
              ? "Create your free account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {mode === "signup"
              ? "Save your conversations and return to them any time."
              : mode === "forgot"
                ? "We'll email you a secure link to set a new password."
                : "Sign in to reach your saved GovGuide conversations."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" ? (
              <Field
                id="display-name"
                label="Display name"
                value={displayName}
                onChange={setDisplayName}
                autoComplete="name"
                placeholder="Princely"
              />
            ) : null}

            <Field
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="you@example.com"
            />

            {mode !== "forgot" ? (
              <Field
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                hint={mode === "signup" ? "At least 8 characters, with a letter and a number." : undefined}
              />
            ) : null}

            {mode === "signup" ? (
              <Field
                id="confirm-password"
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
              />
            ) : null}

            {pendingCount > 0 && mode !== "forgot" ? (
              <label className="flex items-start gap-3 rounded-2xl bg-surface-muted/70 p-3.5 text-sm">
                <input
                  type="checkbox"
                  checked={saveGuest}
                  onChange={(event) => setSaveGuest(event.target.checked)}
                  className="mt-0.5 size-4 rounded border-border accent-[var(--primary)]"
                />
                <span className="text-foreground/85">
                  Save my current conversation to my account
                  <span className="block text-xs text-muted-foreground">
                    {pendingCount} message{pendingCount === 1 ? "" : "s"} from this session
                  </span>
                </span>
              </label>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-2xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="rounded-2xl bg-success/10 px-3.5 py-2.5 text-sm text-foreground/90">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            {mode === "signin" ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-primary hover:underline"
                >
                  Create account
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-semibold text-primary hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          You can keep using GovGuide without an account —{" "}
          <Link to="/chat" className="font-semibold text-primary hover:underline">
            continue as guest
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/90">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-1.5 w-full rounded-2xl border border-input bg-surface/80 px-3.5 py-2.5 text-sm text-foreground",
          "placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none",
        )}
      />
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}