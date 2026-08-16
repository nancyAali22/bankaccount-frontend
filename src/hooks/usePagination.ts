import { useMemo, useState } from "react";

/**
 * Client-side pagination over an already-fetched array. This is purely a
 * display concern — it does not fetch anything and does not assume the
 * backend supports pagination. Page state resets to 1 whenever the
 * underlying item count changes (e.g. a new account was opened), so a
 * stale "page 3" can't point at an empty page.
 */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    pageCount,
    pageItems,
    hasPrevious: safePage > 1,
    hasNext: safePage < pageCount,
    goToPrevious: () => setPage((p) => Math.max(1, p - 1)),
    goToNext: () => setPage((p) => Math.min(pageCount, p + 1)),
  };
}
