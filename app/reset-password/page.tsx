import type { Metadata } from "next";
import ResetPasswordPage from "../components/ResetPasswordPage";

export const metadata: Metadata = {
    title: "Reset Password | Apex",
    description: "Reset your Apex Onco Care account password with email and phone verification.",
};

export default function ResetPasswordRoute() {
    return <ResetPasswordPage />;
}
