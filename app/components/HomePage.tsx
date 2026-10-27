"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import {
    ArrowRight,
    Shield,
    Clock,
    Users,
    Star,
    ChevronRight,
    Heart,
    Activity,
    Check,
    Stethoscope,
    Building2,
    Sparkles,
    Microscope,
    HeartHandshake,
    Phone,
    MapPin,
    Calendar,
    Search,
    Award,
    Zap,
    MessageSquare,
    GraduationCap,
    SlidersHorizontal,
    Wind,
    CheckCircle2
} from "lucide-react";
import { testimonials, packages as diagnosticPackages, doctors as fallbackDoctors } from "../data/mockData";
import { HOSPITAL_DEPARTMENTS } from "@/lib/departments";

export default function HomePage() {
    const { setPage, isLoggedIn, role, loading } = useApp();
    const router = useRouter();

    // Doctors state
    const [doctorsList, setDoctorsList] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedPositionLevel, setSelectedPositionLevel] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"position" | "experience" | "name">("position");
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        if (!loading && isLoggedIn && role) {
            router.replace(`/${role}-dashboard`);
        }
    }, [loading, isLoggedIn, role, router]);

    // Fetch dynamic doctors from database
    useEffect(() => {
        fetch("/api/doctors")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.doctors) && data.doctors.length > 0) {
                    setDoctorsList(data.doctors);
                } else {
                    setDoctorsList(fallbackDoctors);
                }
            })
            .catch(() => {
                setDoctorsList(fallbackDoctors);
            })
            .finally(() => setLoadingDoctors(false));
    }, []);

    // Position rank scoring for hierarchical sorting
    const getPositionRank = (position: string = "") => {
        const p = position.toLowerCase();
        if (p.includes("head") || p.includes("chief") || p.includes("professor")) return 1;
        if (p.includes("lead") || p.includes("senior")) return 2;
        if (p.includes("consultant")) return 3;
        if (p.includes("specialist") || p.includes("fellow")) return 4;
        return 5;
    };

    const parseYoENumber = (doc: any) => {
        const str = doc.yoe || doc.experience || "";
        const m = str.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
    };

    // Filter and sort doctors
    const filteredDoctors = useMemo(() => {
        return doctorsList.filter(doc => {
            // Department filter
            if (selectedDepartment !== "all") {
                const dept = doc.department || doc.specialty || "";
                if (dept !== selectedDepartment) return false;
            }

            // Position level filter
            if (selectedPositionLevel !== "all") {
                const rank = getPositionRank(doc.position);
                if (selectedPositionLevel === "head" && rank !== 1) return false;
                if (selectedPositionLevel === "senior" && rank !== 2) return false;
                if (selectedPositionLevel === "consultant" && rank !== 3) return false;
                if (selectedPositionLevel === "fellow" && rank !== 4) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const nameMatch = doc.name?.toLowerCase().includes(q);
                const deptMatch = (doc.department || doc.specialty)?.toLowerCase().includes(q);
                const posMatch = doc.position?.toLowerCase().includes(q);
                const degMatch = doc.degree?.toLowerCase().includes(q);
                const expMatch = doc.experience?.toLowerCase().includes(q);
                return nameMatch || deptMatch || posMatch || degMatch || expMatch;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === "position") {
                const rankA = getPositionRank(a.position);
                const rankB = getPositionRank(b.position);
                if (rankA !== rankB) return rankA - rankB;
                return parseYoENumber(b) - parseYoENumber(a);
            }
            if (sortBy === "experience") {
                return parseYoENumber(b) - parseYoENumber(a);
            }
            if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "");
            }
            return 0;
        });
    }, [doctorsList, selectedDepartment, selectedPositionLevel, sortBy, searchQuery]);

    if (loading || (isLoggedIn && role)) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Redirecting to your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ─────────────────────────────────────────────────────────────────────────────
                HERO: WELCOME TO APEX CONNECT
            ───────────────────────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-indigo-950 text-white">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle at 20% 80%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, white 1.5px, transparent 1.5px)",
                        backgroundSize: "48px 48px"
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6 text-teal-200">
                            <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                            Unified Healthcare Ecosystem
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light leading-tight mb-6">
                            Welcome to <br />
                            <span className="font-bold bg-gradient-to-r from-teal-200 via-white to-amber-200 bg-clip-text text-transparent">
                                Apex Connect
                            </span>
                        </h1>

                        <p className="text-teal-100 text-base sm:text-lg lg:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
                            Bringing Advanced Tertiary Cancer Treatment, NABL-Accredited Precision Diagnostics, and Holistic Rehabilitation under one unified healthcare roof.
                        </p>

                        {/* Three Core Verticals Quick-Jump Cards */}
                        <div className="grid sm:grid-cols-3 gap-4 text-left mb-10">
                            {/* Brand 1: Apex Superspeciality Cancer Hospital */}
                            <a
                                href="#hospital-section"
                                className="group bg-white/10 hover:bg-white/15 backdrop-blur border border-white/15 hover:border-teal-300/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 block shadow-lg"
                            >
                                <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-300 mb-3 group-hover:scale-110 transition-transform">
                                    <Building2 size={20} />
                                </div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">Brand 01</div>
                                <h3 className="font-bold text-white text-base leading-snug group-hover:text-teal-200 transition-colors">
                                    Apex Superspeciality Cancer Hospital
                                </h3>
                                <p className="text-xs text-teal-100/80 mt-1 line-clamp-2">
                                    Advanced surgical oncology, TMH-trained faculty, India's best AQI, and hybrid OT-Cathlab.
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs text-teal-300 font-semibold mt-3 group-hover:underline">
                                    Explore Hospital Care →
                                </span>
                            </a>

                            {/* Brand 2: Apex Diagnostics (Exclusive Packages Provider) */}
                            <a
                                href="#diagnostics-section"
                                className="group bg-white/10 hover:bg-white/15 backdrop-blur border border-white/15 hover:border-amber-300/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 block shadow-lg"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
                                    <Microscope size={20} />
                                </div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                                    Brand 02 · Exclusive Packages
                                </div>
                                <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-200 transition-colors">
                                    Apex Diagnostics
                                </h3>
                                <p className="text-xs text-teal-100/80 mt-1 line-clamp-2">
                                    NABL Pathology, 3T MRI, High-Res CT, and exclusive diagnostic screening packages.
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-semibold mt-3 group-hover:underline">
                                    View Packages &amp; Labs →
                                </span>
                            </a>

                            {/* Brand 3: Apex Rehabilitation Service */}
                            <a
                                href="#rehab-section"
                                className="group bg-white/10 hover:bg-white/15 backdrop-blur border border-white/15 hover:border-emerald-300/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 block shadow-lg"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-110 transition-transform">
                                    <HeartHandshake size={20} />
                                </div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">Brand 03</div>
                                <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-200 transition-colors">
                                    Apex Rehabilitation Service
                                </h3>
                                <p className="text-xs text-teal-100/80 mt-1 line-clamp-2">
                                    Physiotherapy, dietetics, ozone therapy, chakra &amp; sound wellness, and limb salvage.
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-semibold mt-3 group-hover:underline">
                                    Discover Healing →
                                </span>
                            </a>
                        </div>

                        {/* Top Action CTAs */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/register"
                                onClick={() => setPage("register")}
                                className="flex items-center gap-2 bg-white text-teal-900 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg"
                            >
                                Get Started on Apex Connect <ArrowRight size={17} />
                            </Link>
                            <a
                                href="#specialists-directory"
                                className="flex items-center gap-2 border border-teal-400/50 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-800/40 transition-all"
                            >
                                <Stethoscope size={17} /> View Specialists &amp; Departments
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats Banner */}
            <div className="bg-slate-50 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-2xl sm:text-3xl font-display font-bold text-teal-800">37+</div>
                            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Specialist Oncologists &amp; Surgeons</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-display font-bold text-teal-800">11</div>
                            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Clinical &amp; Diagnostic Departments</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-display font-bold text-teal-800">1st in India</div>
                            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Cancer Hospital with Best AQI</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-display font-bold text-teal-800">24/7</div>
                            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Unified Oncology Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────
                SECTION 1: APEX SUPERSPECIALITY CANCER HOSPITAL
            ───────────────────────────────────────────────────────────────────────────── */}
            <section id="hospital-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="bg-gradient-to-br from-teal-900 to-indigo-950 rounded-3xl text-white p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-teal-500/30 border border-teal-400/40 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200 mb-4">
                            <Building2 size={14} /> Apex Superspeciality Cancer Hospital
                        </div>

                        <div className="max-w-3xl">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light leading-tight mb-4">
                                A New Era in <br />
                                <span className="font-bold text-teal-200">Comprehensive Cancer Care</span>
                            </h2>
                            <p className="text-xl sm:text-2xl text-amber-200 font-serif italic mb-4">
                                &ldquo;Cancer. It&apos;s a state, not a statement.&rdquo;
                            </p>
                            <p className="text-teal-100 text-sm sm:text-base leading-relaxed mb-6">
                                Advanced • Accessible • Affordable. Bringing precision surgical care, medical oncology, systemic immunotherapy, and compassionate healing under one roof in Mumbai.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-teal-200 mb-8 pt-2 border-t border-white/10">
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-amber-300 shrink-0" />
                                    3rd Flr, 301 Meraki Arena, Above Croma, Sion-Trombay Road, Chembur, Mumbai - 400071
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-amber-300 shrink-0" />
                                    +91 9892 474 368
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/appointments"
                                    onClick={() => setPage("appointments")}
                                    className="bg-white text-teal-900 hover:bg-teal-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                                >
                                    <Calendar size={16} /> Book OPD Appointment
                                </Link>
                                <a
                                    href="#specialists-directory"
                                    className="border border-teal-300/60 hover:bg-teal-800/40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                                >
                                    <Stethoscope size={16} /> View Hospital Doctors
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hospital Key Highlights & Infrastructure */}
                <div className="mb-14">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Hospital Infrastructure &amp; Faculty</span>
                        <h3 className="text-2xl sm:text-3xl font-display text-slate-900 mt-1">Highlights of Apex Onco Care</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                                    <Wind size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-2">India&apos;s Best AQI Cancer Hospital</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Engineered with state-of-the-art medical grade HEPA filtration and climate airflow to maintain India&apos;s cleanest Air Quality Index for immunocompromised oncology patients.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                                <CheckCircle2 size={14} /> Ultra-Clean Healing Environment
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                                    <Award size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-2">Tata Memorial Trained Faculty</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Headed by Dr. Amit M. Gupta (Maharashtra Ratna Awardee) and premier surgical oncologists, medical oncologists, and pathologists trained at Tata Memorial Hospital.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
                                <CheckCircle2 size={14} /> Evidence-Based Multidisciplinary Care
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                                    <Zap size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-2">First Fully Equipped Hybrid OT-Cathlab</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    India&apos;s first hybrid operating suite combining complex surgical capabilities with high-precision interventional Cath Lab angiography for minimally invasive tumor treatment.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                                <CheckCircle2 size={14} /> Advanced Onco-Surgical Facilities
                            </div>
                        </div>
                    </div>
                </div>

                {/* OPD & IPD Services (from handwritten notes) */}
                <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 mb-14">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="inline-block bg-teal-100 text-teal-800 font-semibold text-xs px-3 py-1 rounded-full mb-3">
                                Hospital OPD &amp; IPD Services
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                Seamless Patient Visits &amp; Inpatient Admissions
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                As outlined in our hospital care flow, patients benefit from streamlined OPD visits with scheduled doctor slots and direct IPD admission desk assistance.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-teal-600 shrink-0" />
                                    <strong>OPD Appointments:</strong> Specialist consultations, second opinions &amp; tumor boards
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-teal-600 shrink-0" />
                                    <strong>IPD Services:</strong> Direct admission desk, specialized onco-nursing &amp; ICU
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-teal-600 shrink-0" />
                                    <strong>Transparent Billing:</strong> Pre-approved cashless insurance &amp; clear treatment estimates
                                </li>
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { title: "Daycare Chemotherapy", desc: "Short stay infusion suites" },
                                { title: "Dialysis Centre", desc: "Onco-nephrology support" },
                                { title: "Dedicated ICU", desc: "24/7 Intensivist monitoring" },
                                { title: "Laparoscopic Suites", desc: "Minimally invasive recovery" },
                            ].map(f => (
                                <div key={f.title} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                                    <div className="font-bold text-slate-800 text-sm">{f.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Organ-Specific Cancer Programs */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                        Cancer-Specific Treatments &amp; Programs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Breast Cancer",
                            "Lung Cancer",
                            "Head & Neck Cancer",
                            "Liver & Pancreatic Cancer",
                            "Colon & Gastrointestinal Tumors",
                            "Blood & Bone Cancer (CAR-T)",
                            "Uro-Oncology (Prostate & Bladder)",
                            "Gynaecological Cancers",
                            "Spine & Bone Sarcoma",
                            "Neuro Tumors",
                            "Oesophageal / Food Pipe Cancer",
                            "Palliative & Pain Management"
                        ].map(c => (
                            <span
                                key={c}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200/60 text-slate-700 text-xs font-semibold transition-colors"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────────────────────
                SECTION 2: APEX DIAGNOSTICS (EXCLUSIVELY OFFERS PACKAGES)
            ───────────────────────────────────────────────────────────────────────────── */}
            <section id="diagnostics-section" className="py-20 bg-slate-50/70 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Brand Banner */}
                    <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 bg-amber-500/30 border border-amber-300/40 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200 mb-4">
                                <Microscope size={14} /> Apex Diagnostics · NABL-Accredited Labs
                            </div>

                            <div className="max-w-3xl">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light leading-tight mb-4">
                                    Precision Diagnostics &amp; <br />
                                    <span className="font-bold text-amber-200">Advanced Imaging</span>
                                </h2>
                                <p className="text-amber-100 text-sm sm:text-base leading-relaxed mb-6">
                                    Accurate and early detection changes survival rates. Apex Diagnostics brings together advanced Histopathology, Molecular Oncology, 3T MRI, Multi-Slice CT, and Cath Lab image-guided interventions.
                                </p>

                                <div className="bg-amber-950/50 border border-amber-400/30 rounded-2xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Zap size={20} className="text-amber-300 shrink-0 mt-0.5" />
                                        <div className="text-xs sm:text-sm text-amber-100">
                                            <strong className="text-white block mb-0.5">Exclusive Health &amp; Screening Packages Provider</strong>
                                            All preventive health checkups, cancer screening packages, and diagnostic panels are exclusively offered, managed, and fulfilled under <strong>Apex Diagnostics</strong>.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/packages"
                                        onClick={() => setPage("packages")}
                                        className="bg-amber-400 text-slate-950 hover:bg-amber-300 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Zap size={16} /> Explore Apex Diagnostics Packages
                                    </Link>
                                    <button
                                        onClick={() => setPage("chat")}
                                        className="border border-amber-300/60 hover:bg-amber-900/40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                                    >
                                        <MessageSquare size={16} /> Inquire About Lab Tests
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pathology & Radiology Offerings */}
                    <div className="grid md:grid-cols-2 gap-8 mb-14">
                        {/* Pathology */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                    🔬
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Histopathology &amp; Clinical Pathology</h3>
                                    <div className="text-xs text-purple-700 font-semibold">Led by Dr. Pranjali A. Gupta (Tata Memorial Trained)</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                Outlook Best Doctors Mumbai 2026 recognized. Comprehensive tissue diagnosis, frozen sections, liquid biopsies, and hematology.
                            </p>
                            <ul className="space-y-2 text-xs text-slate-700">
                                <li className="flex items-center gap-2"><Check size={14} className="text-purple-600" /> High-precision Histopathology &amp; Biopsy review</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-purple-600" /> Immunohistochemistry (IHC) &amp; Molecular markers</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-purple-600" /> Complete Clinical Hematology &amp; Cytopathology</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-purple-600" /> Digital report access directly in patient portal</li>
                            </ul>
                        </div>

                        {/* Radiology */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                    🩻
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Radiology &amp; Interventional Imaging</h3>
                                    <div className="text-xs text-blue-700 font-semibold">Headed by Dr. Shashikant Yadav &amp; Dr. Amit Sahu</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                Complete cross-sectional radiology with 3T MRI, Multi-Slice CT, and Cath Lab image-guided tumor ablation.
                            </p>
                            <ul className="space-y-2 text-xs text-slate-700">
                                <li className="flex items-center gap-2"><Check size={14} className="text-blue-600" /> 3T MRI &amp; High-Resolution CT Scans</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-blue-600" /> Digital Mammography &amp; 4D Doppler Ultrasound</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-blue-600" /> Minimally Invasive Tumor Ablation &amp; Embolization</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-blue-600" /> Image-guided core biopsies with zero radiation leak</li>
                            </ul>
                        </div>
                    </div>

                    {/* Diagnostic Packages Section (Exclusive under Apex Diagnostics) */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                            <div>
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Exclusive Packages</span>
                                <h3 className="text-2xl sm:text-3xl font-display text-slate-900 mt-1">
                                    Apex Diagnostics Care &amp; Screening Packages
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                    Transparent fixed-price packages. Note: Packages are available only under Apex Diagnostics.
                                </p>
                            </div>
                            <Link
                                href="/packages"
                                onClick={() => setPage("packages")}
                                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group shrink-0"
                            >
                                View All 4 Packages in Detail <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {diagnosticPackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                                        pkg.color === "teal-dark" ? "border-amber-400 shadow-xs" : "border-slate-200"
                                    }`}
                                >
                                    <div>
                                        {pkg.tag && (
                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
                                                {pkg.tag}
                                            </span>
                                        )}
                                        <h4 className="font-bold text-slate-900 text-base mb-1">{pkg.name}</h4>
                                        <div className="text-xs text-slate-400 mb-3">Provided by Apex Diagnostics</div>
                                        <div className="text-2xl font-bold text-slate-900 mb-4">
                                            {pkg.currency}{pkg.price.toLocaleString("en-IN")}
                                            <span className="text-xs font-normal text-slate-500"> / {pkg.period}</span>
                                        </div>

                                        <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                                            {pkg.features.slice(0, 4).map(f => (
                                                <li key={f} className="flex items-start gap-1.5">
                                                    <Check size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href="/packages"
                                        onClick={() => setPage("packages")}
                                        className={`w-full text-center py-2 rounded-xl text-xs font-bold transition-colors ${
                                            pkg.color === "teal-dark"
                                                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                                        }`}
                                    >
                                        Select Package
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────────────────────
                SECTION 3: APEX REHABILITATION SERVICE (AND HOLISTIC WELLNESS)
            ───────────────────────────────────────────────────────────────────────────── */}
            <section id="rehab-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-4">
                            <HeartHandshake size={14} /> Apex Rehabilitation Service
                        </div>

                        <div className="max-w-3xl">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light leading-tight mb-4">
                                Rehabilitation, Aesthetics &amp; <br />
                                <span className="font-bold text-emerald-200">Holistic Wellness Center</span>
                            </h2>
                            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
                                Healing doesn&apos;t stop with surgery or chemo. We nurture physical endurance, cellular rejuvenation, nutritional vitality, and deep spiritual well-being through modern rehabilitation and integrative therapies.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/appointments"
                                    onClick={() => setPage("appointments")}
                                    className="bg-white text-emerald-950 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                                >
                                    <Calendar size={16} /> Schedule Rehab Consultation
                                </Link>
                                <button
                                    onClick={() => setPage("chat")}
                                    className="border border-emerald-300/60 hover:bg-emerald-800/40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                                >
                                    <MessageSquare size={16} /> Consult Holistic Therapist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6 Key Pillars from Handwritten Notes & Brochure */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Pillar 1: Physiotherapy */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                            🏃
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Physiotherapy &amp; Musculoskeletal Rehab</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Targeted post-operative mobilization, lymphedema therapy, orthopedic rehabilitation, and cancer fatigue management directed by specialist physical therapists.
                        </p>
                    </div>

                    {/* Pillar 2: Clinical Nutrition & Dietetics */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                            🥗
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Cancer Nutrition &amp; Dietetics</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Personalized nutrition plans to preserve lean muscle, counteract chemo-induced nausea, and optimize immunity through precision oncology dietetics.
                        </p>
                    </div>

                    {/* Pillar 3: Medical Ozone Therapy */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold mb-4">
                            💨
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Medical Ozone Therapy</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Cellular oxygenation protocols to combat chronic inflammation, elevate tissue oxygen levels, and support systemic physiological recovery.
                        </p>
                    </div>

                    {/* Pillar 4: Holistic Wellness Center */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4">
                            🧘
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Holistic Wellness Center</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                            Integrative healing protocols documented in our center: Mind-Body consultations, Chakra wellness &amp; alignment, Crystal healing, and Sound frequency therapy.
                        </p>
                        <div className="flex flex-wrap gap-1 text-[10px] text-purple-700 font-semibold">
                            <span className="bg-purple-50 px-2 py-0.5 rounded-md">Sound Therapy</span>
                            <span className="bg-purple-50 px-2 py-0.5 rounded-md">Crystal Healing</span>
                            <span className="bg-purple-50 px-2 py-0.5 rounded-md">Chakra Wellness</span>
                        </div>
                    </div>

                    {/* Pillar 5: Diabetic Foot & Limb Salvage */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
                            🦶
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Diabetic Foot &amp; Limb Salvage</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Specialized advanced wound care, non-healing ulcer healing, diabetic neuropathy intervention, and limb preservation reconstructive protocols.
                        </p>
                    </div>

                    {/* Pillar 6: Aesthetics (Sculp & Derma) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-4">
                            💆
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1.5">Aesthetics (Sculp &amp; Derma)</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Oncology-safe scalp restorative treatments, hair follicle regeneration support, reconstructive derma aesthetics, and post-radiation scar healing.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────────────────────
                DYNAMIC SPECIALISTS DIRECTORY: VIEW DOCTORS & DEPARTMENTS ACCORDING TO POSITIONS
            ───────────────────────────────────────────────────────────────────────────── */}
            <section id="specialists-directory" className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 mb-3">
                            <Stethoscope size={13} /> Dynamic Specialists Directory
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display text-slate-900 mb-2">
                            Meet Our Medical Specialists
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            View all specialists across clinical departments ordered dynamically by their leadership positions and years of experience (YoE).
                        </p>
                    </div>

                    {/* Interactive Filter Controls */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search bar */}
                            <div className="relative sm:col-span-2">
                                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search doctor by name, position, degree, or specialty..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50/50"
                                />
                            </div>

                            {/* Position Level Filter */}
                            <div>
                                <select
                                    value={selectedPositionLevel}
                                    onChange={e => setSelectedPositionLevel(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
                                >
                                    <option value="all">All Position Levels</option>
                                    <option value="head">Department Heads &amp; Chief</option>
                                    <option value="senior">Senior &amp; Lead Consultants</option>
                                    <option value="consultant">Specialist Consultants</option>
                                    <option value="fellow">Fellows &amp; Associates</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as any)}
                                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
                                >
                                    <option value="position">Sort by Position Hierarchy</option>
                                    <option value="experience">Sort by Experience (YoE High to Low)</option>
                                    <option value="name">Sort by Name (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Department Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setSelectedDepartment("all")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                    selectedDepartment === "all"
                                        ? "bg-teal-700 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                All Departments ({doctorsList.length})
                            </button>
                            {HOSPITAL_DEPARTMENTS.map(dept => {
                                const count = doctorsList.filter(d => (d.department || d.specialty) === dept).length;
                                return (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDepartment(dept)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                            selectedDepartment === dept
                                                ? "bg-teal-700 text-white shadow-xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {dept.replace("Department of ", "")} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Specialists Grid */}
                    {loadingDoctors ? (
                        <div className="py-20 text-center text-slate-400 text-sm">
                            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Loading specialists directory...
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
                            No doctors found matching your filter criteria.
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredDoctors.map(doc => {
                                const initials = doc.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "DR";
                                const isHead = doc.position?.toLowerCase().includes("head") || doc.position?.toLowerCase().includes("chief");

                                return (
                                    <div
                                        key={doc.id || doc._id}
                                        className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                                            isHead
                                                ? "border-teal-300 ring-2 ring-teal-100 shadow-xs"
                                                : "border-slate-200/80"
                                        }`}
                                    >
                                        <div>
                                            {/* Header with avatar, name, position badge */}
                                            <div className="flex items-start gap-3.5 mb-3">
                                                <div
                                                    className={`w-12 h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${
                                                        isHead
                                                            ? "bg-gradient-to-br from-amber-600 to-teal-800"
                                                            : "bg-gradient-to-br from-teal-700 to-slate-800"
                                                    }`}
                                                >
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 text-base leading-tight truncate">
                                                        {doc.name}
                                                    </div>
                                                    <div className="text-xs font-semibold text-teal-700 mt-0.5 line-clamp-1">
                                                        {doc.position || "Specialist Consultant"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                        <Building2 size={11} className="shrink-0" />
                                                        <span className="truncate">{doc.department || doc.specialty || "Oncology"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* YoE and Leadership Badges */}
                                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                {doc.yoe && (
                                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70">
                                                        ⭐ {doc.yoe} Experience
                                                    </span>
                                                )}
                                                {isHead && (
                                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                                                        👑 Leadership
                                                    </span>
                                                )}
                                            </div>

                                            {/* Degree */}
                                            {doc.degree && (
                                                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 font-medium flex items-start gap-2 mb-2.5 border border-slate-100">
                                                    <GraduationCap size={14} className="text-teal-600 shrink-0 mt-0.5" />
                                                    <span className="leading-snug">{doc.degree}</span>
                                                </div>
                                            )}

                                            {/* Experience / Timings */}
                                            {doc.experience && (
                                                <div className="text-xs text-slate-500 flex items-start gap-2 px-1 mb-3">
                                                    <Clock size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="leading-snug line-clamp-2">{doc.experience}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer action */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-3 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                                                    doc.available !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {doc.available !== false ? "✓ Available for Consultation" : "Offline"}
                                                </span>
                                                <span className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                                                    <Star size={12} fill="currentColor" /> {doc.rating || 4.9}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setPage("chat")}
                                                    className="w-full bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all border border-teal-200 hover:border-transparent flex items-center justify-center gap-1"
                                                >
                                                    <MessageSquare size={13} /> Chat
                                                </button>
                                                <Link
                                                    href="/appointments"
                                                    onClick={() => setPage("appointments")}
                                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 text-center"
                                                >
                                                    <Calendar size={13} /> Book Slot
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────────────────────
                TESTIMONIALS & HOSPITAL CONTACT FOOTER
            ───────────────────────────────────────────────────────────────────────────── */}
            <section className="bg-teal-950 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-display mb-2">Voices of Healing</h2>
                        <p className="text-teal-300 text-sm">Real patient experiences from Apex Connect hospital and diagnostics</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {testimonials.map(t => (
                            <div key={t.id} className="bg-teal-900/60 border border-teal-800 rounded-2xl p-5">
                                <div className="flex text-amber-400 mb-3 text-sm">{"★".repeat(t.rating)}</div>
                                <p className="text-teal-100 text-xs sm:text-sm leading-relaxed mb-4 italic">
                                    &ldquo;{t.text.slice(0, 130)}…&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-xs text-white">{t.name}</div>
                                        <div className="text-teal-300 text-[11px]">{t.cancer}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hospital Address and Inauguration */}
                    <div className="mt-12 pt-8 border-t border-teal-800 text-center text-xs text-teal-300 space-y-2">
                        <p className="font-semibold text-white text-sm">
                            Apex Superspeciality Cancer Hospital · Apex Diagnostics · Apex Rehabilitation Service
                        </p>
                        <p>
                            3rd Flr, 301 Meraki Arena, Above Croma, Sion - Trombay Road, Chembur, Mumbai - 400071
                        </p>
                        <p className="text-teal-400">
                            Helpline: +91 9892 474 368 | Email: support@apexcancerhospital.com | Web: www.apexcancerhospital.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}