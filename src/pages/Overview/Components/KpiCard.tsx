import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  isError: boolean;
  hint?: string;
  children: ReactNode;
}

/**
 * A single dashboard summary card (e.g. "Customers", "Total holdings").
 * Handles its own loading / error / value rendering so each KPI on the
 * Overview page can fail or load independently of the others.
 */
export function KpiCard({ title, icon: Icon, isLoading, isError, hint, children }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 min-h-9">
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <span>Unavailable</span>
          </div>
        ) : (
          <div className="text-2xl font-semibold tracking-tight">{children}</div>
        )}
      </div>

      {hint && !isLoading && !isError && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}