import { Eye, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { sumByCurrency } from "@/lib/sumByCurrency";
import { getInitials } from "@/helpers/getInitials";
import type { Account } from "@/types/account";
import type { Customer } from "@/types/customer";
import { Table, TableBody, TableHead, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface CustomersTableProps {
  customers: Customer[];
  accountsByCustomer: Map<number, Account[]>;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** One customer's total balance, one line per currency — see sumByCurrency for why this never collapses to a single number. */
function TotalBalance({ accounts }: { accounts: Account[] }) {
  const totals = sumByCurrency(accounts.map((a) => ({ amount: a.balance, currency: a.currency })));
  if (totals.length === 0) return <span className="text-muted-foreground">—</span>;
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
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={`View ${customer.firstName} ${customer.lastName}`}
        title="Customer detail page coming soon"
      >
        <Eye className="size-4" />
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

export function CustomersTable({ customers, accountsByCustomer, onEdit, onDelete }: CustomersTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
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
            {customers.map((customer) => {
              const accounts = accountsByCustomer.get(customer.id) ?? [];
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
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
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {accounts.map((account) => (
                          <Badge key={account.id} variant="secondary">
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
        {customers.map((customer) => {
          const accounts = accountsByCustomer.get(customer.id) ?? [];
          return (
            <div key={customer.id} className="rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">Customer #{customer.id}</div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="truncate text-muted-foreground">{customer.email}</div>
                <div className="text-muted-foreground">{customer.phoneNumber}</div>
                {accounts.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {accounts.map((account) => (
                      <Badge key={account.id} variant="secondary">
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
              <div className="mt-3 border-t pt-2">
                <RowActions customer={customer} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}