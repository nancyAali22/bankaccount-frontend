import { z } from "zod";

/** Mirrors the backend enum com.nancyahmed.bankaccount.domain.enums.AccountType exactly. */
export const accountTypeSchema = z.enum(["SAVINGS", "CURRENT"]);

/**
 * Mirrors OpenAccountRequest (backend): customerId, accountType, currency
 * are all required. There is no "opening deposit" field on this endpoint —
 * the backend does not support funding an account at creation time, so this
 * schema (and any form built on it) must not invent one.
 */
export const openAccountSchema = z.object({
  customerId: z.number().int().positive(),
  accountType: accountTypeSchema,
  currency: z.string().trim().min(1, "Currency is required"),
});

export type OpenAccountFormValues = z.infer<typeof openAccountSchema>;

/**
 * Mirrors TransactionRequest (backend): amount must be present and
 * strictly positive (@Positive), description is optional. Used for both
 * the deposit and the withdraw forms — the backend uses the same DTO for
 * both endpoints.
 */
export const transactionSchema = z.object({
  amount: z.coerce
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than zero"),
  description: z.string().trim().optional().or(z.literal("")),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
