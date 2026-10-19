import type { Metadata } from "next";
import AppointmentsPage from "../components/AppointmentsPage";

export const metadata: Metadata = {
    title: "Appointments | Apex",
    description: "Book, schedule and review oncology consultations, chemo infusions, and specialist clinical visits.",
};

export default function AppointmentsRoute() {
    return <AppointmentsPage />;
}
