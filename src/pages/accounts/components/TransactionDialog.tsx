import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowDownLeft, ArrowUpRight, PenLine, WalletMinimal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconField } from "@/components/IconField";
import { DialogBrandHeader } from "@/components/DialogBrandHeader";
import { useDeposit, useWithdraw } from "@/hooks/useAccounts";
import { transactionSchema, type TransactionFormValues } from "@/lib/validation/account.schema";
import { formatCurrency } from "@/lib/formatCurrency";
import type { ApiError } from "@/types/apiError";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "deposit" | "withdraw";
  accountId: number;
  accountNumber: string;
  availableBalance: number;
  currency: string;
}

const emptyValues: TransactionFormValues = { amount: 0, description: "" };

/**
 * One dialog handles both deposit and withdraw — same fields (amount +
 * optional description), same DTO (TransactionRequest) on two different
 * endpoints. `mode` only changes the copy, the mutation used, and the
 * withdraw-specific balance check below.
 */
export function TransactionDialog({
  open,
  onOpenChange,
  mode,
  accountId,
  accountNumber,
  availableBalance,
  currency,
}: TransactionDialogProps) {
  const isWithdraw = mode === "withdraw";
  const form = useForm<TransactionFormValues>({ defaultValues: emptyValues });

  const deposit = useDeposit(accountId);
  const withdraw = useWithdraw(accountId);
  const mutation = isWithdraw ? withdraw : deposit;

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  // Client-side check purely for immediate UX feedback (no round trip
  // needed to tell the teller the obvious). It does NOT block submission —
  // the backend's own balance check (which sees the true, current balance)
  // is what actually decides whether the withdrawal succeeds, since the
  // balance shown here could be stale if another transaction happened
  // elsewhere in the meantime.
  const exceedsBalance = isWithdraw && Number(watchedAmount) > availableBalance;

  function onSubmit(values: TransactionFormValues) {
    const result = transactionSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        form.setError(issue.path[0] as keyof TransactionFormValues, { message: issue.message });
      }
      return;
    }

    mutation.mutate(result.data, {
      onSuccess: () => onOpenChange(false),
      onError: (error: ApiError) => {
        // Insufficient-funds / business-rule errors from the backend are
        // the real authority here — surfaced as the backend's own message,
        // not a generic one, since it may include specifics (e.g. exact
        // available balance) the frontend doesn't independently know.
        form.setError("amount", { message: error.message });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton={false}>
        <DialogBrandHeader
          icon={isWithdraw ? ArrowUpRight : ArrowDownLeft}
          title={isWithdraw ? "Withdraw funds" : "Deposit funds"}
          description={
            <>
              {accountNumber} · available {formatCurrency(availableBalance, currency)}
            </>
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ({currency})</FormLabel>
                  <FormControl>
                    <IconField icon={WalletMinimal}>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 pr-2.5"
                        {...field}
                      />
                    </IconField>
                  </FormControl>
                  {exceedsBalance && !form.formState.errors.amount && (
                    <p className="text-sm text-amber-600">
                      This is more than the available balance — the server will reject it if the
                      balance hasn't changed.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <IconField icon={PenLine}>
                      <Input
                        className="pl-8 pr-2.5"
                        placeholder={isWithdraw ? "ATM withdrawal" : "Cash deposit"}
                        {...field}
                      />
                    </IconField>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-900 text-white hover:bg-brand-800"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Processing…"
                  : isWithdraw
                    ? "Confirm withdrawal"
                    : "Confirm deposit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
