import { AlertCircle, ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import { usePagination } from "@/hooks/usePagination";
import { CardPagination } from "./CardPagination";
import type { DashboardTransaction } from "@/hooks/useDashboardTransactions";

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
  isLoading: boolean;
  isError: boolean;
}

const INCOMING_TYPES = new Set(["DEPOSIT", "TRANSFER_IN"]);
const PAGE_SIZE = 5;

/**
 * Most recent transactions across every account, newest first, 5 per page.
 * Data comes pre-merged from useDashboardTransactions (see that hook for
 * why this requires one request per account under the current API) —
 * this component only changes how that already-fetched list is displayed.
 */
export function RecentTransactions({ transactions, isLoading, isError }: RecentTransactionsProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const { page, pageCount, pageItems, hasPrevious, hasNext, goToPrevious, goToNext } = usePagination(
    sorted,
    PAGE_SIZE,
  );

  return (
    <div className="card-interactive animate-card-enter rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold tracking-tight">Recent transactions</h2>

      {isLoading && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
        <>
          <ul className="mt-4 space-y-3">
            {pageItems.map((transaction) => {
              const isIncoming = INCOMING_TYPES.has(transaction.type);
              return (
                <li
                  key={`${transaction.accountId}-${transaction.id}`}
                  className="card-interactive flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
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
                    <p className="truncate text-sm font-medium">
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
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
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

          <CardPagination
            page={page}
            pageCount={pageCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </>
      )}
    </div>
  );
}
