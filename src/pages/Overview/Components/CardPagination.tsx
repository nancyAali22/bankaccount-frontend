import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardPaginationProps {
  page: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Previous/Next control shared by "Accounts by balance" and "Recent
 * transactions". Real buttons (not clickable divs) so it works with
 * keyboard and screen readers, with a visually-hidden live region that
 * announces the page change.
 */
export function CardPagination({
  page,
  pageCount,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: CardPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3.5" aria-hidden="true" />
        Previous
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
        Page {page} of {pageCount}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
