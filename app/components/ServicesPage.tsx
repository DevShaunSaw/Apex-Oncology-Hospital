"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { services, doctors as mockDoctors } from "../data/mockData";
import { MessageSquare, Star, GraduationCap, Clock, Building2, Stethoscope } from "lucide-react";
import { HOSPITAL_DEPARTMENTS } from "@/lib/departments";

export default function ServicesPage() {
    const { setPage } = useApp();
    const [doctorsList, setDoctorsList] = useState<any[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>("all");
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        fetch("/api/doctors")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.doctors) && data.doctors.length > 0) {
                    setDoctorsList(data.doctors);
                } else {
                    setDoctorsList(mockDoctors);
                }
            })
            .catch(() => {
                setDoctorsList(mockDoctors);
            })
            .finally(() => setLoadingDoctors(false));
    }, []);

    const filteredDoctors = doctorsList.filter(doc => {
        if (selectedDept === "all") return true;
        return (doc.department || doc.specialty) === selectedDept;
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-16 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-display mb-3">Our Services &amp; Specialists</h1>
                <p className="text-teal-200 max-w-xl mx-auto text-lg">Precision oncology &amp; comprehensive multi-specialty clinical care</p>
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

            {/* Meet Our Specialists — Brochure Style Grouped by Department */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-3">
                        <Stethoscope size={13} /> Meet Our Specialists
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-display text-teal-950 mb-3">Expertise That Inspires Confidence</h2>
                    <p className="text-slate-500 text-sm sm:text-base">Dedicated specialists. United by one purpose, your well-being.</p>
                </div>

                {/* Department Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
                    <button
                        onClick={() => setSelectedDept("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedDept === "all"
                                ? "bg-teal-700 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        All Departments ({doctorsList.length})
                    </button>
                    {HOSPITAL_DEPARTMENTS.map(dept => {
                        const count = doctorsList.filter(d => (d.department || d.specialty) === dept).length;
                        if (count === 0 && selectedDept !== dept) return null;
                        return (
                            <button
                                key={dept}
                                onClick={() => setSelectedDept(dept)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                    selectedDept === dept
                                        ? "bg-teal-700 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {dept.replace("Department of ", "")} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Specialists Grid */}
                {loadingDoctors ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Loading specialists directory...
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100">
                        No specialists found for this department.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map(doc => {
                            const initials = doc.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "DR";
                            return (
                                <div
                                    key={doc.id || doc._id}
                                    className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 hover:shadow-card-hover hover:border-teal-200 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start gap-3.5 mb-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 text-base leading-tight truncate">{doc.name}</div>
                                                <div className="text-xs font-semibold text-teal-700 mt-0.5 line-clamp-1">{doc.position || "Specialist Consultant"}</div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Building2 size={11} className="shrink-0" />
                                                    <span className="truncate">{doc.department || doc.specialty || "General Oncology"}</span>
                                                </div>
                                                {doc.yoe && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/70">
                                                        ⭐ {doc.yoe} Experience
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {doc.degree && (
                                            <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 font-medium flex items-start gap-2 mb-2.5 border border-slate-100">
                                                <GraduationCap size={14} className="text-teal-600 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{doc.degree}</span>
                                            </div>
                                        )}

                                        {doc.experience && (
                                            <div className="text-xs text-slate-500 flex items-start gap-2 px-1 mb-3">
                                                <Clock size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{doc.experience}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${doc.available !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                {doc.available !== false ? "✓ Available for Consultation" : "Currently Offline"}
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                                <Star size={12} fill="currentColor" /> {doc.rating || 4.9}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setPage("chat")}
                                            className="w-full bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all border border-teal-200 hover:border-transparent flex items-center justify-center gap-1.5"
                                        >
                                            <MessageSquare size={13} />
                                            Consult Specialist
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}