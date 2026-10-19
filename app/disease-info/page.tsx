import type { Metadata } from "next";
import { DiseaseInfoPage } from "../components/OtherPages";

export const metadata: Metadata = {
    title: "My Care Plan & Oncology Insights | Apex",
    description: "Detailed roadmap of cancer staging, treatment cycle progress, protocol details, and recommended supportive therapies.",
};

export default function DiseaseInfoRoute() {
    return <DiseaseInfoPage />;
}
