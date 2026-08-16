import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Globe, Landmark, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogBrandHeader } from "@/components/DialogBrandHeader";
import { useOpenAccount } from "@/hooks/useAccounts";
import { openAccountSchema, type OpenAccountFormValues } from "@/lib/validation/account.schema";
import type { ApiError } from "@/types/apiError";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpenAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number;
  customerName: string;
}

// The backend accepts any non-blank currency string on OpenAccountRequest —
// there's no enum constraint server-side. This list is just a sensible,
// finite set of choices for the UI so the teller isn't typing free text;
// it is not a backend validation rule being duplicated.
const CURRENCIES = ["USD", "EUR", "EGP", "GBP"] as const;

const emptyValues = (customerId: number): OpenAccountFormValues => ({
  customerId,
  accountType: "SAVINGS",
  currency: "USD",
});

export function OpenAccountDialog({ open, onOpenChange, customerId, customerName }: OpenAccountDialogProps) {
  const form = useForm<OpenAccountFormValues>({ defaultValues: emptyValues(customerId) });
  const openAccountMutation = useOpenAccount(customerId);

  useEffect(() => {
    if (open) form.reset(emptyValues(customerId));
  }, [open, customerId, form]);

  function onSubmit(values: OpenAccountFormValues) {
    const result = openAccountSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        form.setError(issue.path[0] as keyof OpenAccountFormValues, { message: issue.message });
      }
      return;
    }

    openAccountMutation.mutate(result.data, {
      onSuccess: () => onOpenChange(false),
      onError: (error: ApiError) => {
        if (error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof OpenAccountFormValues, { message });
          }
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton={false}>
        <DialogBrandHeader
          icon={WalletCards}
          title="Open a new account"
          description={
            <>
              For {customerName}.{" "}
              {/*
                The reference design shows an "opening deposit" field, but
                OpenAccountRequest on the backend has no `amount` field — it
                cannot fund the account at creation time. Rather than invent
                a field the API would silently ignore (or reject), the
                account opens with a zero balance and the teller makes the
                first deposit afterwards from the account detail page.
              */}
              The account opens with a $0 balance — use Deposit afterwards to fund it.
            </>
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span className="flex items-center gap-2">
                          <Landmark className="size-4 text-brand-500" aria-hidden="true" />
                          <SelectValue />
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="CURRENT">Current</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span className="flex items-center gap-2">
                          <Globe className="size-4 text-brand-500" aria-hidden="true" />
                          <SelectValue />
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                disabled={openAccountMutation.isPending}
              >
                {openAccountMutation.isPending ? "Opening…" : "Open account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
