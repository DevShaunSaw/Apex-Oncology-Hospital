import type { Metadata } from "next";
import ChatPage from "../components/ChatPage";

export const metadata: Metadata = {
    title: "Clinical Care Chat | Apex",
    description: "Secure, real-time clinical communication between oncology patients, consulting oncologists, and nurse coordinators.",
};

export default function ChatRoute() {
    return <ChatPage />;
}
