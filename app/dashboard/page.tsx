"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function DashboardPage() {
    const { role, isLoggedIn, loading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isLoggedIn && role) {
                router.replace(`/${role}-dashboard`);
            } else {
                router.replace("/login");
            }
        }
    }, [loading, isLoggedIn, role, router]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Redirecting to your oncology dashboard...</p>
        </div>
    );
}
