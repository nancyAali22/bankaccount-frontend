import { AlertCircle, Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatCurrency";
import { usePagination } from "@/hooks/usePagination";

import type { Account } from "@/types/account";
import { CardPagination } from "./CardPagination";

interface AccountsByBalanceProps {
  accounts: Account[] | undefined;
  /** customerId -> display name, built once by Overview from useCustomers(). */
  customerNames: Map<number, string>;
  isLoading: boolean;
  isError: boolean;
}

const STATUS_BADGE_VARIANT: Record<Account["status"], "success" | "warning" | "muted"> = {
  ACTIVE: "success",
  FROZEN: "warning",
  CLOSED: "muted",
};

const PAGE_SIZE = 5;

/**
 * All accounts sorted by balance, descending, 5 per page.
 *
 * Receives the already-fetched `accounts` list as a prop instead of
 * calling useAccounts() itself — the data was already loaded once by
 * the Overview page, so we reuse it here instead of firing a second
 * request for the same data. Same reasoning for `customerNames`: it is
 * built once in Overview from the existing useCustomers() hook (no
 * duplicate hook call, no per-account request).
 *
 * Note: balances are sorted numerically regardless of currency. This
 * is a simple display ranking, not a financial calculation, so mixing
 * currencies in the sort order is an accepted simplification here —
 * each row still shows its own real currency.
 */
export function AccountsByBalance({ accounts, customerNames, isLoading, isError }: AccountsByBalanceProps) {
  const sortedAccounts = accounts ? [...accounts].sort((a, b) => b.balance - a.balance) : [];
  const { page, pageCount, pageItems, hasPrevious, hasNext, goToPrevious, goToNext } = usePagination(
    sortedAccounts,
    PAGE_SIZE,
  );

  return (
    <div className="card-interactive animate-card-enter rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold tracking-tight">Accounts by balance</h2>

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
          <span>Couldn't load accounts</span>
        </div>
      )}

      {!isLoading && !isError && sortedAccounts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <Landmark className="size-6" aria-hidden="true" />
          <p className="text-sm">No accounts yet</p>
        </div>
      )}

      {!isLoading && !isError && sortedAccounts.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {pageItems.map((account) => {
              const holderName = customerNames.get(account.customerId);
              return (
                <li
                  key={account.id}
                  className="card-interactive flex items-center justify-between gap-4 rounded-lg border border-border bg-background/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{holderName ?? account.accountNumber}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {account.accountType === "SAVINGS" ? "Savings" : "Current"} · {account.currency}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={STATUS_BADGE_VARIANT[account.status]}>{account.status}</Badge>
                    <p className="mt-1 text-sm font-semibold tabular-nums">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>
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
