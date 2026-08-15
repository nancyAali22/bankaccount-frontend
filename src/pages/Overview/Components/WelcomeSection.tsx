import { ArrowRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Dashboard hero banner.
 *
 * This is intentionally static/presentational — it does not fetch any
 * data itself. There is no authentication yet, so there is no logged-in
 * user to greet by name; using a generic greeting is the honest choice
 * instead of hardcoding a fake name like "Sara".
 *
 * "Add customer" navigates to /customers?action=add instead of opening its
 * own copy of the add-customer dialog here. The dialog's form, validation,
 * and "refetch the list on success" logic already live on CustomersPage
 * (right next to the list it mutates) — duplicating that dialog on Overview
 * would mean two components to keep in sync for one feature. CustomersPage
 * reads the `action` query param on mount and opens the dialog itself.
 */
export default function WelcomeSection() {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-teal-800 px-6 py-8 text-white shadow-md lg:px-10 lg:py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{getTodayLabel()}</p>
      <h1 className="mt-2 max-w-xl text-3xl font-semibold lg:text-4xl">
        Good morning. The counter is open.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-white/80">
        Manage customer records, open accounts and post deposits or withdrawals — every
        balance change is logged to the transaction ledger.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" asChild>
          <Link to="/customers">
            Open customers <ArrowRight />
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link to="/customers?action=add">
            <UserPlus /> Add customer
          </Link>
        </Button>
      </div>
    </div>
  );
}