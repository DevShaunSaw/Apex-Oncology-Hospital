import type { Metadata } from "next";
import PatientDashboard from "../../components/PatientDashboard";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Patient Dashboard | Apex",
    description: "Track your oncology treatment plan, vitals, upcoming appointments, and daily recovery index.",
};

export default async function DashboardPatientRoute() {
    await requireAuth(["patient"]);
    return <PatientDashboard />;
}
