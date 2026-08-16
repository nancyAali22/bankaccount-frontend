import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TransactionPaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}

/**
 * Builds a compact page-number list with ellipses, e.g. for 12 pages on
 * page 4: [1, "…", 3, 4, 5, "…", 12]. Always keeps the first page, the
 * last page, and a small window around the current page visible so the
 * control never grows unbounded on large datasets.
 */
function buildPageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const withEllipses: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withEllipses.push("ellipsis");
    withEllipses.push(p);
  });
  return withEllipses;
}

/**
 * Numbered pagination control for the transaction history table. Purely
 * presentational — all the actual pagination *logic* (slicing the array,
 * clamping the current page, computing hasPrevious/hasNext) lives in the
 * existing usePagination hook; this component only turns that state into
 * clickable page numbers plus the "Showing X to Y of Z" summary text.
 */
export function TransactionPagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onGoToPage,
}: TransactionPaginationProps) {
  if (totalItems === 0) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);
  const pageWindow = buildPageWindow(page, pageCount);

  return (
    <nav
      aria-label="Transaction history pages"
      className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {rangeStart} to {rangeEnd} of {totalItems} transactions
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </Button>

          {pageWindow.map((entry, i) =>
            entry === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-xs text-muted-foreground select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={entry}
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => onGoToPage(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  entry === page &&
                    "border-transparent bg-brand-600 text-white hover:bg-brand-600 hover:text-white",
                )}
              >
                {entry}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </nav>
  );
}
