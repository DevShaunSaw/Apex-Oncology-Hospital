import type { Metadata } from "next";
import { SymptomsPage } from "../components/OtherPages";

export const metadata: Metadata = {
    title: "Symptom Tracker & Side Effect Monitoring | Apex",
    description: "Log and monitor chemotherapy and radiation side effects, treatment responses, and recovery indices.",
};

export default function SymptomsRoute() {
    return <SymptomsPage />;
}
