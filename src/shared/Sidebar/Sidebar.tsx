import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Landmark,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- Nav config ---
// Real, routable items only — these are the only entries in
// RouteProvider.tsx, so these are the only ones that get a working NavLink.
// (No decorative/disabled items here on purpose — kept the sidebar limited
// to what actually exists in the app.)
const mainNav = [
    { title: "Overview", url: "/", icon: LayoutDashboard },
    { title: "Customers", url: "/customers", icon: Users },
];

// --- Component ---
export default function SideBar() {
    const { pathname } = useLocation();

    const isActive = (url: string) =>
        url === "/" ? pathname === "/" : pathname.startsWith(url);

    return (
        <div
            className="contents"
            // Scoped override of the sidebar's own CSS variables (defined in
            // components/ui/sidebar.tsx / index.css) to the dark navy brand
            // gradient stops. This lives on a `display:contents` wrapper
            // (not directly on <Sidebar>) because <Sidebar> forwards this
            // prop onto an inner "sidebar-container" div, which sits BELOW
            // the div that actually applies `text-sidebar-foreground` (the
            // base/inactive text color). With the vars only visible that
            // deep, inactive items fell back to the global default
            // (near-black) — only the active item looked right, because it
            // sets its color via an explicit class on the button itself.
            // A `contents` wrapper is a true ancestor of everything
            // <Sidebar> renders, so every descendant — including inactive
            // nav items — now inherits the correct light color. `contents`
            // means this div doesn't add any box of its own, so it can't
            // affect the flex layout SidebarProvider expects.
            style={
                {
                    "--sidebar": "var(--brand-950)",
                    "--sidebar-foreground": "oklch(0.93 0.02 200)",
                    "--sidebar-accent": "color-mix(in oklch, var(--brand-400) 28%, transparent)",
                    "--sidebar-accent-foreground": "oklch(0.98 0.01 195)",
                    "--sidebar-border": "color-mix(in oklch, white 12%, transparent)",
                } as React.CSSProperties
            }
        >
            <Sidebar collapsible="icon">
                {/* ── Header ─────────────────────────────── */}
                <SidebarHeader className="flex flex-row items-center gap-2 px-3 py-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-sm">
                        <Landmark className="size-4.5" />
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                            BankAccount
                        </span>
                        <span className="truncate text-xs text-sidebar-foreground/60">
                            Bank Management System
                        </span>
                    </div>
                    <SidebarTrigger className="ml-auto text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarHeader>

                <SidebarSeparator />

                {/* ── Content ─────────────────────────────── */}
                <SidebarContent>
                    {/* Main nav — wrapped in a <nav> landmark for screen readers */}
                    <nav aria-label="Main">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-sidebar-foreground/50">Main</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {mainNav.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                                <NavLink to={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </nav>
                </SidebarContent>

                {/* ── Footer: static/decorative widgets ──────
                    Neither of these is backed by an API. "All systems
                    operational" is a fixed label (no health-check endpoint
                    exists on the backend to poll), and the teller profile is a
                    placeholder identity since authentication isn't implemented
                    yet. Both are hidden in icon-collapsed mode since they rely
                    on visible text to make sense. */}
                <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-white/5 px-3 py-2.5">
                        <span className="relative flex size-2 shrink-0">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-sidebar-foreground/90">System status</p>
                            <p className="truncate text-[11px] text-sidebar-foreground/50">All systems operational</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl px-1 py-1.5">
                        <Avatar className="size-8 border border-sidebar-border">
                            <AvatarFallback className="bg-brand-500 text-xs font-medium text-white">
                                SA
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-sidebar-foreground/90">Sara Adel</p>
                            <p className="truncate text-[11px] text-sidebar-foreground/50">Teller</p>
                        </div>
                    </div>
                </div>

                <SidebarRail />
            </Sidebar>
        </div>
    );
}