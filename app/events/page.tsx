import type { Metadata } from "next";
import EventsPage from "../components/EventsPage";

export const metadata: Metadata = {
    title: "Events & Community Support | Apex",
    description: "Join upcoming cancer survivor workshops, clinical webinars, nutritional guidance circles, and peer support events.",
};

export default function EventsRoute() {
    return <EventsPage />;
}
