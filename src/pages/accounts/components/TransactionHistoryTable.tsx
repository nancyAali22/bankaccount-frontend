import { AlertCircle, ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction, TransactionType } from "@/types/transaction";

interface TransactionHistoryTableProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  currency: string;
}

const TYPE_META: Record<TransactionType, { label: string; sign: "+" | "-"; icon: typeof ArrowDownLeft }> = {
  DEPOSIT: { label: "Deposit", sign: "+", icon: ArrowDownLeft },
  TRANSFER_IN: { label: "Transfer in", sign: "+", icon: ArrowDownLeft },
  WITHDRAWAL: { label: "Withdrawal", sign: "-", icon: ArrowUpRight },
  TRANSFER_OUT: { label: "Transfer out", sign: "-", icon: ArrowUpRight },
};

function formatWhen(isoString: string): string {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionHistoryTable({
  transactions,
  isLoading,
  isError,
  currency,
}: TransactionHistoryTableProps) {
  const sorted = transactions
    ? [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-4 text-sm font-medium">Transaction history</h2>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>Couldn't load transaction history</span>
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
          <Receipt className="size-6" aria-hidden="true" />
          <p className="text-sm">No transactions yet</p>
        </div>
      )}

      {!isLoading && !isError && sorted.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((tx) => {
                  const meta = TYPE_META[tx.type];
                  const Icon = meta.icon;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon
                            className={`size-3.5 ${meta.sign === "+" ? "text-emerald-600" : "text-rose-600"}`}
                            aria-hidden="true"
                          />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.description || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatWhen(tx.createdAt)}</TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${
                          meta.sign === "+" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {meta.sign}
                        {formatCurrency(tx.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(tx.balanceAfter, currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {sorted.map((tx) => {
              const meta = TYPE_META[tx.type];
              const Icon = meta.icon;
              return (
                <div key={tx.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <Icon
                        className={`size-3.5 ${meta.sign === "+" ? "text-emerald-600" : "text-rose-600"}`}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </span>
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        meta.sign === "+" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {meta.sign}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{tx.description || "—"}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatWhen(tx.createdAt)}</span>
                    <span>Balance after {formatCurrency(tx.balanceAfter, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
