"use client";
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
                                <button onClick={() => setPage("register")} className="flex items-center gap-2 bg-white text-teal-800 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all shadow-lg">
                                    Get Started <ArrowRight size={18} />
                                </button>
                                <button onClick={() => setPage("services")} className="flex items-center gap-2 border border-teal-400/50 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700/50 transition-all">
                                    Our Services <ChevronRight size={18} />
                                </button>
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
                                            { label: "Overall Recovery", value: "Positive", progress: 68 },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-teal-200">{item.label}</span>
                                                    <span className="font-medium">{item.value}</span>
                                                </div>
                                                <div className="h-2 bg-teal-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-teal-300 rounded-full" style={{ width: `${item.progress}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                                        {[["Next Visit", "May 22"], ["Doctor", "Dr. Sharma"], ["Package", "Care Plus"]].map(([k, v]) => (
                                            <div key={k}>
                                                <div className="text-xs text-teal-300">{k}</div>
                                                <div className="text-sm font-semibold">{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-teal-500 rounded-xl px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-2">
                                    <Heart size={14} /> 1,200+ Patients Treated
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L1440 60L1440 0C1200 40 900 60 720 40C540 20 240 0 0 30L0 60Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { value: "1,200+", label: "Patients Treated", icon: Users },
                        { value: "4.9★", label: "Patient Rating", icon: Star },
                        { value: "24/7", label: "Doctor Access", icon: Clock },
                        { value: "100%", label: "Data Security", icon: Shield },
                    ].map(({ value, label, icon: Icon }) => (
                        <div key={label} className="text-center p-6 rounded-2xl bg-teal-50 border border-teal-100">
                            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Icon size={22} className="text-white" />
                            </div>
                            <div className="text-2xl font-display font-semibold text-teal-800">{value}</div>
                            <div className="text-sm text-slate-500 mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Apex */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-3">Why Choose Apex Onco Care?</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">An integrated approach combining the precision of modern oncology with the wisdom of holistic healing.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: "🧬", title: "Expert Oncologists", desc: "Board-certified specialists in medical, surgical, and radiation oncology with 15+ years average experience." },
                            { icon: "💬", title: "Direct Doctor Chat", desc: "Real-time, secure communication with your assigned oncologist — no phone trees, no delays." },
                            { icon: "🌿", title: "Integrated Healing", desc: "Combining chemotherapy science with nutrition, mindfulness, and integrative therapies for whole-body recovery." },
                            { icon: "🌐", title: "Multilingual Support", desc: "Available in 8 Indian languages — because your health journey should never be lost in translation." },
                            { icon: "📊", title: "Treatment Transparency", desc: "Full access to your diagnosis, treatment timeline, lab reports, and imaging in one secure dashboard." },
                            { icon: "👨‍👩‍👧", title: "Family Involvement", desc: "Dedicated family access to stay informed and involved at every stage of the treatment journey." },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-transparent hover:border-teal-100">
                                <div className="text-3xl mb-4">{icon}</div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet Doctors */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-display text-teal-900">Our Oncologists</h2>
                        <p className="text-slate-500 mt-1">Specialists dedicated to your recovery</p>
                    </div>
                    <button onClick={() => setPage("services")} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></button>
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
                        <button onClick={() => setPage("about")} className="text-teal-300 border border-teal-600 px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium">
                            Meet All Our Patients →
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center max-w-3xl mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-4">Begin Your Healing Journey Today</h2>
                <p className="text-slate-500 mb-8">Register, get assigned a specialist, and start your personalised cancer care plan — all from one secure platform.</p>
                <button onClick={() => setPage("register")} className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors text-lg shadow-teal-glow">
                    Register Now — It's Free
                </button>
            </section>
        </div>
    );
}