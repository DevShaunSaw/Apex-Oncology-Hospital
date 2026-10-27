import type { Metadata } from "next";
import AppointmentsPage from "../components/AppointmentsPage";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Appointments | Apex",
    description: "Book, schedule and review oncology consultations, chemo infusions, and specialist clinical visits.",
};

export default async function AppointmentsRoute() {
    await requireAuth(["patient", "doctor", "admin"]);
    return <AppointmentsPage />;
}
