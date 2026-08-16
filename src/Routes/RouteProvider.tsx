import MainLayout from "@/Layout/MainLayout";
import { createBrowserRouter } from "react-router-dom";
import CustomersPage from "@/pages/customers/CustomersPage";
import CustomerDetailPage from "@/pages/customers/CustomerDetailPage";
import AccountDetailPage from "@/pages/accounts/AccountDetailPage";
import Overview from "@/pages/Overview/Overview";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { index: true, element: <Overview /> },
            { path: "customers", element: <CustomersPage /> },
            { path: "customers/:id", element: <CustomerDetailPage /> },
            { path: "accounts/:id", element: <AccountDetailPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);