import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DialogBrandHeaderProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

/**
 * Colored banner used at the top of every modal (Add/Edit customer, Open
 * account, Deposit, Withdraw) — same gradient as the Available balance
 * card (`bg-gradient-brand`) so modals feel like part of the same product
 * instead of a generic gray dialog. Shared here instead of duplicated in
 * each dialog file.
 *
 * Still renders the real DialogTitle/DialogDescription/DialogClose from
 * the shadcn dialog primitives underneath — only the visual wrapper and
 * colors are custom, so Radix's aria-labelledby/aria-describedby wiring
 * and Escape-to-close behavior are exactly what they were before.
 */
export function DialogBrandHeader({ icon: Icon, title, description }: DialogBrandHeaderProps) {
  return (
    <div className="relative rounded-t-xl bg-gradient-brand p-6 text-white">
      <DialogClose className="absolute top-4 right-4 rounded-md p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Close dialog</span>
      </DialogClose>

      <div className="flex items-start gap-3 pr-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <DialogHeader className="gap-0.5 text-left">
          <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
          <DialogDescription className="text-sm text-white/75">{description}</DialogDescription>
        </DialogHeader>
      </div>
    </div>
  );
}
