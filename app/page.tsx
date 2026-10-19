import type { Metadata } from "next";
import HomePage from "./components/HomePage";

export const metadata: Metadata = {
  title: "Apex — Integrated Oncology Platform",
  description: "Expert cancer care with science and compassion. Multidisciplinary oncology consultations, transparent treatment plans, and continuous patient support.",
};

export default function Page() {
  return <HomePage />;
}