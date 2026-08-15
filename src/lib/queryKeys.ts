/**
 * Single source of truth for React Query keys.
 *
 * Why this exists: before this file, `useCustomers` used the literal
 * array `["customers"]` and `pages/Overview/Services/quiries.ts` used a
 * *different* literal `["customers"]` for what was supposed to be the same
 * data — easy to typo, easy to drift, and impossible to grep for "every
 * query that touches customer #5". Centralizing the keys fixes all three.
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.customers.all(), queryFn: getCustomers })
 *   useQuery({ queryKey: queryKeys.customers.detail(id), queryFn: () => getCustomer(id) })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() })
 */
export const queryKeys = {
  customers: {
    all: () => ["customers"] as const,
    detail: (id: number) => ["customers", id] as const,
  },
  accounts: {
    /** Every account, unfiltered (GET /api/accounts). */
    all: () => ["accounts"] as const,
    /** Accounts belonging to one customer (GET /api/accounts?customerId=). */
    byCustomer: (customerId: number) => ["accounts", "byCustomer", customerId] as const,
    detail: (id: number) => ["accounts", id] as const,
    transactions: (accountId: number) => ["accounts", accountId, "transactions"] as const,
  },
};
