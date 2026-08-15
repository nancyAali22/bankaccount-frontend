import { AlertCircle, Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Account } from "@/types/account";

interface AccountsByBalanceProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const STATUS_STYLES: Record<Account["status"], string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  FROZEN: "bg-amber-50 text-amber-700",
  CLOSED: "bg-muted text-muted-foreground",
};

/**
 * Shows the top 5 accounts sorted by balance, descending.
 *
 * Receives the already-fetched `accounts` list as a prop instead of
 * calling useAccounts() itself — the data was already loaded once by
 * the Overview page, so we reuse it here instead of firing a second
 * request for the same data.
 *
 * Note: balances are sorted numerically regardless of currency. This
 * is a simple display ranking, not a financial calculation, so mixing
 * currencies in the sort order is an accepted simplification here —
 * each row still shows its own real currency.
 */
export function AccountsByBalance({ accounts, isLoading, isError }: AccountsByBalanceProps) {
  const topAccounts = accounts ? [...accounts].sort((a, b) => b.balance - a.balance).slice(0, 5) : [];

  return (
    <div className="rounded-lg border p-5">
      <h2 className="text-sm font-medium mb-4">Accounts by balance</h2>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>Couldn't load accounts</span>
        </div>
      )}

      {!isLoading && !isError && topAccounts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <Landmark className="size-6" aria-hidden="true" />
          <p className="text-sm">No accounts yet</p>
        </div>
      )}

      {!isLoading && !isError && topAccounts.length > 0 && (
        <ul className="space-y-4">
          {topAccounts.map((account) => (
            <li key={account.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{account.accountNumber}</p>
                <span
                  className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[account.status]}`}
                >
                  {account.status}
                </span>
              </div>
              <span className="shrink-0 pl-4 font-medium tabular-nums">
                {formatCurrency(account.balance, account.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}