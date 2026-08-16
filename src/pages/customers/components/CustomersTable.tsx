import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { sumByCurrency } from "@/lib/sumByCurrency";
import { sortCurrencyEntries } from "@/lib/sortCurrencyEntries";
import { getInitials } from "@/helpers/getInitials";
import type { Account, AccountType } from "@/types/account";
import type { Customer } from "@/types/customer";
import { Table, TableBody, TableHead, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface CustomersTableProps {
  customers: Customer[];
  accountsByCustomer: Map<number, Account[]>;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  /** Stagger offset (ms) applied to each row's entrance animation, e.g. index * 40. */
  animationDelayMs?: (index: number) => number;
}

// Same brand-tinted, gradient icon-circle treatment established for the
// Overview KPI cards (see KpiCard.tsx's ACCENT_ICON_STYLES) — reused here
// instead of inventing a second style, so avatars, KPI icons and badges all
// read as one visual family. Deliberately a single shared style for every
// customer (not a per-person random color): calmer and more "enterprise"
// for a banking console than a rainbow of avatar colors.
const AVATAR_STYLE =
  "bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 dark:from-brand-500/15 dark:to-brand-500/5 dark:text-brand-400";

// Two harmonious, muted tints — reusing the same hue family already used
// elsewhere in the app (brand/teal for the "primary" product, sky for the
// secondary one — the same sky already used for the Customers KPI icon on
// Overview) instead of introducing new colors just for this page.
const ACCOUNT_TYPE_BADGE_STYLE: Record<AccountType, string> = {
  SAVINGS: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400",
  CURRENT: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * "—" for a customer with zero accounts. This is a real, honest state (not
 * a loading gap or a bug) — some customers genuinely haven't opened an
 * account yet — so it gets an accessible label instead of a bare glyph,
 * without inventing a fake "$0.00" that would misrepresent them as having
 * an account with a zero balance.
 */
function NoAccountsPlaceholder() {
  return (
    <span className="text-muted-foreground" title="No accounts yet">
      <span aria-hidden="true">—</span>
      <span className="sr-only">No accounts yet</span>
    </span>
  );
}

/** One customer's total balance, one line per currency, in a stable/predictable order — see sumByCurrency and sortCurrencyEntries for why. */
function TotalBalance({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) return <NoAccountsPlaceholder />;
  const totals = sortCurrencyEntries(
    sumByCurrency(accounts.map((a) => ({ amount: a.balance, currency: a.currency }))),
  );
  return (
    <div className="space-y-0.5">
      {totals.map(([currency, total]) => (
        <div key={currency}>{formatCurrency(total, currency)}</div>
      ))}
    </div>
  );
}

function RowActions({ customer, onEdit, onDelete }: { customer: Customer } & Pick<CustomersTableProps, "onEdit" | "onDelete">) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label={`View ${customer.firstName} ${customer.lastName}`} asChild>
        <Link to={`/customers/${customer.id}`}>
          <Eye className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${customer.firstName} ${customer.lastName}`}
        onClick={() => onEdit(customer)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${customer.firstName} ${customer.lastName}`}
        onClick={() => onDelete(customer)}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function CustomersTable({
  customers,
  accountsByCustomer,
  onEdit,
  onDelete,
  animationDelayMs = (index) => index * 40,
}: CustomersTableProps) {
  return (
    <>
     {/* Desktop table */}
      <div className="hidden animate-card-enter overflow-hidden rounded-xl border-2 border-brand-700 bg-card shadow-sm md:block">
        <Table>
          <TableHeader className="bg-gradient-brand text-brand-50 [&_tr]:border-brand-800">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Accounts</TableHead>
              <TableHead>Total balance</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => {
              const accounts = accountsByCustomer.get(customer.id) ?? [];
              return (
                <TableRow
                  key={customer.id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${animationDelayMs(index)}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={AVATAR_STYLE}>
                          {getInitials(customer.firstName, customer.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/customers/${customer.id}`} className="font-medium hover:underline">
                          {customer.firstName} {customer.lastName}
                        </Link>
                        <div className="text-xs text-muted-foreground">Customer #{customer.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.email}</div>
                    <div className="text-xs text-muted-foreground">{customer.phoneNumber}</div>
                  </TableCell>
                  <TableCell>
                    {accounts.length === 0 ? (
                      <NoAccountsPlaceholder />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {accounts.map((account) => (
                          <Badge key={account.id} className={ACCOUNT_TYPE_BADGE_STYLE[account.accountType]}>
                            {account.accountType}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    <TotalBalance accounts={accounts} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <RowActions customer={customer} onEdit={onEdit} onDelete={onDelete} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {customers.map((customer, index) => {
          const accounts = accountsByCustomer.get(customer.id) ?? [];
          return (
            <div
              key={customer.id}
              className="card-interactive animate-card-enter rounded-xl border border-border bg-card p-4 shadow-sm"
              style={{ animationDelay: `${animationDelayMs(index)}ms` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={AVATAR_STYLE}>
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link to={`/customers/${customer.id}`} className="block truncate font-medium hover:underline">
                    {customer.firstName} {customer.lastName}
                  </Link>
                  <div className="text-xs text-muted-foreground">Customer #{customer.id}</div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="truncate text-muted-foreground">{customer.email}</div>
                <div className="text-muted-foreground">{customer.phoneNumber}</div>
                {accounts.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {accounts.map((account) => (
                      <Badge key={account.id} className={ACCOUNT_TYPE_BADGE_STYLE[account.accountType]}>
                        {account.accountType}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="pt-1 font-medium tabular-nums">
                  <TotalBalance accounts={accounts} />
                </div>
                <div className="pt-1 text-xs text-muted-foreground">Joined {formatDate(customer.createdAt)}</div>
              </div>
              <div className="mt-3 border-t border-border pt-2">
                <RowActions customer={customer} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}