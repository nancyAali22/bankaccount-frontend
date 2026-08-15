import type { Transaction } from "@/types/transaction";
import { axiosInstance } from "./axiosInstance";
import type { Account } from "@/types/account";


export async function getAccounts(): Promise<Account[]> {
  const response = await axiosInstance.get<Account[]>("accounts");
  return response.data;
}

export async function getAccountTransactions(accountId: number): Promise<Transaction[]> {
  const response = await axiosInstance.get<Transaction[]>(`accounts/${accountId}/transactions`);
  return response.data;
}