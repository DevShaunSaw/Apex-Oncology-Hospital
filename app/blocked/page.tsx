"use client";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { ShieldAlert, Phone, Mail, XCircle, AlertTriangle, LogOut, ExternalLink } from "lucide-react";

export default function BlockedPage() {
    const { currentUser, logout } = useApp();
    const [closedAttempted, setClosedAttempted] = useState(false);

    // Default admin contact details
    const ADMIN_PHONE = "+91 1800 200 4567";
    const ADMIN_EMAIL = "admin@apexonco.com";
    const ADMIN_HOURS = "Mon - Sat: 08:00 AM - 08:00 PM IST";

    const reason = currentUser?.blockedReason || "Violation of patient communication policies, inappropriate behavior, or unethical platform conduct.";

    const formattedDate = currentUser?.blockedAt 
        ? new Date(currentUser.blockedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    const handleCloseApp = async () => {
        try {
            // First call logout to terminate session and clear auth cookies
            await logout();
        } catch (e) {
            console.error("Logout error:", e);
        }

        // Attempt to close the browser window or tab
        setClosedAttempted(true);
        try {
            window.close();
        } catch (err) {
            console.error("Window close failed:", err);
        }

        // In standard modern browsers, window.close() only works if opened by script.
        // Fallback: Redirect to about:blank or provide clear exit instruction
        setTimeout(() => {
            try {
                window.location.href = "about:blank";
            } catch (err) {
                // Ignore if about:blank navigation is blocked
            }
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/40 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center animate-fadeIn">
                {/* Shield Icon with glowing ring */}
                <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-60"></div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/50">
                        <ShieldAlert size={40} className="stroke-[2.2]" />
                    </div>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase mb-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Account Access Suspended
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2 tracking-tight">
                    You Have Been Blocked
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {currentUser?.name ? (
                        <>Hello <span className="text-white font-semibold">{currentUser.name}</span>, your</>
                    ) : (
                        "Your"
                    )}{" "}
                    access to the Apex Onco Care platform has been restricted by hospital administration.
                </p>

                {/* Reasoning Box */}
                <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4 sm:p-5 text-left mb-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <AlertTriangle size={15} />
                        <span>Reason for Suspension</span>
                    </div>
                    <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed font-medium bg-rose-900/20 p-3 rounded-xl border border-rose-800/30">
                        &ldquo;{reason}&rdquo;
                    </p>
                    {formattedDate && (
                        <div className="text-[11px] text-rose-300/70 mt-2.5">
                            Action recorded on: <span className="font-semibold text-rose-200">{formattedDate}</span>
                        </div>
                    )}
                </div>

                {/* Admin Contact Information */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 text-left mb-6 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Need Help or Wish to Appeal?
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        If you believe this action was taken in error or wish to appeal this suspension, please contact the hospital administration directly:
                    </p>
                    
                    <div className="space-y-2 pt-1 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                            <span className="text-slate-400 flex items-center gap-2">
                                <Phone size={14} className="text-teal-400" />
                                Admin Hotline
                            </span>
                            <a 
                                href={`tel:${ADMIN_PHONE}`} 
                                className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-2 flex items-center gap-1"
                            >
                                {ADMIN_PHONE}
                            </a>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                            <span className="text-slate-400 flex items-center gap-2">
                                <Mail size={14} className="text-teal-400" />
                                Admin Email
                            </span>
                            <a 
                                href={`mailto:${ADMIN_EMAIL}`} 
                                className="font-semibold text-slate-200 hover:text-white underline underline-offset-2"
                            >
                                {ADMIN_EMAIL}
                            </a>
                        </div>

                        <div className="text-[11px] text-slate-400 text-center pt-1">
                            {ADMIN_HOURS}
                        </div>
                    </div>
                </div>

                {/* Close App CTA Button */}
                <div className="space-y-3">
                    <button
                        onClick={handleCloseApp}
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <XCircle size={18} />
                        <span>Close App</span>
                    </button>

                    {closedAttempted && (
                        <p className="text-xs text-amber-300/80 animate-fadeIn">
                            If the browser prevents automatic closure, please close this browser tab manually.
                        </p>
                    )}

                    <div className="pt-2">
                        <button
                            onClick={async () => {
                                await logout();
                                window.location.href = "/login";
                            }}
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <LogOut size={13} />
                            <span>Sign in with another account</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
