"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import PatientDashboard from "../components/PatientDashboard";
import { DoctorDashboard, AdminDashboard } from "../components/OtherPages";
import Link from "next/link";
import { Shield, User, Stethoscope, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { role, isLoggedIn, loading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isLoggedIn && role) {
            router.replace(`/${role}-dashboard`);
        }
    }, [loading, isLoggedIn, role, router]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading your oncology dashboard...</p>
            </div>
        );
    }

    if (isLoggedIn) {
        if (role === "doctor") return <DoctorDashboard />;
        if (role === "admin") return <AdminDashboard />;
        return <PatientDashboard />;
    }

    // Portal selector when not logged in
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
            <div className="max-w-xl w-full bg-white rounded-2xl border border-teal-100 shadow-xl p-8 text-center">
                <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <Shield size={28} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Apex Oncology Dashboard</h1>
                <p className="text-sm text-slate-600 mb-8">
                    Please select your portal or sign in to access personalized oncology care metrics and records.
                </p>

                <div className="grid gap-3 mb-6 text-left">
                    <Link
                        href="/patient-dashboard"
                        className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-800">Patient Portal</div>
                                <div className="text-xs text-slate-500">Track treatment roadmap, symptoms & care plan</div>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </Link>

                    <Link
                        href="/doctor-dashboard"
                        className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Stethoscope size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-800">Doctor Portal</div>
                                <div className="text-xs text-slate-500">Clinical census, patient vitals & appointments</div>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </Link>

                    <Link
                        href="/admin-dashboard"
                        className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-800">Admin Portal</div>
                                <div className="text-xs text-slate-500">Staff management, census metrics & events</div>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 text-sm">
                    <span className="text-slate-500">Have an account?</span>
                    <Link href="/login" className="font-semibold text-teal-600 hover:underline">
                        Log In Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
