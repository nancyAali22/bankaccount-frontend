export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}