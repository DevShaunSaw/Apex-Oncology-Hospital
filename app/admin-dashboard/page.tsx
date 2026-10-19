import type { Metadata } from "next";
import { AdminDashboard } from "../components/OtherPages";

export const metadata: Metadata = {
    title: "Admin Dashboard | Apex",
    description: "Hospital administration overview, doctor onboarding, appointment management, and patient census.",
};

export default function AdminDashboardRoute() {
    return <AdminDashboard />;
}
