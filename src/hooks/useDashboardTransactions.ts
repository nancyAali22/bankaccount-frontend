import { useQueries } from "@tanstack/react-query";
import { getAccountTransactions } from "@/api/accountsApi";
import { queryKeys } from "@/lib/queryKeys";
import type { Account } from "@/types/account";
import type { Transaction } from "@/types/transaction";

export interface DashboardTransaction extends Transaction {
  accountId: number;
  accountNumber: string;
  currency: string;
}

interface UseDashboardTransactionsResult {
  transactions: DashboardTransaction[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * N+1 REQUEST PATTERN — INTENTIONAL, TEMPORARY, DOCUMENTED.
 *
 * The backend has no dashboard/summary endpoint (no
 * "GET /api/transactions/recent" or "GET /api/accounts/statement-summary").
 * The only way to build "recent transactions across the whole bank" with
 * the current API contract is:
 *
 *   1. GET /api/accounts            -> every account
 *   2. GET /api/accounts/{id}/transactions, once per account, in parallel
 *
 * That is genuinely an N+1 pattern (1 account-list request + N per-account
 * requests). We accept it here ONLY because:
 *   - `useQueries` fires every account's request in parallel (not a
 *     sequential loop), so wall-clock cost is one round trip, not N.
 *   - The teller console currently has a handful of demo accounts, not
 *     thousands.
 *   - staleTime keeps this from re-firing on every render/navigation.
 *
 * The correct long-term fix is a backend aggregation endpoint, e.g.
 * `GET /api/transactions/recent?limit=10` or
 * `GET /api/dashboard/summary`, that does this join server-side and
 * returns already-paginated, already-sorted data. That is a backend
 * change and is out of scope here — flagging it so it can be requested
 * explicitly later instead of silently working around it forever.
 */
export function useDashboardTransactions(accounts: Account[] | undefined): UseDashboardTransactionsResult {
  const results = useQueries({
    queries: (accounts ?? []).map((account) => ({
      queryKey: queryKeys.accounts.transactions(account.id),
      queryFn: () => getAccountTransactions(account.id),
      enabled: accounts !== undefined,
      staleTime: 30_000,
      retry: 1,
    })),
  });

  const isLoading = accounts === undefined || results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const transactions: DashboardTransaction[] = accounts
    ? results.flatMap((result, index) => {
        const account = accounts[index];
        if (!result.data) return [];
        return result.data.map((transaction) => ({
          ...transaction,
          accountId: account.id,
          accountNumber: account.accountNumber,
          currency: account.currency,
        }));
      })
    : [];

  return {
    transactions,
    isLoading,
    isError,
    refetch: () => results.forEach((r) => r.refetch()),
  };
}
