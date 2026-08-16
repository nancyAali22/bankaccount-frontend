import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowDownLeft, ArrowLeft, ArrowUpRight, Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useAccountTransactions } from "@/hooks/useAccounts";
import { useCustomer } from "@/hooks/useCustomers";
import { formatCurrency } from "@/lib/formatCurrency";
import { TransactionDialog } from "./components/TransactionDialog";
import { TransactionHistoryTable } from "./components/TransactionHistoryTable";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  FROZEN: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  CLOSED: "bg-muted text-muted-foreground hover:bg-muted",
};

function CopyAccountNumber({ accountNumber }: { accountNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Account number copied" : "Copy account number"}
      className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-white/90 transition-colors hover:bg-white/20"
    >
      {accountNumber}
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
    </button>
  );
}

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const accountId = Number(params.id);
  const isValidId = Number.isFinite(accountId) && accountId > 0;

  const { data: account, isLoading, isError, refetch } = useAccount(accountId);
  const { data: transactions, isLoading: txLoading, isError: txError } = useAccountTransactions(accountId);
  const { data: holder } = useCustomer(account?.customerId ?? -1);

  const [dialogMode, setDialogMode] = useState<"deposit" | "withdraw" | null>(null);

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">Invalid account id.</p>
        <Link to="/customers" className="text-sm underline">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {account && (
        <Link
          to={`/customers/${account.customerId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {holder ? `${holder.firstName} ${holder.lastName}` : "customer"}
        </Link>
      )}

      {isLoading && (
        <div className="rounded-2xl border bg-card p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-10 w-56" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="font-medium">Couldn't load this account</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && account && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Balance card */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-teal-800 p-6 text-white shadow-md lg:col-span-2 lg:p-8">
              <p className="text-xs uppercase tracking-wide text-white/70">Available balance</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <div className="mt-4">
                <CopyAccountNumber accountNumber={account.accountNumber} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setDialogMode("deposit")}>
                  <ArrowDownLeft /> Deposit
                </Button>
                <Button
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setDialogMode("withdraw")}
                >
                  <ArrowUpRight /> Withdraw
                </Button>
              </div>
            </div>

            {/* Account info */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-sm font-medium">Account info</h2>
              <dl className="space-y-3 text-sm">
                <Row label="Holder" value={holder ? `${holder.firstName} ${holder.lastName}` : "—"} />
                <Row label="Type" value={<Badge variant="secondary">{account.accountType}</Badge>} />
                <Row
                  label="Status"
                  value={<Badge className={STATUS_STYLES[account.status]}>{account.status}</Badge>}
                />
                <Row label="Currency" value={account.currency} />
                <Row
                  label="Opened"
                  value={new Date(account.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </dl>
            </div>
          </div>

          <TransactionHistoryTable
            transactions={transactions}
            isLoading={txLoading}
            isError={txError}
            currency={account.currency}
          />

          {dialogMode && (
            <TransactionDialog
              open={dialogMode !== null}
              onOpenChange={(open) => !open && setDialogMode(null)}
              mode={dialogMode}
              accountId={account.id}
              accountNumber={account.accountNumber}
              availableBalance={account.balance}
              currency={account.currency}
            />
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
