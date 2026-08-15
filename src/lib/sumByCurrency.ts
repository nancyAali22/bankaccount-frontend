export function sumByCurrency(items: { amount: number; currency: string }[]): [string, number][] {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.amount);
  }
  return Array.from(totals.entries());
}