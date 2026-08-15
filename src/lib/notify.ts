import { enqueueSnackbar } from "notistack";

/**
 * Every part of the app that needs to show a toast goes through this file
 * instead of importing `notistack` directly. That keeps the notification
 * library as an implementation detail: if we ever swap notistack for
 * something else, only this one file changes.
 */
export const notify = {
  success: (message: string) => enqueueSnackbar(message, { variant: "success" }),
  error: (message: string) => enqueueSnackbar(message, { variant: "error" }),
  info: (message: string) => enqueueSnackbar(message, { variant: "info" }),
  warning: (message: string) => enqueueSnackbar(message, { variant: "warning" }),
};
