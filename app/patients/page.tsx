import type { Metadata } from "next";
import PatientsPage from "../components/PatientsPage";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Patients Census & Clinical Records | Apex",
    description: "Comprehensive oncology patient directory, recovery index metrics, vital sign records, and diagnostic lab trends.",
};

export default async function PatientsRoute() {
    await requireAuth(["doctor", "admin"]);
    return <PatientsPage />;
}
