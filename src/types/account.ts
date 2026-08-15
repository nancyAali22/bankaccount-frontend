export type AccountType = "SAVINGS" | "CURRENT";

export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  accountType: AccountType;
  currency: string;
  status: AccountStatus;
  customerId: number;
  createdAt: string;
}