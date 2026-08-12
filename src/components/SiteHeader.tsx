import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, MessageSquareText, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300",
        scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent bg-transparent",
      )}
      style={{ transitionTimingFunction: "var(--ease-soft)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
            <span className="font-display text-sm font-semibold tracking-tight">GG</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.95rem] font-semibold tracking-tight">GovGuide</span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              AI Assistant
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading ? (
            user ? (
              <Link
                to="/dashboard"
                className="hidden items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:inline-flex"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                My conversations
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden items-center rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
            )
          ) : null}
          <Link
            to="/chat"
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-glow hover:brightness-110 sm:inline-flex"
          >
            <MessageSquareText className="size-4" aria-hidden="true" />
            Ask GovGuide
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-xl border border-border bg-surface/70 text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass mx-4 mb-3 rounded-2xl p-2 md:hidden">
          {[
            ...NAV,
            { to: "/chat", label: "Ask GovGuide" } as const,
            user
              ? ({ to: "/dashboard", label: "My conversations" } as const)
              : ({ to: "/auth", label: "Sign in" } as const),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
