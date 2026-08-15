import axios, { AxiosError } from "axios";
import { isApiError, type ApiError } from "@/types/apiError";
import { notify } from "@/lib/notify";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!baseURL && import.meta.env.DEV) {
  // Fails loudly in development instead of silently hitting a wrong host.
  console.error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and restart the dev server.",
  );
}

export const axiosInstance = axios.create({
  baseURL: baseURL ?? "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Centralized error handling. Every axios call in the app goes through here,
 * so no component/hook has to know about axios error shapes, HTTP status
 * codes, or backend error payloads on its own.
 *
 * Design decision: this interceptor rejects with a single, predictable
 * `ApiError` object (never the raw AxiosError) so callers can rely on
 * `error.message` and `error.fieldErrors` without type-narrowing gymnastics.
 *
 * It only shows a toast automatically for *infrastructure* failures
 * (network down, backend crashed / 5xx) — those aren't the calling
 * component's fault and there's nothing contextual to say about them.
 * 4xx errors (validation, insufficient funds, conflicts, not found) are
 * NOT auto-toasted here: they're business/user errors that the calling
 * mutation's onError should present contextually (e.g. inline under a form
 * field, or a specific toast like "Insufficient funds"). Auto-toasting them
 * here would either duplicate that message or show a message with no
 * context of what the user was doing.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    // Network failure, timeout, CORS block, backend not running, etc.
    if (!error.response) {
      if (import.meta.env.DEV) {
        console.error("Network error calling API:", error.message);
      }
      const networkError: ApiError = {
        status: 0,
        error: "Network Error",
        message: "Couldn't reach the server. Check your connection and try again.",
      };
      notify.error(networkError.message);
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    const normalized: ApiError = isApiError(data)
      ? data
      : {
          status,
          error: error.response.statusText || "Error",
          // Backend internals (stack traces, driver messages) never reach the UI.
          message: "Something went wrong. Please try again.",
        };

    if (import.meta.env.DEV) {
      console.error(`API error ${status}:`, data);
    }

    if (status >= 500) {
      notify.error("The server ran into a problem. Please try again in a moment.");
    }

    return Promise.reject(normalized);
  },
);
