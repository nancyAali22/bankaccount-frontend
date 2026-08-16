import { useMemo, useState } from "react";

/**
 * Client-side pagination over an already-fetched array. This is purely a
 * display concern — it does not fetch anything and does not assume the
 * backend supports pagination. Page state resets to 1 whenever the
 * underlying item count changes (e.g. a new account was opened), so a
 * stale "page 3" can't point at an empty page.
 *
 * `resetKey` is optional and only needed when the caller wants page 1
 * forced on some other change too — e.g. Customers passes its search
 * string so a new search always starts back at page 1, even in the edge
 * case where the new result set happens to have the same page count as
 * the old one (so the length-based clamp below wouldn't catch it).
 * Existing callers that don't pass it are unaffected.
 */
export function usePagination<T>(items: T[], pageSize: number, resetKey?: unknown) {
  const [page, setPage] = useState(1);

  // React's documented pattern for "reset state when a prop changes":
  // adjust state directly during render (not inside an effect) by
  // comparing against the previous resetKey. This avoids the extra
  // render + flash that an effect-based reset would cause, and avoids
  // calling setState synchronously inside an effect body.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

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