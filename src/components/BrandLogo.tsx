import mark from "@/assets/govguide-mark.png.asset.json";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const MARK_SIZE: Record<Size, string> = {
  xs: "h-5 w-auto",
  sm: "h-7 w-auto",
  md: "h-9 w-auto",
  lg: "h-14 w-auto",
};

const WORD_SIZE: Record<Size, string> = {
  xs: "text-[0.8rem]",
  sm: "text-[0.95rem]",
  md: "text-base",
  lg: "text-xl",
};

export function BrandMark({
  size = "md",
  className,
}: {
  size?: Size | undefined;
  className?: string | undefined;
}) {
  return (
    <img
      src={mark.url}
      alt="GovGuide AI"
      width={760}
      height={740}
      loading="eager"
      decoding="async"
      className={cn(
        "shrink-0 select-none object-contain opacity-0 animate-[brand-in_420ms_var(--ease-soft,ease-out)_forwards]",
        MARK_SIZE[size],
        className,
      )}
    />
  );
}

/**
 * variant="mark" — icon only. variant="full" — icon + GOVGUIDE AI wordmark.
 */
export function BrandLogo({
  variant = "full",
  size = "md",
  className,
  subtitle,
}: {
  variant?: "full" | "mark" | undefined;
  size?: Size | undefined;
  className?: string | undefined;
  subtitle?: string | undefined;
}) {
  if (variant === "mark") return <BrandMark size={size} className={className} />;

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn("font-display font-semibold tracking-tight", WORD_SIZE[size])}>
          GovGuide <span className="text-primary">AI</span>
        </span>
        {subtitle ? (
          <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
