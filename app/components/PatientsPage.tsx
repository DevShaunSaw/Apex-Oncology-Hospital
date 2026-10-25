"use client";
import { useState, useEffect } from "react";
import { doctorPatients } from "../data/mockData";
import {
    Search, SlidersHorizontal, MessageSquare, Calendar,
    AlertTriangle, TrendingUp, TrendingDown, Minus,
    X, Phone, Mail, MapPin, Pill, AlertCircle, Activity,
    Heart, Thermometer, Droplets, Zap, FileText, Eye, Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export interface Vitals {
    bp?: string;
    temp?: string;
    pulse?: string;
    weight?: string;
    lastUpdated?: string;
    updatedAt?: Date | string;
}

export interface LabTrend {
    label: string;
    value: string;
    status: string;
}

export interface CycleProgress {
    current: number;
    total: number;
}

export interface RecentSymptom {
    symptom: string;
    date: string;
    severity: string;
    createdAt?: string | Date;
    time?: string;
}

export interface Patient {
    _id?: string;
    id?: string;
    patientId: string;
    name: string;
    initials?: string;
    age: number;
    gender: string;
    city: string;
    status: string;
    disease: string;
    stage: string;
    type: string;
    recoveryIndex: number;
    vitals?: Vitals;
    labTrends?: LabTrend[];
    treatmentPhase: string;
    cycleProgress?: CycleProgress;
    recentSymptoms?: RecentSymptom[];
    nextAppointment: string;
    medications?: string[];
    allergies?: string[];
    phone?: string;
    email?: string;
    notes?: string;
    package?: string;
    since?: string;
    prognosis?: string;
    flagged?: boolean;
    unreadMessages?: number;
}

const statusMeta: Record<string, { color: string; bg: string; dot: string }> = {
    "Active Treatment": { color: "text-teal-700", bg: "bg-teal-50 border-teal-200", dot: "bg-teal-500" },
    "Post-Chemotherapy": { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
    "Post-Chemo": { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
    "Remission": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
};

const labStatusStyle: Record<string, string> = {
    normal: "text-emerald-600 bg-emerald-50",
    low: "text-amber-600 bg-amber-50",
    critical: "text-red-600 bg-red-50",
};

const severityStyle: Record<string, string> = {
    Low: "bg-emerald-50 text-emerald-700",
    Moderate: "bg-amber-50 text-amber-700",
    High: "bg-red-50 text-red-700",
};

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const fill = circ - (value / 100) * circ;
    const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
    );
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
                <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
                {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

interface PatientDetailModalProps {
    patient: Patient;
    onClose: () => void;
    onChat: () => void;
    onBookAppointment: () => void;
    onVitalsUpdated?: (patientId: string, vitals: Vitals) => void;
}

function PatientDetailModal({ patient, onClose, onChat, onBookAppointment, onVitalsUpdated }: PatientDetailModalProps) {
    const meta = statusMeta[patient.status] ?? statusMeta["Active Treatment"];
    const cycleCurrent = patient.cycleProgress?.current ?? 0;
    const cycleTotal = Math.max(patient.cycleProgress?.total ?? 1, 1);
    const cyclePercent = Math.round((cycleCurrent / cycleTotal) * 100);

    const [isEditingVitals, setIsEditingVitals] = useState(false);
    const [currentVitals, setCurrentVitals] = useState<Vitals>(patient.vitals || {});
    const [editBp, setEditBp] = useState(patient.vitals?.bp || "");
    const [editPulse, setEditPulse] = useState(patient.vitals?.pulse || "");
    const [editTemp, setEditTemp] = useState(patient.vitals?.temp || "");
    const [editWeight, setEditWeight] = useState(patient.vitals?.weight || "");
    const [saving, setSaving] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState("");

    const handleSaveVitals = async () => {
        const patientId = patient._id || patient.id;
        if (!patientId) return;

        try {
            setSaving(true);
            const newVitals = {
                bp: editBp,
                pulse: editPulse,
                temp: editTemp,
                weight: editWeight,
            };
            const res = await fetch(`/api/patient?id=${patientId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vitals: newVitals }),
            });
            const data = await res.json();
            if (data.success) {
                const savedVitals = data.patient?.vitals || newVitals;
                setCurrentVitals(savedVitals);
                setIsEditingVitals(false);
                setStatusFeedback("Vitals saved to database!");
                onVitalsUpdated?.(patientId, savedVitals);
                setTimeout(() => setStatusFeedback(""), 3000);
            } else {
                setStatusFeedback(data.message || "Failed to save vitals.");
            }
        } catch {
            setStatusFeedback("Error updating vitals.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white rounded-t-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/20">
                                {patient.initials || patient.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "PT"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-display font-semibold">{patient.name}</h2>
                                    {patient.flagged && <span className="flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> Flagged</span>}
                                </div>
                                <div className="text-teal-200 text-sm mt-1 flex flex-wrap gap-3">
                                    <span>{patient.patientId}</span><span>•</span>
                                    <span>{patient.age}y / {patient.gender}</span><span>•</span>
                                    <span>{patient.city}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{patient.disease} — {patient.stage}</span>
                                    <span className={`border text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{patient.status}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white"><X size={22} /></button>
                    </div>
                    {/* Quick stats row */}
                    <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/20">
                        {[["Package", patient.package || "N/A"], ["Since", patient.since || "N/A"], ["Phase", patient.treatmentPhase || "N/A"], ["Prognosis", patient.prognosis || "N/A"]].map(([k, v]) => (
                            <div key={k} className="text-center">
                                <div className="text-teal-300 text-xs">{k}</div>
                                <div className="font-semibold text-sm">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-5">
                    {/* Vitals */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                        <Activity size={14} className="text-teal-500" />
                                        Latest Body Vitals
                                    </h3>
                                    {currentVitals?.lastUpdated && (
                                        <div className="text-[10px] text-slate-400 mt-0.5 ml-5">
                                            Recorded: {currentVitals.lastUpdated}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setIsEditingVitals(!isEditingVitals);
                                        setEditBp(currentVitals?.bp || "");
                                        setEditPulse(currentVitals?.pulse || "");
                                        setEditTemp(currentVitals?.temp || "");
                                        setEditWeight(currentVitals?.weight || "");
                                    }}
                                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors border border-teal-200"
                                >
                                    {isEditingVitals ? "Cancel Edit" : "Update Vitals"}
                                </button>
                            </div>

                            {statusFeedback && (
                                <div className={`text-xs p-2 rounded-lg mb-2.5 ${statusFeedback.includes("saved") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    {statusFeedback}
                                </div>
                            )}

                            {isEditingVitals ? (
                                <div className="space-y-2.5 bg-white p-3 rounded-xl border border-teal-100">
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                                            <Heart size={12} className="text-rose-500" /> Blood Pressure
                                        </label>
                                        <input
                                            type="text"
                                            value={editBp}
                                            onChange={e => setEditBp(e.target.value)}
                                            placeholder="120/80 mmHg"
                                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                                            <Zap size={12} className="text-amber-500" /> Pulse
                                        </label>
                                        <input
                                            type="text"
                                            value={editPulse}
                                            onChange={e => setEditPulse(e.target.value)}
                                            placeholder="72 bpm"
                                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                                            <Thermometer size={12} className="text-orange-500" /> Temperature
                                        </label>
                                        <input
                                            type="text"
                                            value={editTemp}
                                            onChange={e => setEditTemp(e.target.value)}
                                            placeholder="98.6 °F"
                                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                                            <Droplets size={12} className="text-blue-500" /> Weight
                                        </label>
                                        <input
                                            type="text"
                                            value={editWeight}
                                            onChange={e => setEditWeight(e.target.value)}
                                            placeholder="64 kg"
                                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleSaveVitals}
                                        className="w-full mt-2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        {saving ? "Saving to Database..." : "Save Vitals to Database"}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { icon: Heart, label: "Blood Pressure", value: currentVitals?.bp || "N/A", color: "text-rose-500" },
                                        { icon: Zap, label: "Pulse", value: currentVitals?.pulse || "N/A", color: "text-amber-500" },
                                        { icon: Thermometer, label: "Temperature", value: currentVitals?.temp || "N/A", color: "text-orange-500" },
                                        { icon: Droplets, label: "Weight", value: currentVitals?.weight || "N/A", color: "text-blue-500" },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="bg-white rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Icon size={13} className={color} />
                                                <span className="text-xs text-slate-400">{label}</span>
                                            </div>
                                            <div className="font-bold text-slate-800 text-sm">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Treatment Progress */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-teal-500" />Treatment Progress</h3>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative">
                                <ProgressRing value={patient.recoveryIndex ?? 0} size={64} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-700">{patient.recoveryIndex ?? 0}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-700">Recovery Index</div>
                                <div className="text-xs text-slate-400 mt-0.5">{patient.treatmentPhase || "Under Treatment"}</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Cycle {cycleCurrent} of {cycleTotal}</span>
                                <span>{cyclePercent}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${cyclePercent}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Lab Trends */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><FileText size={14} className="text-teal-500" />Lab Results</h3>
                        <div className="space-y-2">
                            {(patient.labTrends ?? []).length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-3">No lab results available.</p>
                            ) : (
                                (patient.labTrends ?? []).map(lab => (
                                    <div key={lab.label} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                                        <span className="text-sm text-slate-600">{lab.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-slate-800">{lab.value}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${labStatusStyle[lab.status] ?? "text-slate-600 bg-slate-50"}`}>{lab.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Symptoms */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><AlertCircle size={14} className="text-amber-500" />Recent Symptoms</h3>
                        <div className="space-y-2">
                            {(patient.recentSymptoms ?? []).length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-3">No symptoms logged recently.</p>
                            ) : (
                                (patient.recentSymptoms ?? []).map((s, i) => {
                                    let dayDate = s.date || "Recorded";
                                    let time = s.time || "";

                                    if (s.createdAt) {
                                        try {
                                            const d = new Date(s.createdAt);
                                            if (!isNaN(d.getTime())) {
                                                dayDate = d.toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                });
                                                time = d.toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                });
                                            }
                                        } catch (e) {}
                                    } else if (s.date && s.date.includes("•")) {
                                        const parts = s.date.split("•").map((p: string) => p.trim());
                                        dayDate = parts[0];
                                        time = parts[1] || "";
                                    }

                                    return (
                                        <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">{s.symptom}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                                    <span>{dayDate}</span>
                                                    {time && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-0.5 text-slate-500">
                                                                <Clock size={11} className="text-teal-600" />
                                                                {time}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityStyle[s.severity] ?? "bg-slate-100 text-slate-700"}`}>{s.severity}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><Pill size={14} className="text-purple-500" />Current Medications</h3>
                        <div className="space-y-1.5">
                            {(patient.medications ?? []).length === 0 ? (
                                <p className="text-xs text-slate-400 py-1">No medications prescribed.</p>
                            ) : (
                                (patient.medications ?? []).map(m => (
                                    <div key={m} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 text-sm text-slate-700">
                                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0"></span>{m}
                                    </div>
                                ))
                            )}
                            {(patient.allergies ?? []).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="text-xs text-red-500 font-medium">Allergies:</span>
                                    {(patient.allergies ?? []).map(a => <span key={a} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">{a}</span>)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Doctor Notes */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"><Phone size={14} className="text-blue-500" />Contact & Notes</h3>
                        <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={13} className="text-slate-400" />{patient.phone || "N/A"}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={13} className="text-slate-400" />{patient.email || "N/A"}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={13} className="text-slate-400" />{patient.city || "N/A"}</div>
                        </div>
                        {patient.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                                <span className="font-semibold">Doctor Note: </span>{patient.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onChat} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                        <MessageSquare size={16} /> Message Patient
                    </button>
                    <button onClick={onBookAppointment} className="flex-1 border border-teal-200 text-teal-700 py-3 rounded-xl font-medium text-sm hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
                        <Calendar size={16} /> Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PatientsPage() {
    const { setPage, setActiveChatPartner } = useApp();
    const [patients, setPatients] = useState<Patient[]>(doctorPatients);
    const [stats, setStats] = useState({ total: 0, active: 0, remission: 0, flagged: 0, avgRecovery: 0 });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch from API
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ search, status: statusFilter, sortBy });
                const res = await fetch(`/api/patients?${params}`);
                const data = await res.json();
                if (data.success) {
                    setPatients(data.patients);
                    setStats(data.stats);
                } else {
                    throw new Error(data.message || "Failed to fetch patients");
                }
            } catch {
                // Fallback to mock data
                let filtered = [...doctorPatients];
                if (search) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(q) ||
                        p.patientId.toLowerCase().includes(q) ||
                        p.disease.toLowerCase().includes(q) ||
                        p.city.toLowerCase().includes(q)
                    );
                }
                if (statusFilter !== "all") {
                    const statusMap: Record<string, string> = {
                        "active-treatment": "Active Treatment",
                        "post-chemotherapy": "Post-Chemotherapy",
                        "remission": "Remission",
                    };
                    const targetStatus = statusMap[statusFilter];
                    if (targetStatus) {
                        filtered = filtered.filter(p => p.status === targetStatus);
                    }
                }
                if (sortBy === "name") {
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortBy === "age") {
                    filtered.sort((a, b) => b.age - a.age);
                } else if (sortBy === "recovery") {
                    filtered.sort((a, b) => b.recoveryIndex - a.recoveryIndex);
                } else if (sortBy === "appointment") {
                    filtered.sort((a, b) => (a.nextAppointment || "").localeCompare(b.nextAppointment || ""));
                }
                setPatients(filtered);
                setStats({
                    total: doctorPatients.length,
                    active: doctorPatients.filter(p => p.status === "Active Treatment").length,
                    remission: doctorPatients.filter(p => p.status === "Remission").length,
                    flagged: doctorPatients.filter(p => p.flagged).length,
                    avgRecovery: Math.round(doctorPatients.reduce((s, p) => s + (p.recoveryIndex || 0), 0) / (doctorPatients.length || 1)),
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [search, statusFilter, sortBy]);

    const statusFilters = [
        { key: "all", label: "All Patients" },
        { key: "active-treatment", label: "Active Treatment" },
        { key: "post-chemotherapy", label: "Post-Chemo" },
        { key: "remission", label: "Remission" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-900 to-teal-700 text-white px-4 sm:px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-display font-semibold mb-1">My Patients</h1>
                    <p className="text-teal-200 text-sm">Full clinical overview of all assigned patients</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard label="Total Patients" value={stats.total} icon={Activity} color="bg-teal-600" sub="Under your care" />
                    <StatCard label="Active Treatment" value={stats.active} icon={Zap} color="bg-teal-700" sub="Ongoing cycles" />
                    <StatCard label="In Remission" value={stats.remission} icon={TrendingUp} color="bg-emerald-600" sub="Positive outcome" />
                    <StatCard label="Flagged" value={stats.flagged} icon={AlertTriangle} color="bg-red-500" sub="Needs attention" />
                    <StatCard label="Avg Recovery" value={`${stats.avgRecovery}%`} icon={Heart} color="bg-purple-600" sub="Recovery index" />
                </div>

                {/* Filters + Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, ID, disease, city..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(f => (
                            <button key={f.key} onClick={() => setStatusFilter(f.key)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${statusFilter === f.key ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 text-slate-600">
                            <option value="name">Sort: Name</option>
                            <option value="age">Sort: Age</option>
                            <option value="recovery">Sort: Recovery</option>
                            <option value="appointment">Sort: Appointment</option>
                        </select>
                    </div>
                </div>

                {/* Patient Cards Grid */}
                {loading ? (
                    <div className="text-center py-16 text-slate-400">Loading patients…</div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">No patients match your search.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
                        {patients.map(patient => {
                            const meta = statusMeta[patient.status] ?? statusMeta["Active Treatment"];

                            const cycleCurrent = patient.cycleProgress?.current ?? 0;
                            const cycleTotal = Math.max(patient.cycleProgress?.total ?? 1, 1);
                            const cyclePercent = Math.round((cycleCurrent / cycleTotal) * 100);

                            const vitalsBP = patient.vitals?.bp ?? "N/A";
                            const vitalsTemp = patient.vitals?.temp ?? "N/A";
                            const vitalsPulse = patient.vitals?.pulse ?? "N/A";

                            const labTrendsList = patient.labTrends ?? [];
                            const recentSymptomsList = patient.recentSymptoms ?? [];

                            return (
                                <div key={patient.id || patient._id || patient.patientId}
                                    className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-md ${patient.flagged ? "border-red-200 hover:border-red-300" : "border-slate-100 hover:border-teal-200"}`}>

                                    {/* Card Header */}
                                    <div className="p-5 pb-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shrink-0 ${patient.flagged ? "bg-red-500" : "bg-teal-600"}`}>
                                                    {patient.initials || patient.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "PT"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                                                        {patient.flagged && <AlertTriangle size={13} className="text-red-500" />}
                                                        {(patient.unreadMessages ?? 0) > 0 && (
                                                            <span className="w-5 h-5 bg-teal-600 rounded-full text-white text-xs flex items-center justify-center font-bold">{patient.unreadMessages}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{patient.patientId || "AOC-TEMP"} · {patient.age || "N/A"}y / {patient.gender || "N/A"} · {patient.city || "N/A"}</div>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 ${meta.bg} ${meta.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
                                                {patient.status || "Active Treatment"}
                                            </span>
                                        </div>

                                        {/* Disease strip */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full border border-teal-100 font-medium">{patient.disease || "No Diagnosis"} — {patient.stage || "N/A"}</span>
                                            <span className="bg-slate-50 text-slate-500 text-xs px-2.5 py-1 rounded-full border border-slate-100">{patient.type || "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-px bg-slate-100 border-y border-slate-100">
                                        {/* Recovery Ring */}
                                        <div className="bg-white p-3 flex flex-col items-center justify-center col-span-1">
                                            <div className="relative w-12 h-12">
                                                <ProgressRing value={patient.recoveryIndex ?? 0} size={48} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[9px] font-bold text-slate-700">{patient.recoveryIndex ?? 0}%</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 mt-1">Recovery</span>
                                        </div>
                                        {/* Vitals mini */}
                                        <div className="bg-white p-3 col-span-3 grid grid-cols-3 gap-2">
                                            {[
                                                { label: "BP", value: vitalsBP, icon: Heart, c: "text-rose-400" },
                                                { label: "Temp", value: vitalsTemp, icon: Thermometer, c: "text-orange-400" },
                                                { label: "Pulse", value: vitalsPulse, icon: Zap, c: "text-amber-400" },
                                            ].map(({ label, value, icon: Icon, c }) => (
                                                <div key={label} className="text-center">
                                                    <Icon size={12} className={`${c} mx-auto mb-0.5`} />
                                                    <div className="text-xs font-semibold text-slate-700 leading-none">{value}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lab Results mini strip */}
                                    <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                                        {labTrendsList.map((lab: LabTrend) => (
                                            <div key={lab.label} className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${labStatusStyle[lab.status] || "text-slate-600 bg-slate-50"} border-current/20`}>
                                                {lab.status === "critical" ? <TrendingDown size={10} /> : lab.status === "low" ? <Minus size={10} /> : <TrendingUp size={10} />}
                                                {lab.label}: <strong>{lab.value}</strong>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cycle Progress */}
                                    <div className="px-5 pb-3">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                            <span>{patient.treatmentPhase || "Treatment"} — Cycle {cycleCurrent}/{cycleTotal}</span>
                                            <span className="font-medium">{cyclePercent}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${cyclePercent}%` }} />
                                        </div>
                                    </div>

                                    {/* Recent Symptoms mini */}
                                    {recentSymptomsList.length > 0 && (
                                        <div className="px-5 pb-3 flex gap-1.5 flex-wrap">
                                            {recentSymptomsList.slice(0, 3).map((s: RecentSymptom, i: number) => (
                                                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${severityStyle[s.severity] || "bg-slate-100 text-slate-700"}`}>{s.symptom}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Next Appointment + Actions */}
                                    <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-50 pt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Calendar size={12} className="text-teal-500" />
                                            <span>Next: <span className="font-medium text-slate-700">{patient.nextAppointment}</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setActiveChatPartner?.(patient); setPage("chat"); }}
                                                className="relative p-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors"
                                                title="Message Patient">
                                                <MessageSquare size={15} />
                                                {(patient.unreadMessages ?? 0) > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                                        {patient.unreadMessages}
                                                    </span>
                                                )}
                                            </button>
                                            <button onClick={() => setSelectedPatient(patient)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700 transition-colors">
                                                <Eye size={13} /> Full Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Patient Detail Modal */}
            {selectedPatient && (
                <PatientDetailModal
                    patient={selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    onChat={() => {
                        const target = selectedPatient;
                        setSelectedPatient(null);
                        setActiveChatPartner?.(target);
                        setPage("chat");
                    }}
                    onBookAppointment={() => {
                        setSelectedPatient(null);
                        setPage("appointments");
                    }}
                    onVitalsUpdated={(patientId, newVitals) => {
                        setPatients(prev => prev.map(p => {
                            if (p._id === patientId || p.id === patientId) {
                                return { ...p, vitals: newVitals };
                            }
                            return p;
                        }));
                    }}
                />
            )}
        </div>
    );
}