import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useAccounts } from "@/hooks/useAccounts";
import { usePagination } from "@/hooks/usePagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardPagination } from "@/pages/Overview/Components/CardPagination";
import { CustomerFormDialog } from "./components/CustomerFormDialog";
import { DeleteCustomerDialog } from "./components/DeleteCustomerDialog";
import { CustomersTable } from "./components/CustomersTable";
import type { Customer } from "@/types/customer";
import type { Account } from "@/types/account";

const PAGE_SIZE = 10;

const CustomersPage = () => {
  const { data: customers, isLoading, isError, refetch } = useCustomers();
  const { data: accounts } = useAccounts();
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [formCustomer, setFormCustomer] = useState<Customer | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(() => searchParams.get("action") === "add");
  const [deleteTarget, setDeleteTarget] = useState<Customer | undefined>(undefined);

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
    const sorted = [...customers].sort((a, b) => a.id - b.id);

    const query = search.trim().toLowerCase();
    if (!query) return sorted;

    return sorted.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phoneNumber.toLowerCase().includes(query) ||
        customer.nationalId.includes(query)
      );
    });
  }, [customers, search]);

  // 10 customers per page, applied AFTER search filtering (pagination reads
  // from filteredCustomers, never from the raw `customers` list) — a search
  // that narrows the list to 3 records shows "Page 1 of 1" for those 3, not
  // for the original unfiltered count. `search` is passed as resetKey so a
  // new search always lands back on page 1.
  const {
    page,
    pageCount,
    pageItems: paginatedCustomers,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = usePagination(filteredCustomers, PAGE_SIZE, search);

  function openAddDialog() {
    setFormCustomer(undefined);
    setIsFormOpen(true);
  }

  function openEditDialog(customer: Customer) {
    setFormCustomer(customer);
    setIsFormOpen(true);
  }

  return (
    <div className="mx-auto w-full space-y-6 p-6 2xl:max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading records…"
              : `${filteredCustomers.length} record${filteredCustomers.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <Button onClick={openAddDialog} className="bg-gradient-brand text-white hover:opacity-90">
          <Plus /> Add customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, email, phone or KYC id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isLoading || isError}
          className="max-w-md pl-9"
        />
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
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

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
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

      {!isLoading && !isError && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium">{search ? "No customers found" : "No customers yet"}</p>
          <p className="text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Add your first customer to get started."}
          </p>
          {!search && (
            <Button onClick={openAddDialog} className="mt-2 bg-gradient-brand text-white hover:opacity-90">
              <Plus /> Add customer
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && filteredCustomers.length > 0 && (
        <div>
          <CustomersTable
            customers={paginatedCustomers}
            accountsByCustomer={accountsByCustomer}
            onEdit={openEditDialog}
            onDelete={setDeleteTarget}
          />
          <CardPagination
            page={page}
            pageCount={pageCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </div>
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