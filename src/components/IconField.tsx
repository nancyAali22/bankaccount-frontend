import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface IconFieldProps {
  icon: LucideIcon;
  children: ReactNode;
}

/** Positions `icon` inside the left edge of whatever input/select is passed
 * as `children` — the child itself must reserve room via `pl-8`. */
export function IconField({ icon: Icon, children }: IconFieldProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-brand-500"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
