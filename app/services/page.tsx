import type { Metadata } from "next";
import ServicesPage from "../components/ServicesPage";

export const metadata: Metadata = {
    title: "Clinical Services & Specialists | Apex",
    description: "Multidisciplinary oncology team including Medical Oncology, Surgical Oncology, Radiation Therapy, and Psycho-Oncology.",
};

export default function ServicesRoute() {
    return <ServicesPage />;
}
