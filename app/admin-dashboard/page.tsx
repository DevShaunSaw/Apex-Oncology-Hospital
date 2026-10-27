import type { Metadata } from "next";
import { AdminDashboard } from "../components/OtherPages";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Admin Dashboard | Apex",
    description: "Hospital administration overview, doctor onboarding, appointment management, and patient census.",
};

export default async function AdminDashboardRoute() {
    await requireAuth(["admin"]);
    return <AdminDashboard />;
}
