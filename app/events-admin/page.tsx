import type { Metadata } from "next";
import EventsAdminPage from "../components/EventsAdminPage";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Events Administration | Apex",
    description: "Manage, create, and publish community health webinars, patient symposiums, and survivor circles.",
};

export default async function EventsAdminRoute() {
    await requireAuth(["admin"]);
    return <EventsAdminPage />;
}
