"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { patientProfile } from "../data/mockData";
import { Calendar, MessageSquare, Activity, FileText, AlertCircle, ChevronRight, TrendingUp, Heart, Clock } from "lucide-react";

export default function PatientDashboard() {
    const { setPage, setActiveChatPartner, currentUser } = useApp();
    const p = patientProfile;
    const [liveSymptoms, setLiveSymptoms] = useState<any[]>([]);
    const [liveVitals, setLiveVitals] = useState<any>(p.vitals);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const url = currentUser?._id ? `/api/patient?id=${currentUser._id}` : "/api/patient";
                const res = await fetch(url);
                const data = await res.json();
                if (data.success && data.patient) {
                    if (data.patient.recentSymptoms) {
                        setLiveSymptoms([...data.patient.recentSymptoms].reverse());
                    } else {
                        setLiveSymptoms(p.symptoms);
                    }
                    if (data.patient.vitals) {
                        setLiveVitals({
                            bp: data.patient.vitals.bp || p.vitals.bp,
                            weight: data.patient.vitals.weight || p.vitals.weight,
                            temp: data.patient.vitals.temp || p.vitals.temp,
                            pulse: data.patient.vitals.pulse || (p.vitals as any)?.pulse || "72 bpm",
                            lastUpdated: "Recently updated"
                        });
                    }
                } else {
                    setLiveSymptoms(p.symptoms);
                }
            } catch {
                setLiveSymptoms(p.symptoms);
            }
        };
        fetchPatientData();
    }, [currentUser]);

    const displaySymptoms = liveSymptoms.length > 0 ? liveSymptoms : p.symptoms;

    const formatSymptomTimestamp = (s: any) => {
        if (s.createdAt) {
            try {
                const d = new Date(s.createdAt);
                if (!isNaN(d.getTime())) {
                    const dayDate = d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    });
                    const time = d.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                    return { dayDate, time };
                }
            } catch (e) {}
        }
        if (s.date && s.date.includes("•")) {
            const parts = s.date.split("•").map((p: string) => p.trim());
            return { dayDate: parts[0], time: parts[1] || "" };
        }
        return { dayDate: s.date || "Recorded", time: s.time || "" };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white px-4 sm:px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">SS</div>
                            <div>
                                <h1 className="text-2xl font-display font-semibold">{p.name}</h1>
                                <div className="text-teal-200 text-sm flex flex-wrap gap-3 mt-1">
                                    <span>ID: {p.id}</span>
                                    <span>•</span>
                                    <span>{p.disease}</span>
                                    <span>•</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{p.status}</span>
                                </div>
                            </div>
                        </div>
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
                        { icon: MessageSquare, label: "Chat Doctor", page: "chat", color: "teal" },
                        { icon: Calendar, label: "Book Appointment", page: "appointments", color: "blue" },
                        { icon: Activity, label: "Log Symptom", page: "symptoms", color: "emerald" },
                        { icon: FileText, label: "My Care Plan", page: "disease-info", color: "amber" },
                    ].map(({ icon: Icon, label, page, color }) => (
                        <button key={label} onClick={() => setPage(page)}
                            className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 hover:shadow-card-hover hover:border-teal-100 transition-all text-left">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}-50`}>
                                <Icon size={20} className={`text-${color}-600`} />
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{label}</div>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Treatment Progress */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={18} className="text-teal-600" /> Treatment Progress</h3>
                            <button onClick={() => setPage("disease-info")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">Full Plan <ChevronRight size={14} /></button>
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
                            <h4 className="text-sm font-semibold text-slate-600 mb-3">Latest Vitals <span className="text-xs font-normal text-slate-400 ml-2">{liveVitals.lastUpdated || p.vitals.lastUpdated}</span></h4>
                            <div className="grid grid-cols-4 gap-3">
                                {[["BP", liveVitals.bp || "N/A"], ["Pulse", liveVitals.pulse || "N/A"], ["Temp", liveVitals.temp || "N/A"], ["Weight", liveVitals.weight || "N/A"]].map(([k, v]) => (
                                    <div key={k} className="bg-teal-50 rounded-xl p-3 text-center">
                                        <div className="text-xs text-teal-500 mb-1">{k}</div>
                                        <div className="text-sm font-bold text-teal-800">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        {/* Doctor Card */}
                        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Heart size={16} className="text-teal-500" /> My Oncologist</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold">PS</div>
                                <div>
                                    <div className="font-semibold text-slate-800 text-sm">{p.doctor}</div>
                                    <div className="text-xs text-teal-600">Medical Oncology</div>
                                    <div className="flex items-center gap-1 mt-0.5"><span className="w-2 h-2 bg-emerald-400 rounded-full pulse-teal"></span><span className="text-xs text-emerald-600">Online Now</span></div>
                                </div>
                            </div>
                            <button onClick={() => { setActiveChatPartner({ name: p.doctor, role: 'doctor' }); setPage("chat"); }} className="w-full mt-4 bg-teal-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                                <MessageSquare size={15} /> Message Doctor
                            </button>
                        </div>

                        {/* Recent Symptoms */}
                        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" /> Recent Symptoms</h3>
                                <button onClick={() => setPage("symptoms")} className="text-xs text-teal-600 hover:underline">View all</button>
                            </div>
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
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${s.severity === "Low" ? "bg-green-50 text-green-600" : s.severity === "Moderate" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{s.severity}</span>
                                        </div>
                                    );
                                })}
                            </div>
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
                    <button onClick={() => setPage("packages")} className="bg-white text-teal-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors">
                        Upgrade Package →
                    </button>
                </div>
            </div>
        </div>
    );
}