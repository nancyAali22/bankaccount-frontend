import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useAccounts } from "@/hooks/useAccounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFormDialog } from "./components/CustomerFormDialog";
import { DeleteCustomerDialog } from "./components/DeleteCustomerDialog";
import { CustomersTable } from "./components/CustomersTable";
import type { Customer } from "@/types/customer";
import type { Account } from "@/types/account";

const CustomersPage = () => {
  const { data: customers, isLoading, isError, refetch } = useCustomers();
  // Accounts are fetched once here (not per-customer) and grouped client-side
  // below — the backend only exposes GET /api/accounts (all accounts) and
  // GET /api/accounts?customerId= (one customer), so fetching all accounts
  // once and grouping in memory avoids firing one request per row in the
  // table, which is the N+1 pattern this project explicitly avoids.
  const { data: accounts } = useAccounts();
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [formCustomer, setFormCustomer] = useState<Customer | undefined>(undefined);
  // Supports Overview's "Add customer" button, which links to
  // /customers?action=add instead of duplicating this dialog on two pages.
  // Read once via a lazy initializer (not an effect) so the dialog opens on
  // the very first render instead of flashing closed-then-open, and so we
  // never call setState synchronously inside an effect body.
  const [isFormOpen, setIsFormOpen] = useState(() => searchParams.get("action") === "add");
  const [deleteTarget, setDeleteTarget] = useState<Customer | undefined>(undefined);

  // Strip `?action=add` from the URL once it has been consumed above, so
  // refreshing or sharing the link doesn't keep reopening the dialog. This
  // only touches router state (not a React state setter), so it's a
  // legitimate effect: synchronizing the URL with what we've already read.
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountsByCustomer = useMemo(() => {
    const map = new Map<number, Account[]>();
    for (const account of accounts ?? []) {
      const list = map.get(account.customerId) ?? [];
      list.push(account);
      map.set(account.customerId, list);
    }
    return map;
  }, [accounts]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phoneNumber.toLowerCase().includes(query) ||
        customer.nationalId.includes(query)
      );
    });
  }, [customers, search]);

  function openAddDialog() {
    setFormCustomer(undefined);
    setIsFormOpen(true);
  }

  function openEditDialog(customer: Customer) {
    setFormCustomer(customer);
    setIsFormOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading records…"
              : `${filteredCustomers.length} record${filteredCustomers.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus /> Add customer
        </Button>
      </div>

      {/* Search — client-side only: the backend's GET /api/customers has no
          search/filter query params, so filtering the already-fetched list
          in memory is the honest option instead of inventing a server-side
          search endpoint that doesn't exist. This is fine at the current
          scale; a growing customer base would be the trigger to ask for a
          real backend search endpoint instead of filtering thousands of
          records in the browser. */}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, email, phone or KYC id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isLoading || isError}
          className="pl-9"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="overflow-hidden rounded-xl border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="font-medium">Couldn't load customers</p>
          <p className="text-sm text-muted-foreground">
            Something went wrong while fetching the customer list. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            <RefreshCw /> Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium">{search ? "No customers found" : "No customers yet"}</p>
          <p className="text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Add your first customer to get started."}
          </p>
          {!search && (
            <Button onClick={openAddDialog} className="mt-2">
              <Plus /> Add customer
            </Button>
          )}
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && filteredCustomers.length > 0 && (
        <CustomersTable
          customers={filteredCustomers}
          accountsByCustomer={accountsByCustomer}
          onEdit={openEditDialog}
          onDelete={setDeleteTarget}
        />
      )}

      <CustomerFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} customer={formCustomer} />
      <DeleteCustomerDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        customer={deleteTarget}
      />
    </div>
  );
};

export default CustomersPage;