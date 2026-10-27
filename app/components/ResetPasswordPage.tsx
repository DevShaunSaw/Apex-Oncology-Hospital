"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Loader2,
    KeyRound,
    ShieldAlert
} from "lucide-react";

export default function ResetPasswordPage() {
    const { setPage } = useApp();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!email.trim() || !phone.trim() || !newPassword) {
            setError("Please fill in your email, phone number, and new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please verify both fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    phone: phone.trim(),
                    newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || "Failed to reset password. Please check your details.");
                return;
            }

            setSuccessMessage(data.message || "Password successfully reset!");
            // Auto redirect to login after 3.5 seconds
            setTimeout(() => {
                setPage("login");
                router.push("/login");
            }, 3500);
        } catch (err: any) {
            setError("A network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-center px-4 py-12 relative">
            {/* Back link */}
            <div className="w-full max-w-md mb-4 flex items-center justify-start">
                <Link
                    href="/login"
                    onClick={() => setPage("login")}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Sign In
                </Link>
            </div>

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <Link
                        href="/"
                        onClick={() => setPage("home")}
                        className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-teal-glow hover:scale-105 transition-transform"
                    >
                        <span className="text-white font-bold text-2xl font-display">A</span>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-display text-teal-900 font-bold">Reset Password</h1>
                    <p className="text-slate-500 mt-1 text-xs sm:text-sm">
                        Verify your credentials to set a new password
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-7">
                    {/* Test Notice Banner */}
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-amber-800">
                        <KeyRound size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold">Test Verification Mode:</span> Password will be reset immediately once the correct registered email and phone number combination is verified against the database.
                        </div>
                    </div>

                    {/* Error Box */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Box */}
                    {successMessage ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Password Reset Successfully!</h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    {successMessage}
                                </p>
                            </div>
                            <div className="text-xs text-slate-400">
                                Redirecting to sign in page in a moment...
                            </div>
                            <Link
                                href="/login"
                                onClick={() => setPage("login")}
                                className="inline-flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Proceed to Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Account Email Address *
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g. yourname@domain.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {/* Registered Phone Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Registered Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. 9920004333"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 bg-slate-50/50"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Must match the phone number registered on this account
                                </span>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    New Password *
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        placeholder="Minimum 6 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 bg-slate-50/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 bg-slate-50/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Verifying &amp; Resetting...</span>
                                    </>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Back to sign in prompt */}
                <p className="text-center text-xs text-slate-500 mt-5">
                    Remembered your password?{" "}
                    <Link
                        href="/login"
                        onClick={() => setPage("login")}
                        className="text-teal-600 font-semibold hover:underline"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
