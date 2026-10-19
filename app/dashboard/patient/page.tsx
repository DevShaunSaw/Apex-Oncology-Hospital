import type { Metadata } from "next";
import PatientDashboard from "../../components/PatientDashboard";

export const metadata: Metadata = {
    title: "Patient Dashboard | Apex",
    description: "Track your oncology treatment plan, vitals, upcoming appointments, and daily recovery index.",
};

export default function DashboardPatientRoute() {
    return <PatientDashboard />;
}
