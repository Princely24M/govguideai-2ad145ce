import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export function Disclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-border/70 bg-surface-muted/70 text-muted-foreground",
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground/70" aria-hidden="true" />
      <span>
        GovGuide is an AI-powered information assistant and is <strong>not</strong> an official government
        service. Always verify important information with the relevant government authority.
      </span>
    </p>
  );
}
