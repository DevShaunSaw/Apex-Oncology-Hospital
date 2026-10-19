import type { Metadata } from "next";
import EventsAdminPage from "../components/EventsAdminPage";

export const metadata: Metadata = {
    title: "Events Administration | Apex",
    description: "Manage, create, and publish community health webinars, patient symposiums, and survivor circles.",
};

export default function EventsAdminRoute() {
    return <EventsAdminPage />;
}
