import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft, LogIn } from "lucide-react";

export const metadata = {
    title: "404 - Page Not Found | Apex Oncology",
    description: "The requested clinical page does not exist or you do not have permission to access it.",
};

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-teal-900/5 p-8 text-center relative overflow-hidden">
                {/* Subtle decorative glow */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-100 rounded-full blur-2xl pointer-events-none opacity-60" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-rose-100 rounded-full blur-2xl pointer-events-none opacity-40" />

                <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
                    <ShieldAlert size={32} />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
                    Error 404
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">
                    Page Not Found
                </h1>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                    This page does not exist, has been restricted, or your account does not have permission to access this clinical dashboard.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-xs"
                    >
                        <Home size={16} />
                        Apex Home
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
                    >
                        <LogIn size={16} />
                        Sign In
                    </Link>
                </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 text-center">
                Apex Oncology Hospital Information System &bull; Secure Access Control
            </p>
        </div>
    );
}
