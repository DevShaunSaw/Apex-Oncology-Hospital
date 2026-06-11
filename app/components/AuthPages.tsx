"use client";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight } from "lucide-react";

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
        specialty: "",
        experience: "",
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
            role: form.role,
            specialty: form.role === "doctor" ? form.specialty : undefined,
            experience: form.role === "doctor" ? form.experience : undefined,
            primaryConcern: form.role === "patient" ? form.primaryConcern : undefined,
            preferredLanguage: form.role === "patient" ? form.preferredLanguage : undefined,
            healthHistory: form.role === "patient" ? form.healthHistory : undefined,
        });
        if (!res.success) {
            setError(res.error || "Registration failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-teal-glow">
                        <span className="text-white font-bold text-2xl font-display">A</span>
                    </div>
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
                            {/* Role Selector */}
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                                {([
                                    { value: "patient", label: "Register as Patient" },
                                    { value: "doctor", label: "Register as Doctor" }
                                ] as const).map(r => (
                                    <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.role === r.value ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>

                            <h2 className="font-semibold text-slate-700 mb-4">Personal Details</h2>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
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
                                    placeholder="Mobile Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                    value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-slate-500"
                                    value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option value="">Gender</option>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {step === 2 && form.role === "patient" && (
                        <div className="space-y-4">
                            <h2 className="font-semibold text-slate-700 mb-4">Medical Background</h2>
                            <input className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="City / Location" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-slate-500"
                                value={form.primaryConcern} onChange={e => setForm({ ...form, primaryConcern: e.target.value })}>
                                <option value="">Primary concern / Referral type</option>
                                <option>New diagnosis</option><option>Second opinion</option><option>Ongoing treatment</option><option>Preventive screening</option>
                            </select>
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-slate-500"
                                value={form.preferredLanguage} onChange={e => setForm({ ...form, preferredLanguage: e.target.value })}>
                                <option value="">Preferred Language</option>
                                <option>English</option><option>Hindi</option><option>Marathi</option><option>Gujarati</option><option>Tamil</option>
                            </select>
                            <textarea rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 resize-none"
                                placeholder="Brief health history (optional — doctor will review)" value={form.healthHistory} onChange={e => setForm({ ...form, healthHistory: e.target.value })} />
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && form.role === "doctor" && (
                        <div className="space-y-4">
                            <h2 className="font-semibold text-slate-700 mb-4">Professional Details</h2>
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-slate-500"
                                value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                                <option value="">Specialty</option>
                                <option>Medical Oncology</option>
                                <option>Surgical Oncology</option>
                                <option>Radiation Oncology</option>
                                <option>Hematology-Oncology</option>
                            </select>
                            <input className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="Years of Experience (e.g. 15 years)" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                            <input className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
                                placeholder="City / Location" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="font-semibold text-slate-700 mb-4">Set Password</h2>
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
                            <label className="flex items-start gap-3 text-sm text-slate-500 cursor-pointer">
                                <input type="checkbox" className="mt-0.5 accent-teal-600" />
                                I agree to the <span className="text-teal-600 underline">Terms of Service</span> and <span className="text-teal-600 underline">Privacy Policy</span>
                            </label>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Back</button>
                                <button onClick={handleSubmit} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">
                                    Create Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <button onClick={() => setPage("login")} className="text-teal-600 font-medium hover:underline">Login</button></p>
            </div>
        </div>
    );
}

export function LoginPage() {
    const { login, setPage } = useApp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | "admin">("patient");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setError("");
        const res = await login(email, password, selectedRole);
        if (!res.success) {
            setError(res.error || "Login failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-teal-glow">
                        <span className="text-white font-bold text-2xl font-display">A</span>
                    </div>
                    <h1 className="text-3xl font-display text-teal-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-1 text-sm">Sign in to your care dashboard</p>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4">
                            {error}
                        </div>
                    )}
                    {/* Demo Role Selector */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                        {(["patient", "doctor", "admin"] as const).map(r => (
                            <button key={r} onClick={() => setSelectedRole(r)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${selectedRole === r ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input type="email" className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input type={show ? "text" : "password"} className="w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                            <button onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                        <div className="flex justify-end"><button className="text-teal-600 text-xs hover:underline">Forgot password?</button></div>
                        <button onClick={handleLogin} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
                            Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                        </button>
                    </div>
                    <div className="mt-4 p-3 bg-teal-50 rounded-xl text-xs text-teal-700 text-center">
                        Demo mode — click Sign In with any role to explore
                    </div>
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">New to Apex? <button onClick={() => setPage("register")} className="text-teal-600 font-medium hover:underline">Register now</button></p>
            </div>
        </div>
    );
}