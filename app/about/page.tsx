import type { Metadata } from "next";
import AboutPage from "../components/AboutPage";

export const metadata: Metadata = {
    title: "About Us | Apex",
    description: "Discover our mission, clinical leadership, research initiatives, and commitment to compassionate cancer care.",
};

export default function AboutRoute() {
    return <AboutPage />;
}
