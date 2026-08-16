import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type KpiAccent = "customers" | "holdings" | "deposits" | "withdrawals";

const ACCENT_ICON_STYLES: Record<KpiAccent, string> = {
  // Distinct-but-harmonious tinted gradients per KPI — replaces the old
  // flat gray icon circles. Each stays inside the same "enterprise
  // fintech" palette (no neon) so the four cards read as one family.
  customers: "bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 dark:from-sky-500/15 dark:to-sky-500/5 dark:text-sky-400",
  holdings:
    "bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 dark:from-brand-500/15 dark:to-brand-500/5 dark:text-brand-400",
  deposits:
    "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-400",
  withdrawals: "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 dark:from-rose-500/15 dark:to-rose-500/5 dark:text-rose-400",
};

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  accent: KpiAccent;
  isLoading: boolean;
  isError: boolean;
  hint?: string;
  /** Stagger offset (ms) applied to the entrance animation, e.g. index * 60. */
  animationDelayMs?: number;
  children: ReactNode;
}

/**
 * A single dashboard summary card (e.g. "Customers", "Total holdings").
 * Handles its own loading / error / value rendering so each KPI on the
 * Overview page can fail or load independently of the others.
 */
export function KpiCard({
  title,
  icon: Icon,
  accent,
  isLoading,
  isError,
  hint,
  animationDelayMs = 0,
  children,
}: KpiCardProps) {
  return (
    <div
      className="card-interactive animate-card-enter rounded-xl border border-border bg-card p-5 shadow-sm"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${ACCENT_ICON_STYLES[accent]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 min-h-8">
        {isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <span>Unavailable</span>
          </div>
        ) : (
          <div className="text-xl font-bold tracking-tight tabular-nums leading-snug">{children}</div>
        )}
      </div>

      {hint && !isLoading && !isError && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
