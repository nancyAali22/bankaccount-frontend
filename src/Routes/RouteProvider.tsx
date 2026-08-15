import MainLayout from "@/Layout/MainLayout";
import { createBrowserRouter } from "react-router-dom";
import CustomersPage from "@/pages/customers/CustomersPage";
import Overview from "@/pages/Overview/Overview";


export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { index: true, element: <Overview /> },
            { path: "customers", element: <CustomersPage /> },
            { path: "accounts", element: <div className="p-6 text-lg font-medium">Accounts</div> },
            { path: "transactions", element: <div className="p-6 text-lg font-medium">Transactions</div> },
        ],
    },
]);