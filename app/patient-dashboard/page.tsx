import type { Metadata } from "next";
import PatientDashboard from "../components/PatientDashboard";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Patient Dashboard | Apex",
    description: "Track your cancer care roadmap, log symptoms, check vitals, and connect with your oncology care team.",
};

export default async function PatientDashboardRoute() {
    await requireAuth(["patient"]);
    return <PatientDashboard />;
}
