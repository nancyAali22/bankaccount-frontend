import { AlertCircle, ArrowDownLeft, ArrowUpRight, Calendar, Filter, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { usePagination } from "@/hooks/usePagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction, TransactionType } from "@/types/transaction";
import { TransactionPagination } from "./TransactionPagination";

interface TransactionHistoryTableProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  currency: string;
}

const PAGE_SIZE = 5;

const TYPE_META: Record<
  TransactionType,
  { label: string; sign: "+" | "-"; icon: typeof ArrowDownLeft; tone: string }
> = {
  DEPOSIT: { label: "Deposit", sign: "+", icon: ArrowDownLeft, tone: "bg-emerald-50 text-emerald-600" },
  TRANSFER_IN: { label: "Transfer in", sign: "+", icon: ArrowDownLeft, tone: "bg-emerald-50 text-emerald-600" },
  WITHDRAWAL: { label: "Withdrawal", sign: "-", icon: ArrowUpRight, tone: "bg-rose-50 text-rose-600" },
  TRANSFER_OUT: { label: "Transfer out", sign: "-", icon: ArrowUpRight, tone: "bg-rose-50 text-rose-600" },
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

  const {
    page,
    pageCount,
    pageItems: pageTransactions,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = usePagination(sorted, PAGE_SIZE);

  // usePagination only exposes step-by-step goToPrevious/goToNext (by
  // design — see its docstring), so a direct page-number jump is built on
  // top of those two public functions rather than by modifying the hook.
  // Each call queues a functional setState update, and React batches all
  // of them from a single click handler into one re-render.
  function goToPage(target: number) {
    const diff = target - page;
    for (let i = 0; i < diff; i++) goToNext();
    for (let i = 0; i < -diff; i++) goToPrevious();
  }

  return (
    <div className="animate-card-enter card-interactive rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Transaction history</h2>
        {/* Decorative only — no filtering logic exists yet, this just
            matches the reference design's visual density. */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Filter transactions (coming soon)"
          disabled
        >
          <Filter className="size-4" aria-hidden="true" />
        </Button>
      </div>

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
                <TableRow className="border-b-0">
                  <TableHead className="rounded-l-lg bg-gradient-to-r from-brand-100 to-brand-50 text-brand-900">
                    Type
                  </TableHead>
                  <TableHead className="bg-gradient-to-r from-brand-100 to-brand-50 text-brand-900">
                    Description
                  </TableHead>
                  <TableHead className="bg-gradient-to-r from-brand-100 to-brand-50 text-brand-900">
                    When
                  </TableHead>
                  <TableHead className="bg-gradient-to-r from-brand-100 to-brand-50 text-right text-brand-900">
                    Amount
                  </TableHead>
                  <TableHead className="rounded-r-lg bg-gradient-to-r from-brand-100 to-brand-50 text-right text-brand-900">
                    Balance after
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageTransactions.map((tx) => {
                  const meta = TYPE_META[tx.type];
                  const Icon = meta.icon;
                  return (
                    <TableRow key={tx.id} className="transition-colors hover:bg-brand-50/60">
                      <TableCell>
                        <span className="inline-flex items-center gap-2 font-semibold">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                          >
                            <Icon className="size-3.5" aria-hidden="true" />
                          </span>
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.description || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-brand-400" aria-hidden="true" />
                          {formatWhen(tx.createdAt)}
                        </span>
                      </TableCell>
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
            {pageTransactions.map((tx) => {
              const meta = TYPE_META[tx.type];
              const Icon = meta.icon;
              return (
                <div
                  key={tx.id}
                  className="card-interactive rounded-xl border p-3 transition-colors hover:bg-brand-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
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
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 text-brand-400" aria-hidden="true" />
                      {formatWhen(tx.createdAt)}
                    </span>
                    <span>Balance after {formatCurrency(tx.balanceAfter, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <TransactionPagination
            page={page}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            totalItems={sorted.length}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onGoToPage={goToPage}
          />
        </>
      )}
    </div>
  );
}
