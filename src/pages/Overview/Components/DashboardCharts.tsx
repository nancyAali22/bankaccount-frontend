import { useMemo } from "react";
import { AlertCircle, PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import { sumByCurrency } from "@/lib/sumByCurrency";
import { sortCurrencyEntries } from "@/lib/sortCurrencyEntries";
import type { Account } from "@/types/account";

interface DashboardChartsProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

// Same brand-derived palette used everywhere else (index.css --chart-1..5),
// referenced by CSS variable so the charts can never drift from the rest
// of the color system or fall back to the charting library's defaults.
const CURRENCY_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const STATUS_COLORS: Record<Account["status"], string> = {
  ACTIVE: "var(--color-chart-5)", // soft emerald
  FROZEN: "var(--color-chart-3)", // amber
  CLOSED: "var(--color-muted-foreground)",
};

const TYPE_COLORS: Record<Account["accountType"], string> = {
  SAVINGS: "var(--color-chart-1)", // teal
  CURRENT: "var(--color-chart-2)", // indigo/sky
};

function ChartCard({
  title,
  isEmpty,
  children,
}: {
  title: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="card-interactive animate-card-enter rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <PieChartIcon className="size-6" aria-hidden="true" />
            <p className="text-sm">Nothing to chart yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface LegendRow {
  label: string;
  value: string;
  color: string;
}

function ChartLegend({ rows }: { rows: LegendRow[] }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex min-w-0 items-center gap-2 truncate text-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />
            <span className="truncate">{row.label}</span>
          </span>
          <span className="shrink-0 font-medium tabular-nums text-foreground">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Real-data dashboard analytics, below the two list cards. Every number
 * here is derived from the accounts list already fetched by the Overview
 * page (no extra API requests, no invented time-series). Deliberately
 * does NOT include a "cash flow over time" chart: that would require
 * summing DEPOSIT/WITHDRAWAL amounts across accounts that can be opened
 * in different currencies, and adding raw amounts across currencies
 * without a real exchange rate would produce a misleading number — the
 * same reason the KPI cards above keep each currency's total separate.
 */
export function DashboardCharts({ accounts, isLoading, isError }: DashboardChartsProps) {
  const holdingsByCurrency = useMemo(() => {
    if (!accounts) return [];
    return sortCurrencyEntries(sumByCurrency(accounts.map((a) => ({ amount: a.balance, currency: a.currency }))));
  }, [accounts]);

  const statusCounts = useMemo(() => {
    if (!accounts) return [] as { status: Account["status"]; count: number }[];
    const counts = new Map<Account["status"], number>();
    for (const account of accounts) counts.set(account.status, (counts.get(account.status) ?? 0) + 1);
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [accounts]);

  const typeCounts = useMemo(() => {
    if (!accounts) return [] as { type: Account["accountType"]; count: number }[];
    const counts = new Map<Account["accountType"], number>();
    for (const account of accounts) counts.set(account.accountType, (counts.get(account.accountType) ?? 0) + 1);
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
  }, [accounts]);

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>Couldn't load chart data</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mx-auto mt-6 size-40 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const totalAccounts = accounts?.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard title="Holdings by currency" isEmpty={holdingsByCurrency.length === 0}>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={holdingsByCurrency.map(([currency, total]) => ({ name: currency, value: total }))}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {holdingsByCurrency.map(([currency], index) => (
                  <Cell key={currency} fill={CURRENCY_COLORS[index % CURRENCY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatCurrency(Number(value ?? 0), String(name)), String(name)]}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "var(--color-border)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          rows={holdingsByCurrency.map(([currency, total], index) => ({
            label: currency,
            value: formatCurrency(total, currency),
            color: CURRENCY_COLORS[index % CURRENCY_COLORS.length],
          }))}
        />
      </ChartCard>

      <ChartCard title="Account status" isEmpty={totalAccounts === 0}>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts.map(({ status, count }) => ({ name: status, value: count }))}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {statusCounts.map(({ status }) => (
                  <Cell key={status} fill={STATUS_COLORS[status]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          rows={statusCounts.map(({ status, count }) => ({
            label: status.charAt(0) + status.slice(1).toLowerCase(),
            value: `${count} (${totalAccounts > 0 ? Math.round((count / totalAccounts) * 100) : 0}%)`,
            color: STATUS_COLORS[status],
          }))}
        />
      </ChartCard>

      <ChartCard title="Accounts by type" isEmpty={totalAccounts === 0}>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeCounts.map(({ type, count }) => ({ name: type, value: count }))}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {typeCounts.map(({ type }) => (
                  <Cell key={type} fill={TYPE_COLORS[type]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          rows={typeCounts.map(({ type, count }) => ({
            label: type.charAt(0) + type.slice(1).toLowerCase(),
            value: `${count} (${totalAccounts > 0 ? Math.round((count / totalAccounts) * 100) : 0}%)`,
            color: TYPE_COLORS[type],
          }))}
        />
      </ChartCard>
    </div>
  );
}
