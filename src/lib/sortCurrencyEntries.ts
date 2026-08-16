/**
 * Wherever multiple currency totals are shown side by side (Total holdings,
 * Deposits, Withdrawals, the currency chart, …) they must always appear in
 * the same, predictable order instead of whatever order they happened to
 * be inserted into a Map — otherwise the same currency can jump position
 * from one card to the next, which reads as visual noise.
 *
 * Priority: USD, then SAR, then GBP, then EGP, then any other currency
 * code alphabetically. This is a single reusable helper so that priority
 * list only has to be maintained in one place.
 */
const CURRENCY_PRIORITY = ["USD", "SAR", "GBP", "EGP"] as const;

function priorityRank(currency: string): number {
  const index = CURRENCY_PRIORITY.indexOf(currency.toUpperCase() as (typeof CURRENCY_PRIORITY)[number]);
  return index === -1 ? CURRENCY_PRIORITY.length : index;
}

export function sortCurrencyEntries<T extends readonly [string, ...unknown[]]>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const rankDiff = priorityRank(a[0]) - priorityRank(b[0]);
    if (rankDiff !== 0) return rankDiff;
    return a[0].localeCompare(b[0]);
  });
}
