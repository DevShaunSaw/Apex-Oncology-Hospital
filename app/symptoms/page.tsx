import type { Metadata } from "next";
import { SymptomsPage } from "../components/OtherPages";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Symptom Tracker & Side Effect Monitoring | Apex",
    description: "Log and monitor chemotherapy and radiation side effects, treatment responses, and recovery indices.",
};

export default async function SymptomsRoute() {
    await requireAuth(["patient"]);
    return <SymptomsPage />;
}
