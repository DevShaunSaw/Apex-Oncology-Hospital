"use client";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { ArrowRight, Shield, Clock, Users, Star, ChevronRight, Heart, Activity } from "lucide-react";
import { testimonials, doctors } from "../data/mockData";

export default function HomePage() {
    const { setPage } = useApp();

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeInUp">
                            <div className="inline-flex items-center gap-2 bg-teal-700/50 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
                                <span className="w-2 h-2 bg-teal-300 rounded-full pulse-teal"></span>
                                India's Integrated Oncology Platform
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light leading-tight mb-6">
                                Healing with<br />
                                <span className="font-semibold text-teal-200">Science</span> &amp;<br />
                                <span className="font-semibold text-teal-200">Compassion</span>
                            </h1>
                            <p className="text-teal-100 text-lg mb-8 leading-relaxed max-w-md">
                                From diagnosis to recovery — Apex Onco Care connects patients with expert oncologists, personalised treatment plans, and 24/7 support.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/register"
                                    onClick={() => setPage("register")}
                                    className="flex items-center gap-2 bg-white text-teal-800 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all shadow-lg"
                                >
                                    Get Started <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="/services"
                                    onClick={() => setPage("services")}
                                    className="flex items-center gap-2 border border-teal-400/50 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700/50 transition-all"
                                >
                                    Our Services <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center"><Activity size={20} className="text-white" /></div>
                                        <div>
                                            <div className="font-semibold">Patient Health Summary</div>
                                            <div className="text-teal-200 text-sm">Meera Joshi — AOC-2024-00128</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Treatment Progress", value: "Cycle 2 of 6", progress: 33 },
                                            { label: "Recovery Index", value: "68%", progress: 68 },
                                            { label: "Vitals Stability", value: "Normal", progress: 85 },
                                        ].map(({ label, value, progress }) => (
                                            <div key={label}>
                                                <div className="flex justify-between text-xs text-teal-200 mb-1">
                                                    <span>{label}</span>
                                                    <span className="font-medium text-white">{value}</span>
                                                </div>
                                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-teal-300 rounded-full" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-xs">
                                        <span className="text-teal-200">Next: Chemotherapy Session</span>
                                        <span className="font-semibold">Tomorrow, 10:00 AM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white border-b border-teal-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: "15,000+", label: "Patients Treated" },
                            { value: "94%", label: "Care Satisfaction" },
                            { value: "45+", label: "Specialist Oncologists" },
                            { value: "24/7", label: "Care Team Support" },
                        ].map(({ value, label }) => (
                            <div key={label} className="p-2">
                                <div className="text-2xl sm:text-3xl font-display font-semibold text-teal-700">{value}</div>
                                <div className="text-xs sm:text-sm text-slate-500 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Apex */}
            <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-3">Comprehensive Cancer Care</h2>
                    <p className="text-slate-500 text-sm sm:text-base">Integrated technology and clinical excellence guiding you through every step of your journey.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: "Multidisciplinary Team", desc: "Surgical, medical, and radiation oncologists collaborate to tailor each patient's care plan." },
                        { icon: Clock, title: "24/7 Care Chat", desc: "Never feel alone. Real-time access to oncology nurses and your care team for symptoms and queries." },
                        { icon: Users, title: "Support Communities", desc: "Connect with cancer survivors, join guided support circles, and share journeys with peers." },
                        { icon: Star, title: "Specialist Matching", desc: "Algorithms match you with top-rated oncologists specializing in your specific cancer type and stage." },
                        { icon: Heart, title: "Transparent Packages", desc: "Fixed-price comprehensive packages — clear treatment paths with no hidden medical expenses." },
                        { icon: Activity, title: "Remote Symptom Tracking", desc: "Log daily recovery metrics. Automated alerts notify doctors of potential complications early." },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover hover:border-teal-200 transition-all">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                                <Icon size={24} className="text-teal-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Meet Doctors */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-display text-teal-900">Our Oncologists</h2>
                        <p className="text-slate-500 mt-1">Specialists dedicated to your recovery</p>
                    </div>
                    <Link
                        href="/services"
                        onClick={() => setPage("services")}
                        className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {doctors.map(doc => (
                        <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 hover:shadow-card-hover hover:border-teal-100 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg">{doc.image}</div>
                                <div>
                                    <div className="font-semibold text-slate-800 text-sm">{doc.name}</div>
                                    <div className="text-xs text-teal-600">{doc.specialty}</div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 space-y-1">
                                <div className="flex justify-between"><span>Experience</span><span className="font-medium text-slate-600">{doc.experience}</span></div>
                                <div className="flex justify-between"><span>Patients</span><span className="font-medium text-slate-600">{doc.patients}+</span></div>
                                <div className="flex justify-between"><span>Rating</span><span className="font-medium text-amber-500">★ {doc.rating}</span></div>
                            </div>
                            <div className={`mt-3 px-2 py-1 rounded-full text-xs font-medium text-center ${doc.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {doc.available ? "Available" : "Unavailable"}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Preview */}
            <section className="bg-teal-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-display mb-2">Voices of Healing</h2>
                        <p className="text-teal-300">Real stories from patients and families</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {testimonials.map(t => (
                            <div key={t.id} className="bg-teal-800/50 border border-teal-700/50 rounded-2xl p-5">
                                <div className="flex text-amber-400 mb-3 text-sm">{"★".repeat(t.rating)}</div>
                                <p className="text-teal-100 text-sm leading-relaxed mb-4 italic">"{t.text.slice(0, 120)}…"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">{t.avatar}</div>
                                    <div>
                                        <div className="font-semibold text-sm">{t.name}</div>
                                        <div className="text-teal-400 text-xs">{t.cancer}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            href="/about"
                            onClick={() => setPage("about")}
                            className="inline-block text-teal-300 border border-teal-600 px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
                        >
                            Meet All Our Patients →
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center max-w-3xl mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-4">Begin Your Healing Journey Today</h2>
                <p className="text-slate-500 mb-8">Register, get assigned a specialist, and start your personalised cancer care plan — all from one secure platform.</p>
                <Link
                    href="/register"
                    onClick={() => setPage("register")}
                    className="inline-block bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors text-lg shadow-teal-glow"
                >
                    Register Now — It's Free
                </Link>
            </section>
        </div>
    );
}