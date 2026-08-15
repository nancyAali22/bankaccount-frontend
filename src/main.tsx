import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SnackbarProvider } from "notistack";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Theme>
        {/*
          SnackbarProvider must be mounted once, near the root, for the
          standalone `enqueueSnackbar` used by src/lib/notify.ts (and the
          axios interceptor) to have somewhere to render toasts into.
          Without this, notify.error(...) calls silently do nothing.
        */}
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={4000}
        >
          <App />
        </SnackbarProvider>
      </Theme>
    </QueryClientProvider>
  </StrictMode>,
);