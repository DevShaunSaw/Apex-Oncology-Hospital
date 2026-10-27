import type { Metadata } from "next";
import { DoctorDashboard } from "../../components/OtherPages";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Doctor Dashboard | Apex",
    description: "Clinical oncology dashboard to monitor patient recovery, review vitals, update treatment plans, and manage appointments.",
};

export default async function DashboardDoctorRoute() {
    await requireAuth(["doctor"]);
    return <DoctorDashboard />;
}
