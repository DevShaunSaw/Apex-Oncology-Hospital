"use client";
import { useApp } from "../context/AppContext";
import { services, doctors } from "../data/mockData";
import { MessageSquare, Star } from "lucide-react";

export default function ServicesPage() {
    const { setPage } = useApp();
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-16 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-display mb-3">Our Services</h1>
                <p className="text-teal-200 max-w-xl mx-auto text-lg">Precision oncology care — from diagnosis to full recovery</p>
            </div>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map(s => (
                        <div key={s.title} className="group bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:border-teal-200 hover:shadow-card-hover transition-all cursor-pointer">
                            <div className="text-4xl mb-4">{s.icon}</div>
                            <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{s.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                            <button onClick={() => setPage("chat")} className="mt-4 text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
                                <MessageSquare size={13} /> Ask a specialist
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Integrative Healing — feature section */}
            <section className="bg-gradient-to-br from-teal-50 to-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">🌿 Signature Programme</div>
                            <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-4">Chemo-Retention &amp; the Science of Healing</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Our integrated approach merges evidence-based chemotherapy protocols with cutting-edge research in cellular healing. We don't just treat cancer — we help your entire being recover.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Precision chemotherapy dosing tailored to genetic profile",
                                    "Nutritional oncology to support treatment efficacy",
                                    "Mind-body practices proven to reduce side effects",
                                    "Post-treatment rehabilitation and resilience programme",
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                                        <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shrink-0 mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => setPage("register")} className="mt-8 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">
                                Enroll in This Programme
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[["🧬", "Genetic Profiling", "Personalised dosing"], ["🌿", "Holistic Care", "Mind-body healing"], ["📊", "Data-Driven", "Real-time monitoring"], ["💊", "Smart Dosing", "Minimal side effects"]].map(([icon, title, sub]) => (
                                <div key={title} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 text-center">
                                    <div className="text-3xl mb-2">{icon}</div>
                                    <div className="font-semibold text-slate-700 text-sm">{title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Doctors */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
                <h2 className="text-3xl font-display text-teal-900 text-center mb-2">Specialist Oncologists</h2>
                <p className="text-slate-500 text-center mb-10">Connect directly with your assigned specialist through the platform</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {doctors.map(doc => (
                        <div key={doc.id} className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 hover:shadow-card-hover hover:border-teal-100 transition-all">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">{doc.image}</div>
                                <div className="font-semibold text-slate-800">{doc.name}</div>
                                <div className="text-sm text-teal-600">{doc.specialty}</div>
                                <div className="flex items-center justify-center gap-1 text-sm text-amber-500 mt-1">
                                    <Star size={13} fill="currentColor" /> {doc.rating}
                                </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-500">
                                <div className="flex justify-between"><span>Experience</span><span className="font-medium text-slate-700">{doc.experience}</span></div>
                                <div className="flex justify-between"><span>Patients</span><span className="font-medium text-slate-700">{doc.patients}+</span></div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {doc.languages.map(l => <span key={l} className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">{l}</span>)}
                                </div>
                            </div>
                            <div className={`mt-3 px-2 py-1.5 rounded-xl text-xs font-medium text-center ${doc.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {doc.available ? "✓ Available for Consultation" : "Currently Unavailable"}
                            </div>
                            <button onClick={() => setPage("chat")} className="w-full mt-3 border border-teal-200 text-teal-700 py-2 rounded-xl text-xs font-medium hover:bg-teal-50 transition-colors">
                                Send Message
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}