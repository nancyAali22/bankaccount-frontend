import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/shared/Sidebar/Sidebar";

export default function MainLayout() {
    return (
        <SidebarProvider>
            <SideBar />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}