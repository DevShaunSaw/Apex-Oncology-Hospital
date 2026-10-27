"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export function RegisterPage() {
    const { setPage, register } = useApp();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        city: "",
        password: "",
        confirm: "",
        role: "patient",
        primaryConcern: "",
        preferredLanguage: "",
        healthHistory: ""
    });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.password) {
            setError("Please fill in all required fields.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        setError("");
        const res = await register({
            name: form.name,
            email: form.email,
            phone: form.phone,
            dob: form.dob,
            gender: form.gender,
            city: form.city,
            password: form.password,
            role: "patient",
            primaryConcern: form.primaryConcern,
            preferredLanguage: form.preferredLanguage,
            healthHistory: form.healthHistory,
        });
        if (!res.success) {
            setError(res.error || "Registration failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-center px-4 py-12 relative">
            <div className="w-full max-w-md mb-4 flex items-center justify-start">
                <Link
                    href="/"
                    onClick={() => setPage("home")}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Home
                </Link>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        onClick={() => setPage("home")}
                        className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-teal-glow hover:scale-105 transition-transform"
                    >
                        <span className="text-white font-bold text-2xl font-display">A</span>
                    </Link>
                    <h1 className="text-3xl font-display text-teal-900">Create Your Account</h1>
                    <p className="text-slate-500 mt-2 text-sm">Join Apex Onco Care — begin your care journey</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center mb-8">
                    {[1, 2, 3].map((s, i) => (
                        <div key={s} className="flex-1 flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
                            {i < 2 && <div className={`flex-1 h-1 mx-1 rounded ${step > s ? "bg-teal-500" : "bg-slate-100"}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4">
                            {error}
                        </div>
                    )}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input type="text" className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                    placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input type="email" className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                    placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input type="tel" className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                    placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
                                    <input type="date" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                        value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Gender</label>
                                    <select className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                        value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />

                            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="Primary Concern / Cancer Type" value={form.primaryConcern} onChange={e => setForm({ ...form, primaryConcern: e.target.value })} />
                            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="Preferred Language" value={form.preferredLanguage} onChange={e => setForm({ ...form, preferredLanguage: e.target.value })} />

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">Next</button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4">
                            <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 resize-none h-20"
                                placeholder="Brief health history or notes (optional)" value={form.healthHistory} onChange={e => setForm({ ...form, healthHistory: e.target.value })} />
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input type={show ? "text" : "password"} className="w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="Create Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                <button onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input type="password" className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Back</button>
                                <button onClick={handleSubmit} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">
                                    Create Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">
                    Already have an account?{" "}
                    <Link href="/login" onClick={() => setPage("login")} className="text-teal-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export function LoginPage() {
    const { login, setPage } = useApp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<"patient" | "staff">("patient");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setError("");
        setIsSubmitting(true);
        try {
            const res = await login(email, password, selectedRole);
            if (!res.success) {
                setError(res.error || "Login failed.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-center px-4 relative py-12">
            <div className="w-full max-w-sm mb-4 flex items-center justify-start">
                <Link
                    href="/"
                    onClick={() => setPage("home")}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Home
                </Link>
            </div>
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-display text-teal-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {selectedRole === "patient"
                            ? "Sign in to your patient care dashboard"
                            : "Hospital staff portal (Doctor & Admin sign in)"}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs mb-4">
                            {error}
                        </div>
                    )}

                    {/* RBAC Portal Selector: Patient vs Staff */}
                    <div className="flex bg-slate-100/90 rounded-xl p-1 mb-5 border border-slate-200/50">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRole("patient");
                                setError("");
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                selectedRole === "patient"
                                    ? "bg-white text-teal-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <User size={14} className={selectedRole === "patient" ? "text-teal-600" : "text-slate-400"} />
                            <span>Patient</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRole("staff");
                                setError("");
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                selectedRole === "staff"
                                    ? "bg-white text-teal-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <ShieldCheck size={14} className={selectedRole === "staff" ? "text-teal-600" : "text-slate-400"} />
                            <span>Staff</span>
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                placeholder={selectedRole === "patient" ? "Patient Email Address" : "Staff Email Address"}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type={show ? "text" : "password"}
                                required
                                className="w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href="/reset-password"
                                onClick={() => setPage("reset-password")}
                                className="text-teal-600 text-xs hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In as {selectedRole === "patient" ? "Patient" : "Staff"}</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Only display Register link when Patient is selected */}
                {selectedRole === "patient" && (
                    <p className="text-center text-sm text-slate-500 mt-4 transition-all">
                        New to Apex?{" "}
                        <Link href="/register" onClick={() => setPage("register")} className="text-teal-600 font-medium hover:underline">
                            Register now
                        </Link>
                    </p>
                )}
                {selectedRole === "staff" && (
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Hospital staff accounts are issued and managed by administration.
                    </p>
                )}
            </div>
        </div>
    );
}