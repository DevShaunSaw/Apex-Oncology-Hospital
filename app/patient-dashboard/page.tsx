import type { Metadata } from "next";
import PatientDashboard from "../components/PatientDashboard";

export const metadata: Metadata = {
    title: "Patient Dashboard | Apex",
    description: "Track your cancer care roadmap, log symptoms, check vitals, and connect with your oncology care team.",
};

export default function PatientDashboardRoute() {
    return <PatientDashboard />;
}
