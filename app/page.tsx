import type { Metadata } from "next";
import HomePage from "./components/HomePage";

export const metadata: Metadata = {
  title: "Apex Connect — Healthcare Ecosystem",
  description: "Welcome to Apex Connect. Unified access to Apex Superspeciality Cancer Hospital, Apex Diagnostics, and Apex Rehabilitation Service.",
};

export default function Page() {
  return <HomePage />;
}