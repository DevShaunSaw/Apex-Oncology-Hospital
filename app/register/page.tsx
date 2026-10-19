import type { Metadata } from "next";
import { RegisterPage } from "../components/AuthPages";

export const metadata: Metadata = {
    title: "Register | Apex",
    description: "Create an account on Apex to connect with top oncology specialists, review care options, and manage treatment.",
};

export default function RegisterRoute() {
    return <RegisterPage />;
}
