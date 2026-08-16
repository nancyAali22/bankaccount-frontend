import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Globe,
  Landmark,
  ShieldCheck,
  User,
} from "lucide-react";

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
      className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 font-mono text-xs text-white transition-colors hover:bg-white/25"
    >
      {accountNumber}
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
    </button>
  );
}

/**
 * Faint decorative wave + sparkle pattern behind the balance card. Pure
 * SVG, aria-hidden, zero effect on layout or the numbers/text sitting on
 * top of it — it only adds texture to the gradient background.
 */
function BalanceCardPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      viewBox="0 0 600 300"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 180 C 100 220, 200 140, 300 170 S 500 220, 600 160 L600 300 L0 300 Z"
        fill="white"
      />
      <path
        d="M0 220 C 120 250, 220 190, 320 210 S 500 260, 600 210 L600 300 L0 300 Z"
        fill="white"
        opacity="0.6"
      />
      <circle cx="520" cy="40" r="2" fill="white" />
      <circle cx="480" cy="90" r="1.5" fill="white" />
      <circle cx="550" cy="120" r="1.5" fill="white" />
      <circle cx="440" cy="50" r="1" fill="white" />
    </svg>
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
    <div className="mx-auto w-full space-y-6 p-4 sm:p-6 2xl:max-w-[1600px]">
      {account && (
        <Link
          to={`/customers/${account.customerId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            <div className="animate-card-enter relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-lg lg:col-span-2 lg:p-8">
              <BalanceCardPattern />

              {/* Decorative bank icon, right side */}
              <div
                className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/25 sm:flex"
                style={{ width: 140, height: 140 }}
                aria-hidden="true"
              >
                <Landmark className="size-14 text-white/40" />
              </div>

              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  Available balance
                </p>
                <p className="mt-2 text-5xl font-bold tabular-nums">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="mt-4">
                  <CopyAccountNumber accountNumber={account.accountNumber} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="bg-brand-500 text-white hover:bg-brand-400"
                    onClick={() => setDialogMode("deposit")}
                  >
                    <ArrowDownLeft /> Deposit
                  </Button>
                  <Button
                    className="bg-white text-brand-900 hover:bg-white/90"
                    onClick={() => setDialogMode("withdraw")}
                  >
                    <ArrowUpRight /> Withdraw
                  </Button>
                </div>
              </div>
            </div>

            {/* Account info */}
            <div
              className="animate-card-enter card-interactive rounded-2xl border bg-card p-6 shadow-sm"
              style={{ animationDelay: "60ms" }}
            >
              <h2 className="mb-4 text-base font-semibold tracking-tight">Account info</h2>
              <dl className="space-y-3.5 text-sm">
                <Row
                  icon={User}
                  label="Holder"
                  value={holder ? `${holder.firstName} ${holder.lastName}` : "—"}
                />
                <Row
                  icon={CreditCard}
                  label="Type"
                  value={<Badge variant="secondary">{account.accountType}</Badge>}
                />
                <Row
                  icon={ShieldCheck}
                  label="Status"
                  value={<Badge className={STATUS_STYLES[account.status]}>{account.status}</Badge>}
                />
                <Row icon={Globe} label="Currency" value={account.currency} />
                <Row
                  icon={Calendar}
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

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2.5 text-muted-foreground">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
