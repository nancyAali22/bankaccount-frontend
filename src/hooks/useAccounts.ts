import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/accountsApi";
import { queryKeys } from "@/lib/queryKeys";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all(),
    queryFn: getAccounts,
  });
}