import type { Transaction } from "@/types/transaction";
import { axiosInstance } from "./axiosInstance";
import type { Account } from "@/types/account";
import type { OpenAccountFormValues, TransactionFormValues } from "@/lib/validation/account.schema";

export async function getAccounts(): Promise<Account[]> {
  const response = await axiosInstance.get<Account[]>("accounts");
  return response.data;
}

export async function getAccount(id: number): Promise<Account> {
  const response = await axiosInstance.get<Account>(`accounts/${id}`);
  return response.data;
}

/** GET /api/accounts?customerId= — accounts belonging to one customer. */
export async function getAccountsByCustomer(customerId: number): Promise<Account[]> {
  const response = await axiosInstance.get<Account[]>("accounts", { params: { customerId } });
  return response.data;
}

export async function getAccountTransactions(accountId: number): Promise<Transaction[]> {
  const response = await axiosInstance.get<Transaction[]>(`accounts/${accountId}/transactions`);
  return response.data;
}

export async function openAccount(values: OpenAccountFormValues): Promise<Account> {
  const response = await axiosInstance.post<Account>("accounts", values);
  return response.data;
}

export async function depositToAccount(accountId: number, values: TransactionFormValues): Promise<Account> {
  const response = await axiosInstance.post<Account>(`accounts/${accountId}/deposit`, values);
  return response.data;
}

export async function withdrawFromAccount(
  accountId: number,
  values: TransactionFormValues,
): Promise<Account> {
  const response = await axiosInstance.post<Account>(`accounts/${accountId}/withdraw`, values);
  return response.data;
}