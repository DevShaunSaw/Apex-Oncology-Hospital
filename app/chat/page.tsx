import type { Metadata } from "next";
import ChatPage from "../components/ChatPage";

import { requireAuth } from "@/lib/authGuard";

export const metadata: Metadata = {
    title: "Clinical Care Chat | Apex",
    description: "Secure, real-time clinical communication between oncology patients, consulting oncologists, and nurse coordinators.",
};

export default async function ChatRoute() {
    await requireAuth(["patient", "doctor", "admin"]);
    return <ChatPage />;
}
