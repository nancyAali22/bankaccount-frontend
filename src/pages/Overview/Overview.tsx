import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Users, Wallet } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/formatCurrency";
import { sumByCurrency } from "@/lib/sumByCurrency";
import { AccountsByBalance } from "./Components/AccountsByBalance";
import { KpiCard } from "./Components/KpiCard";

import WelcomeSection from "./Components/WelcomeSection";
import { RecentTransactions } from "../transactions/components/RecentTransaction";
import { useDashboardTransactions } from "@/hooks/useDashboardTransactions";


/** "This period" = the trailing 30 days, measured from each transaction's createdAt. */
const PERIOD_DAYS = 30;

function isWithinPeriod(isoDate: string): boolean {
  const cutoff = Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return new Date(isoDate).getTime() >= cutoff;
}

function CurrencyAmounts({ totals }: { totals: [string, number][] }) {
  if (totals.length === 0) return <>{formatCurrency(0)}</>;
  return (
    <div className="space-y-0.5">
      {totals.map(([currency, total]) => (
        <div key={currency}>{formatCurrency(total, currency)}</div>
      ))}
    </div>
  );
}

const Overview = () => {
  const { data: customers, isLoading: customersLoading, isError: customersError } = useCustomers();
  const { data: accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts();
  const {
    transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useDashboardTransactions(accounts);

  // Sum balances grouped by currency. Accounts can be opened in different
  // currencies, so a single raw sum across all of them would be a wrong
  // (and misleading) financial figure. We never invent an exchange rate,
  // so each currency gets its own total instead of a fabricated combined one.
  const totalsByCurrency = useMemo(() => {
    if (!accounts) return [];
    return sumByCurrency(accounts.map((a) => ({ amount: a.balance, currency: a.currency })));
  }, [accounts]);

  const periodTransactions = useMemo(
    () => transactions.filter((t) => isWithinPeriod(t.createdAt)),
    [transactions],
  );

  // Deposits/withdrawals cards intentionally count only DEPOSIT/WITHDRAWAL
  // transaction types, not TRANSFER_IN/TRANSFER_OUT — a transfer between two
  // of the bank's own accounts is not new money entering or leaving the
  // bank, so folding it into these totals would overstate both cards.
  const depositsByCurrency = useMemo(
    () =>
      sumByCurrency(
        periodTransactions.filter((t) => t.type === "DEPOSIT").map((t) => ({ amount: t.amount, currency: t.currency })),
      ),
    [periodTransactions],
  );
  const withdrawalsByCurrency = useMemo(
    () =>
      sumByCurrency(
        periodTransactions
          .filter((t) => t.type === "WITHDRAWAL")
          .map((t) => ({ amount: t.amount, currency: t.currency })),
      ),
    [periodTransactions],
  );

  const accountsCount = accounts?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <WelcomeSection />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Customers"
          icon={Users}
          isLoading={customersLoading}
          isError={customersError}
          hint="Registered records"
        >
          {customers?.length ?? 0}
        </KpiCard>

        <KpiCard
          title="Total holdings"
          icon={Wallet}
          isLoading={accountsLoading}
          isError={accountsError}
          hint={accountsCount > 0 ? `${accountsCount} account${accountsCount === 1 ? "" : "s"}` : undefined}
        >
          <CurrencyAmounts totals={totalsByCurrency} />
        </KpiCard>

        <KpiCard
          title="Deposits"
          icon={ArrowDownLeft}
          isLoading={accountsLoading || transactionsLoading}
          isError={accountsError || transactionsError}
          hint="Last 30 days"
        >
          <CurrencyAmounts totals={depositsByCurrency} />
        </KpiCard>

        <KpiCard
          title="Withdrawals"
          icon={ArrowUpRight}
          isLoading={accountsLoading || transactionsLoading}
          isError={accountsError || transactionsError}
          hint="Last 30 days"
        >
          <CurrencyAmounts totals={withdrawalsByCurrency} />
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentTransactions
          transactions={transactions}
          isLoading={transactionsLoading}
          isError={transactionsError}
        />
        <AccountsByBalance accounts={accounts} isLoading={accountsLoading} isError={accountsError} />
      </div>
    </div>
  );
};

export default Overview;