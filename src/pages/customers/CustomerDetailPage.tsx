import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CreditCard,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Plus,
  Landmark,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/hooks/useCustomers";
import { useAccountsByCustomer } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/formatCurrency";
import { sumByCurrency } from "@/lib/sumByCurrency";
import { getInitials } from "@/helpers/getInitials";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomerFormDialog } from "./components/CustomerFormDialog";
import { OpenAccountDialog } from "./components/OpenAccountDialog";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  FROZEN: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  CLOSED: "bg-muted text-muted-foreground hover:bg-muted",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);
  const isValidId = Number.isFinite(customerId) && customerId > 0;

  const { data: customer, isLoading, isError, refetch } = useCustomer(customerId);
  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccountsByCustomer(customerId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOpenAccountOpen, setIsOpenAccountOpen] = useState(false);

  const totalsByCurrency = accounts
    ? sumByCurrency(accounts.map((a) => ({ amount: a.balance, currency: a.currency })))
    : [];

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">Invalid customer id.</p>
        <Link to="/customers" className="text-sm underline">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to customers
      </Link>

      {isLoading && (
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="font-medium">Couldn't load this customer</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && customer && (
        <>
          {/* Header */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-teal-800 p-6 text-white shadow-md lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 border-2 border-white/20">
                  <AvatarFallback className="bg-white/10 text-lg text-white">
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <p className="mt-0.5 text-sm text-white/70">
                    Customer #{customer.id} · {accounts?.length ?? 0} account
                    {accounts?.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-white/60">Total holdings</p>
                  <div className="text-xl font-semibold">
                    {totalsByCurrency.length === 0 ? (
                      formatCurrency(0)
                    ) : (
                      totalsByCurrency.map(([currency, total]) => (
                        <div key={currency}>{formatCurrency(total, currency)}</div>
                      ))
                    )}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
                  <Pencil /> Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={Mail} label="Email" value={customer.email} />
            <InfoItem icon={Phone} label="Phone" value={customer.phoneNumber} />
            <InfoItem icon={MapPin} label="Address" value={customer.address || "—"} />
            <InfoItem
              icon={Calendar}
              label="Date of birth"
              value={customer.dob ? formatDate(customer.dob) : "—"}
            />
            <InfoItem icon={IdCard} label="National ID" value={customer.nationalId} />
            <InfoItem icon={Calendar} label="Customer since" value={formatDate(customer.createdAt)} />
          </div>

          {/* Linked accounts */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Linked accounts</h2>
              <Button size="sm" onClick={() => setIsOpenAccountOpen(true)}>
                <Plus /> Open account
              </Button>
            </div>

            {accountsLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            )}

            {accountsError && !accountsLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <span>Couldn't load accounts</span>
              </div>
            )}

            {!accountsLoading && !accountsError && (accounts?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <Landmark className="size-6" aria-hidden="true" />
                <p className="text-sm">No accounts yet</p>
              </div>
            )}

            {!accountsLoading && !accountsError && accounts && accounts.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {accounts.map((account) => (
                  <Link
                    key={account.id}
                    to={`/accounts/${account.id}`}
                    className="group rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-xs text-muted-foreground">{account.accountNumber}</p>
                      <Badge className={STATUS_STYLES[account.status]}>{account.status}</Badge>
                    </div>
                    <p className="mt-2 text-xl font-semibold tabular-nums">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary">{account.accountType}</Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                        Open account <CreditCard className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <CustomerFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} customer={customer} />
          <OpenAccountDialog
            open={isOpenAccountOpen}
            onOpenChange={setIsOpenAccountOpen}
            customerId={customer.id}
            customerName={`${customer.firstName} ${customer.lastName}`}
          />
        </>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
