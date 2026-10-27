"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { patientProfile } from "../data/mockData";
import { Calendar, MessageSquare, Activity, FileText, AlertCircle, ChevronRight, TrendingUp, Heart, Clock, Stethoscope } from "lucide-react";
import VitalsHistoryModal from "./VitalsHistoryModal";
import { formatVitalsTimestamp } from "@/lib/dateTime";

export default function PatientDashboard() {
    const { setPage, setActiveChatPartner, currentUser } = useApp();
    const p = patientProfile;
    const [liveSymptoms, setLiveSymptoms] = useState<any[]>([]);
    const [showVitalsHistory, setShowVitalsHistory] = useState(false);
    const [liveVitals, setLiveVitals] = useState<any>({
        bp: "--",
        weight: "--",
        temp: "--",
        pulse: "--",
        lastUpdated: "",
        updatedAt: null,
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const url = currentUser?._id ? `/api/patient?id=${currentUser._id}` : "/api/patient";
                const res = await fetch(url);
                const data = await res.json();
                if (data.success && data.patient) {
                    if (data.patient.recentSymptoms && data.patient.recentSymptoms.length > 0) {
                        setLiveSymptoms([...data.patient.recentSymptoms].reverse());
                    } else {
                        setLiveSymptoms([]);
                    }
                    if (data.patient.vitals) {
                        setLiveVitals({
                            bp: data.patient.vitals.bp || "--",
                            weight: data.patient.vitals.weight || "--",
                            temp: data.patient.vitals.temp || "--",
                            pulse: data.patient.vitals.pulse || "--",
                            lastUpdated: data.patient.vitals.lastUpdated || (data.patient.vitals.bp ? "Recorded" : ""),
                            updatedAt: data.patient.vitals.updatedAt,
                        });
                    } else {
                        setLiveVitals({
                            bp: "--",
                            weight: "--",
                            temp: "--",
                            pulse: "--",
                            lastUpdated: ""
                        });
                    }
                } else {
                    setLiveSymptoms([]);
                }
            } catch {
                setLiveSymptoms([]);
            }
        };
        fetchPatientData();
    }, [currentUser]);

    const displaySymptoms = liveSymptoms;

    const formatSymptomTimestamp = (s: any) => {
        if (s.createdAt) {
            try {
                const d = new Date(s.createdAt);
                if (!isNaN(d.getTime())) {
                    const dayDate = d.toLocaleDateString("en-US", {
                        timeZone: "Asia/Kolkata",
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    });
                    const time = d.toLocaleTimeString("en-US", {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }) + " IST";
                    return { dayDate, time };
                }
            } catch {
                // fall through
            }
        }
        return {
            dayDate: s.date || "Today",
            time: s.time || "Recent",
        };
    };

    return (
        <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white py-8 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
                            {(currentUser?.name || p.name).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold">{currentUser?.name || p.name}</h1>
                            <div className="text-teal-200 text-sm flex flex-wrap gap-3 mt-1">
                                <span>ID: {currentUser?.patientId || p.id}</span>
                                <span>•</span>
                                <span>{currentUser?.disease || p.disease}</span>
                                <span>•</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full">{currentUser?.status || p.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm">
                            <div className="text-teal-200 text-xs mb-0.5">Next Appointment</div>
                            <div className="font-semibold">{p.nextAppointment}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { icon: MessageSquare, label: "Chat Doctor", page: "chat", href: "/chat", color: "teal" },
                        { icon: Calendar, label: "Book Appointment", page: "appointments", href: "/appointments", color: "blue" },
                        { icon: Activity, label: "Symptom Records", page: "symptoms", href: "/symptoms", color: "emerald" },
                        { icon: FileText, label: "My Care Plan", page: "disease-info", href: "/disease-info", color: "amber" },
                    ].map(({ icon: Icon, label, page, href, color }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={() => setPage(page)}
                            className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 hover:shadow-card-hover hover:border-teal-200 transition-all text-left block group"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}-50 group-hover:scale-105 transition-transform`}>
                                <Icon size={20} className={`text-${color}-600`} />
                            </div>
                            <div className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">{label}</div>
                        </Link>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Treatment Progress */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={18} className="text-teal-600" /> Treatment Progress</h3>
                            <Link
                                href="/disease-info"
                                onClick={() => setPage("disease-info")}
                                className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                            >
                                Full Plan <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "Chemotherapy Cycles", current: 2, total: 6, color: "teal" },
                                { label: "Radiation Sessions", current: 5, total: 25, color: "blue" },
                                { label: "Recovery Index", current: 68, total: 100, color: "emerald" },
                            ].map(({ label, current, total, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-600">{label}</span>
                                        <span className="font-semibold text-slate-700">{current}/{total}</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${color}-500 rounded-full transition-all`} style={{ width: `${(current / total) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vitals */}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                        <Activity size={15} className="text-teal-600" />
                                        Latest Body Vitals
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowVitalsHistory(true)}
                                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200 inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                    >
                                        <Clock size={11} /> View History
                                    </button>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {liveVitals.lastUpdated 
                                        ? `Updated: ${formatVitalsTimestamp(liveVitals.lastUpdated, liveVitals.updatedAt)}` 
                                        : "Awaiting clinical recording"}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {[["BP", liveVitals.bp || "--"], ["Pulse", liveVitals.pulse || "--"], ["Temp", liveVitals.temp || "--"], ["Weight", liveVitals.weight || "--"]].map(([k, v]) => (
                                    <div key={k} className="bg-teal-50/70 border border-teal-100/60 rounded-xl p-3 text-center">
                                        <div className="text-xs text-teal-600 font-medium mb-1">{k}</div>
                                        <div className="text-sm font-bold text-teal-900">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        {/* Doctor Card */}
                        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <Heart size={16} className="text-teal-500" /> My Oncologist
                            </h3>
                            {currentUser?.assignedDoctor ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                                            {(currentUser.assignedDoctor.name || "DR")
                                                .replace(/^Dr\.?\s*/i, "")
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase() || "DR"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-slate-800 text-sm truncate">
                                                {currentUser.assignedDoctor.name?.startsWith("Dr.")
                                                    ? currentUser.assignedDoctor.name
                                                    : `Dr. ${currentUser.assignedDoctor.name}`}
                                            </div>
                                            <div className="text-xs text-teal-600 truncate">
                                                {currentUser.assignedDoctor.specialty || "Oncology Specialist"}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                                <span className="text-xs text-emerald-600 font-medium">Primary Oncologist</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { 
                                            setActiveChatPartner(currentUser.assignedDoctor); 
                                            setPage("chat"); 
                                        }} 
                                        className="w-full mt-4 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                                    >
                                        <MessageSquare size={15} /> Message Doctor
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-2">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-3">
                                        <Stethoscope size={22} />
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-800">No Doctor Assigned Yet</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        You are open to consult and chat with any of our oncologists. Reach out to start your personalized consultation.
                                    </p>
                                    <button 
                                        onClick={() => { 
                                            setActiveChatPartner(null); 
                                            setPage("chat"); 
                                        }} 
                                        className="w-full mt-4 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                    >
                                        <MessageSquare size={15} /> Chat Now
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Symptoms */}
                        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" /> Recent Symptoms</h3>
                                <Link
                                    href="/symptoms"
                                    onClick={() => setPage("symptoms")}
                                    className="text-xs text-teal-600 hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                            {displaySymptoms.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                                    <Activity size={20} className="mx-auto text-slate-300 mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-600">No symptoms recorded yet</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Clinical observations and symptoms will appear here in real time.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {displaySymptoms.slice(0, 5).map((s: any, i: number) => {
                                        const ts = formatSymptomTimestamp(s);
                                        return (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-700">{s.symptom}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                                        <span>{ts.dayDate}</span>
                                                        {ts.time && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-0.5 text-slate-500">
                                                                    <Clock size={11} className="text-teal-600" />
                                                                    {ts.time}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.severity === "Low" ? "bg-green-50 text-green-600 border border-green-200" : s.severity === "Moderate" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{s.severity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Package Status */}
                <div className="mt-6 bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-teal-200 text-sm mb-1">Current Package</div>
                        <div className="text-xl font-display font-semibold">{p.package}</div>
                        <div className="text-teal-300 text-sm mt-1">Active since {p.since}</div>
                    </div>
                    <Link
                        href="/packages"
                        onClick={() => setPage("packages")}
                        className="bg-white text-teal-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors"
                    >
                        Upgrade Package →
                    </Link>
                </div>
            </div>

            {/* Vitals History Modal */}
            <VitalsHistoryModal
                isOpen={showVitalsHistory}
                onClose={() => setShowVitalsHistory(false)}
                patientId={currentUser?._id}
                patientName={currentUser?.name || p.name}
                currentVitals={liveVitals}
            />
        </div>
    );
}