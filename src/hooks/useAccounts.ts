import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  depositToAccount,
  getAccount,
  getAccounts,
  getAccountsByCustomer,
  getAccountTransactions,
  openAccount,
  withdrawFromAccount,
} from "@/api/accountsApi";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/lib/notify";
import { formatCurrency } from "@/lib/formatCurrency";
import type { ApiError } from "@/types/apiError";
import type { OpenAccountFormValues, TransactionFormValues } from "@/lib/validation/account.schema";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all(),
    queryFn: getAccounts,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => getAccount(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useAccountsByCustomer(customerId: number) {
  return useQuery({
    queryKey: queryKeys.accounts.byCustomer(customerId),
    queryFn: () => getAccountsByCustomer(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
  });
}

export function useAccountTransactions(accountId: number) {
  return useQuery({
    queryKey: queryKeys.accounts.transactions(accountId),
    queryFn: () => getAccountTransactions(accountId),
    enabled: Number.isFinite(accountId) && accountId > 0,
  });
}

/**
 * Opens a new account, then invalidates every cached view that could show
 * it: the flat accounts list (Overview, Customers table), the specific
 * customer's account list (Customer detail page), and the customers list
 * itself (its "Accounts" badges and "Total balance" column both read from
 * accounts data joined client-side).
 */
export function useOpenAccount(customerId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OpenAccountFormValues) => openAccount(values),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.byCustomer(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      notify.success(`Account ${account.accountNumber} was opened.`);
    },
    onError: (error: ApiError) => notify.error(error.message),
  });
}

/**
 * Deposit and withdraw both invalidate the same set of queries: the
 * account's own detail (new balance), its transaction history (new row),
 * the flat accounts list, and the customers list (Total balance column
 * changed too). Sharing this list avoids repeating it in two mutations.
 */
function invalidateAfterTransaction(queryClient: ReturnType<typeof useQueryClient>, accountId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(accountId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.transactions(accountId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
}

export function useDeposit(accountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TransactionFormValues) => depositToAccount(accountId, values),
    onSuccess: (account) => {
      invalidateAfterTransaction(queryClient, accountId);
      notify.success(`Deposited successfully. New balance: ${formatCurrency(account.balance, account.currency)}.`);
    },
    onError: (error: ApiError) => notify.error(error.message),
  });
}

export function useWithdraw(accountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TransactionFormValues) => withdrawFromAccount(accountId, values),
    onSuccess: (account) => {
      invalidateAfterTransaction(queryClient, accountId);
      notify.success(`Withdrawal successful. New balance: ${formatCurrency(account.balance, account.currency)}.`);
    },
    onError: (error: ApiError) => notify.error(error.message),
  });
}
