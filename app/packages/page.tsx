import type { Metadata } from "next";
import PackagesPage from "../components/PackagesPage";

export const metadata: Metadata = {
    title: "Care Packages & Plans | Apex",
    description: "Explore structured cancer care packages, routine oncology screening, chemo bundles, and comprehensive post-remission monitoring.",
};

export default function PackagesRoute() {
    return <PackagesPage />;
}
