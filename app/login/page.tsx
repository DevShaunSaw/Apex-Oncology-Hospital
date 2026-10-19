import type { Metadata } from "next";
import { LoginPage } from "../components/AuthPages";

export const metadata: Metadata = {
    title: "Sign In | Apex",
    description: "Sign in to access your secure oncology portal, treatment plans, diagnostic reports, and medical consultations.",
};

export default function LoginRoute() {
    return <LoginPage />;
}
