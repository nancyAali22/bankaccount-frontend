/**
 * Matches the JSON shape produced by the backend's GlobalExceptionHandler
 * (com.nancyahmed.bankaccount.infrastructure.exception.GlobalExceptionHandler).
 *
 * Every error response the API returns — 400/404/409/422/500 — follows this
 * exact shape, so the whole frontend can rely on a single type instead of
 * re-guessing the error format in every component.
 */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  /** Present only on 400 validation errors (MethodArgumentNotValidException). */
  fieldErrors?: Record<string, string>;
}

/** Type guard: narrows an unknown axios error payload into ApiError. */
export function isApiError(payload: unknown): payload is ApiError {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.status === "number" &&
    typeof candidate.error === "string" &&
    typeof candidate.message === "string"
  );
}
