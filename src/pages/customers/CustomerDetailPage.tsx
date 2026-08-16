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
  Wallet,
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

// Soft, colored icon-circle treatment per contact-info field, matching the
// reference design (each data type gets its own hue instead of one flat
// neutral gray). Purely presentational — no logic depends on this map.
const INFO_ICON_STYLES: Record<string, string> = {
  email: "bg-sky-100 text-sky-600",
  phone: "bg-emerald-100 text-emerald-600",
  address: "bg-violet-100 text-violet-600",
  dob: "bg-amber-100 text-amber-600",
  nationalId: "bg-indigo-100 text-indigo-600",
  since: "bg-rose-100 text-rose-600",
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
    <div className="relative min-h-full w-full overflow-hidden bg-white">
      {/* Faint decorative texture in the corners, per the reference design —
          purely visual, sits behind all content. */}
      <div
        className="bg-dot-pattern pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-none space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Top bar: back link on the left, primary actions on the right.
            Buttons here call the exact same handlers as before — only their
            position moved out of the gradient card and into this bar. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/customers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to customers
          </Link>

          {!isLoading && !isError && customer && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpenAccountOpen(true)}>
                <Plus /> Open account
              </Button>
              <Button
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="bg-gradient-brand text-white hover:opacity-90"
              >
                <Pencil /> Edit customer
              </Button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="rounded-3xl border bg-card p-6">
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
          <div className="flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="font-medium">Couldn't load this customer</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && customer && (
          <>
            {/* Header — navy → teal gradient card */}
            <div className="animate-card-enter relative overflow-hidden rounded-3xl bg-gradient-brand p-6 text-white shadow-lg lg:p-8">
              {/* Decorative wavy pattern, behind content, low opacity */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
                viewBox="0 0 800 300"
                fill="none"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid slice"
              >
                <path
                  d="M0 220 Q 100 160 200 220 T 400 220 T 600 220 T 800 220"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M0 260 Q 100 200 200 260 T 400 260 T 600 260 T 800 260"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M0 100 Q 100 40 200 100 T 400 100 T 600 100 T 800 100"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>

              {/* Large decorative wallet icon, far right */}
              <Wallet
                className="pointer-events-none absolute -right-4 top-1/2 hidden size-32 -translate-y-1/2 text-white/10 sm:block"
                aria-hidden="true"
              />

              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 border-2 border-white/25">
                    <AvatarFallback className="bg-white/10 text-lg font-semibold text-white">
                      {getInitials(customer.firstName, customer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                      {customer.firstName} {customer.lastName}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                      Customer #{customer.id} · {accounts?.length ?? 0} linked account
                      {accounts?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-medium tracking-wide text-white/60 uppercase">
                      Total holdings
                    </p>
                    <div className="mt-1.5 flex flex-col items-end gap-1.5">
                      {totalsByCurrency.length === 0 ? (
                        <span className="text-xl font-bold tabular-nums">{formatCurrency(0)}</span>
                      ) : (
                        totalsByCurrency.map(([currency, total]) => (
                          <span
                            key={currency}
                            className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1 pr-3 pl-1 text-sm font-semibold tabular-nums"
                          >
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold tracking-wide">
                              {currency}
                            </span>
                            {formatCurrency(total, currency)}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="hidden h-12 w-px bg-white/15 sm:block" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="animate-card-enter rounded-3xl border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={customer.email}
                  iconClassName={INFO_ICON_STYLES.email}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={customer.phoneNumber}
                  iconClassName={INFO_ICON_STYLES.phone}
                />
                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={customer.address || "—"}
                  iconClassName={INFO_ICON_STYLES.address}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date of birth"
                  value={customer.dob ? formatDate(customer.dob) : "—"}
                  iconClassName={INFO_ICON_STYLES.dob}
                />
                <InfoItem
                  icon={IdCard}
                  label="National ID"
                  value={customer.nationalId}
                  iconClassName={INFO_ICON_STYLES.nationalId}
                />
                <InfoItem
                  icon={Calendar}
                  label="Customer since"
                  value={formatDate(customer.createdAt)}
                  iconClassName={INFO_ICON_STYLES.since}
                />
              </div>
            </div>

            {/* Linked accounts */}
            <div className="animate-card-enter rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Linked accounts</h2>
                               <Button 
                  size="sm"
                  onClick={() => setIsOpenAccountOpen(true)}
                  className="bg-gradient-brand text-white hover:opacity-90"
                >
                  <Plus /> Open account
                </Button>
              </div>

              {accountsLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
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
                      className="card-interactive group rounded-2xl border p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <Landmark className="size-4" aria-hidden="true" />
                          </span>
                          <p className="font-mono text-xs text-muted-foreground">
                            {account.accountNumber}
                          </p>
                        </div>
                        <Badge className={STATUS_STYLES[account.status]}>{account.status}</Badge>
                      </div>
                      <p className="mt-3 text-xl font-bold tabular-nums">
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
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        <Icon className="size-4.5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}