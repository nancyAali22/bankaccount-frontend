import { AlertCircle, ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import type { DashboardTransaction } from "@/hooks/useDashboardTransactions";


interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
  isLoading: boolean;
  isError: boolean;
  limit?: number;
}

const INCOMING_TYPES = new Set(["DEPOSIT", "TRANSFER_IN"]);

/**
 * Most recent transactions across every account, newest first.
 * Data comes pre-merged from useDashboardTransactions (see that hook for
 * why this requires one request per account under the current API).
 */
export function RecentTransactions({
  transactions,
  isLoading,
  isError,
  limit = 6,
}: RecentTransactionsProps) {
  const sorted = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-medium">Recent transactions</h2>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>Some transaction history couldn't be loaded</span>
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <Receipt className="size-6" aria-hidden="true" />
          <p className="text-sm">No transactions yet</p>
        </div>
      )}

      {!isLoading && sorted.length > 0 && (
        <ul className="space-y-4">
          {sorted.map((transaction) => {
            const isIncoming = INCOMING_TYPES.has(transaction.type);
            return (
              <li key={`${transaction.accountId}-${transaction.id}`} className="flex items-center gap-3 text-sm">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    isIncoming
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  }`}
                >
                  {isIncoming ? (
                    <ArrowDownLeft className="size-4" aria-hidden="true" />
                  ) : (
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {transaction.description || transaction.type.replace("_", " ")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {transaction.accountNumber} ·{" "}
                    {new Date(transaction.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-medium tabular-nums ${
                    isIncoming ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {isIncoming ? "+" : "-"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}