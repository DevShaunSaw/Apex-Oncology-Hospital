"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { patientProfile, appointments, doctors, doctorPatients } from "../data/mockData";
import {
    ChevronRight, AlertCircle, Plus, Activity, Users, Calendar,
    MessageSquare, Check, TrendingUp, AlertTriangle, Zap, Heart,
    ArrowRight, Eye, Clock, Thermometer, Droplets,
    Stethoscope, UserCheck, UserPlus, X, Edit3, Search, Filter,
    Ban, ShieldAlert, ShieldCheck, User,
    Building2, Award, Briefcase, GraduationCap, RefreshCw,
} from "lucide-react";
import VitalsHistoryModal from "./VitalsHistoryModal";
import { formatVitalsTimestamp } from "@/lib/dateTime";
import { HOSPITAL_DEPARTMENTS } from "@/lib/departments";

// ─────────────────────────────────────────────────────────────────────────────
// Disease Info
// ─────────────────────────────────────────────────────────────────────────────
export function DiseaseInfoPage() {
    const { setPage } = useApp();
    const p = patientProfile;
    const phases = ["Surgery (Lumpectomy)", "Chemotherapy — 6 cycles", "Radiation Therapy", "Hormone Therapy — 5 years"];
    const currentPhase = 1;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-teal-300 text-sm mb-1">Your Care Plan</div>
                    <h1 className="text-3xl font-display mb-1">{p.disease}</h1>
                    <p className="text-teal-200 text-sm">Assigned by {p.doctor} · Since {p.since}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-800 mb-4">About Your Diagnosis</h2>
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-4">
                        <p className="text-sm text-teal-800 leading-relaxed">
                            <strong>Hormone receptor-positive invasive ductal carcinoma, Stage II.</strong> This type of breast cancer grows in response to hormones (oestrogen/progesterone). Stage II means the tumour is localised and has not spread to distant organs. Your prognosis is <strong>good</strong> with the current treatment plan.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {[["Stage", "II"], ["Type", "HR+ IDC"], ["Prognosis", "Good"]].map(([k, v]) => (
                            <div key={k} className="bg-slate-50 rounded-xl py-3">
                                <div className="text-xs text-slate-400 mb-1">{k}</div>
                                <div className="font-bold text-teal-700">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-800 mb-5">Treatment Roadmap</h2>
                    <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
                        {phases.map((phase, i) => {
                            const isDone = i < currentPhase;
                            const isActive = i === currentPhase;
                            return (
                                <div key={phase} className="relative flex items-start gap-4 mb-6 last:mb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        {isDone ? <Check size={16} /> : <span className="text-sm font-bold">{i + 1}</span>}
                                    </div>
                                    <div className={`flex-1 pt-1 ${!isDone && !isActive ? "opacity-50" : ""}`}>
                                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                                            {phase}
                                            {isActive && <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">Current Phase</span>}
                                            {isDone && <span className="text-emerald-600 text-xs">Completed</span>}
                                        </div>
                                        {isActive && (
                                            <div className="mt-2">
                                                <div className="text-xs text-slate-500 mb-1">Cycle 2 of 6 complete</div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-48">
                                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: "33%" }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-700 to-teal-600 text-white rounded-2xl p-6">
                    <h2 className="font-display text-xl mb-3">Understanding Your Cancer</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { title: "How It Develops", desc: "HR+ breast cancer cells grow when exposed to oestrogen. Targeted therapies block these receptors to slow tumour growth." },
                            { title: "Your Treatment Works By", desc: "Chemotherapy kills rapidly dividing cells. Hormone blockers prevent recurrence. Both are synergistic in your case." },
                            { title: "What to Expect", desc: "Fatigue, hair thinning, and mild nausea are common during cycles. These are temporary and manageable." },
                            { title: "Recovery Outlook", desc: "With Stage II HR+ IDC, 85–90% of patients achieve full remission with the recommended treatment protocol." },
                        ].map(({ title, desc }) => (
                            <div key={title} className="bg-white/10 border border-white/20 rounded-xl p-4">
                                <div className="font-semibold mb-1">{title}</div>
                                <div className="text-teal-200 text-sm">{desc}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setPage("chat")} className="mt-5 bg-white text-teal-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors">
                        Ask Your Doctor →
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Symptoms Page
// ─────────────────────────────────────────────────────────────────────────────
export function SymptomsPage() {
    const { currentUser, role } = useApp();
    const [symptoms, setSymptoms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ symptom: "", severity: "Low", notes: "" });
    const [saved, setSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // For doctors: choose which patient to inspect and log symptoms for
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");

    // 1. If doctor, fetch patients list
    useEffect(() => {
        if (role === "doctor") {
            const fetchPatientsList = async () => {
                try {
                    const res = await fetch("/api/users?role=patient");
                    const data = await res.json();
                    if (data.users && data.users.length > 0) {
                        setPatients(data.users);
                        setSelectedPatientId(data.users[0]._id || data.users[0].id);
                    }
                } catch (err) {
                    console.error("Failed to load patients for doctor symptom view:", err);
                }
            };
            fetchPatientsList();
        }
    }, [role]);

    // 2. Fetch symptoms from DB for patient or selected patient
    const fetchSymptoms = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            let url = "/api/patient";
            if (role === "doctor") {
                if (!selectedPatientId) {
                    setLoading(false);
                    return;
                }
                url = `/api/patient?id=${selectedPatientId}`;
            } else if (currentUser?._id) {
                url = `/api/patient?id=${currentUser._id}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.success && data.patient) {
                const list = data.patient.recentSymptoms || [];
                // Sort by newest first
                setSymptoms([...list].reverse());
            } else {
                setSymptoms([]);
            }
        } catch (err: any) {
            console.error("Error fetching symptoms:", err);
            setErrorMsg("Could not load symptoms from database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === "doctor" && !selectedPatientId) return;
        fetchSymptoms();
    }, [role, selectedPatientId, currentUser]);

    // 3. Log a new symptom into the database
    const logSymptom = async () => {
        if (!form.symptom.trim() || saving) return;
        setSaving(true);
        setErrorMsg("");

        try {
            let url = "/api/patient";
            if (role === "doctor" && selectedPatientId) {
                url = `/api/patient?id=${selectedPatientId}`;
            } else if (currentUser?._id) {
                url = `/api/patient?id=${currentUser._id}`;
            }

            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symptom: form.symptom.trim(),
                    severity: form.severity,
                }),
            });

            const data = await res.json();
            if (data.success && data.patient) {
                const list = data.patient.recentSymptoms || [];
                setSymptoms([...list].reverse());
                setForm({ symptom: "", severity: "Low", notes: "" });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setErrorMsg(data.message || "Failed to save symptom to database.");
            }
        } catch (err: any) {
            console.error("Error logging symptom:", err);
            setErrorMsg("Server error saving symptom.");
        } finally {
            setSaving(false);
        }
    };

    const targetPatient = role === "doctor" ? patients.find(p => (p._id || p.id) === selectedPatientId) : currentUser;

    // Helper to format timestamp into Day Date (Month & Day) + Time (Hours & Minutes)
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
                    });
                    return { dayDate, time, combined: `${dayDate} · ${time}` };
                }
            } catch (e) {}
        }
        if (s.date && s.date.includes("•")) {
            const parts = s.date.split("•").map((p: string) => p.trim());
            return { dayDate: parts[0], time: parts[1] || "", combined: s.date };
        }
        return { dayDate: s.date || "Recorded", time: s.time || "", combined: s.date || "Recorded" };
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-display mb-1">
                        {role === "doctor" ? "Patient Symptom Monitoring" : "Symptom Tracker"}
                    </h1>
                    <p className="text-teal-200 text-sm">
                        {role === "doctor" 
                            ? "View real-time symptoms recorded by patients and record clinical observations directly to the database" 
                            : "View your recorded symptoms and clinical observations tracked by your medical team in real time"}
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Doctor Patient Selection Strip */}
                {role === "doctor" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Select Patient to View &amp; Log Symptoms
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-all"
                        >
                            {patients.map((p) => (
                                <option key={p._id || p.id} value={p._id || p.id}>
                                    {p.name} {p.disease ? `— ${p.disease}` : ""} ({p.stage || "Under Observation"})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Log Symptom Form - only for doctor login */}
                {role === "doctor" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Plus size={16} className="text-teal-600" />
                                Log Clinical Symptom for {targetPatient?.name || "Patient"}
                            </h2>
                            {targetPatient && (
                                <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium border border-teal-100">
                                    Doctor Clinical Entry
                                </span>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Symptom Description</label>
                                <input 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 bg-slate-50 focus:bg-white transition-all"
                                    placeholder="e.g. Peripheral neuropathy, Febrile neutropenia, Emesis" 
                                    value={form.symptom} 
                                    onChange={e => setForm({ ...form, symptom: e.target.value })} 
                                />
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-slate-500 mb-2">Severity Level</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {["Low", "Moderate", "High", "Severe"].map(s => (
                                        <button 
                                            key={s} 
                                            type="button"
                                            onClick={() => setForm({ ...form, severity: s })}
                                            className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                                                form.severity === s
                                                    ? s === "High" || s === "Severe" 
                                                        ? "bg-rose-500 text-white shadow-sm" 
                                                        : s === "Moderate" 
                                                            ? "bg-amber-500 text-white shadow-sm" 
                                                            : "bg-teal-600 text-white shadow-sm"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="button"
                                disabled={!form.symptom.trim() || saving} 
                                onClick={logSymptom} 
                                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                    saved 
                                        ? "bg-emerald-600 text-white" 
                                        : !form.symptom.trim() || saving
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                                }`}
                            >
                                {saved ? (
                                    <><Check size={16} /> Saved to Database!</>
                                ) : saving ? (
                                    "Saving to Database..."
                                ) : (
                                    "Record Symptom to Database"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Symptom History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Activity size={16} className="text-teal-600" />
                            {role === "doctor" ? `${targetPatient?.name || "Patient"}'s Symptom Records` : "My Symptom Records"}
                        </h2>
                        <span className="text-xs text-slate-400">
                            {symptoms.length} {symptoms.length === 1 ? "entry" : "entries"} from database
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            Fetching live symptoms from database...
                        </div>
                    ) : symptoms.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Activity size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-600">No symptoms recorded yet</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {role === "doctor" 
                                    ? "Symptoms logged here will immediately be saved to the database." 
                                    : "No clinical symptoms or observations have been recorded for your profile yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {symptoms.map((s, i) => {
                                const ts = formatSymptomTimestamp(s);
                                return (
                                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                s.severity === "Low" ? "bg-teal-500" : s.severity === "Moderate" ? "bg-amber-400" : "bg-rose-500"
                                            }`} />
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">{s.symptom}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    <span className="font-medium text-slate-600 flex items-center gap-1">
                                                        <Calendar size={12} className="text-teal-600" />
                                                        {ts.dayDate}
                                                    </span>
                                                    {ts.time && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-slate-500">
                                                                <Clock size={12} className="text-teal-600" />
                                                                {ts.time}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                                            s.severity === "Low" 
                                                ? "bg-teal-50 text-teal-700 border border-teal-200" 
                                                : s.severity === "Moderate" 
                                                    ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                        }`}>
                                            {s.severity}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor Dashboard — updated with patient quick cards + link to patients page
// ─────────────────────────────────────────────────────────────────────────────

export function DoctorDashboard() {
    const { currentUser, setPage } = useApp();

    const [patients, setPatients] = useState<any[]>([]);
    const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, remission: 0, flagged: 0, avgRecovery: 0 });
    const [loading, setLoading] = useState(true);

    // Form states
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [diseaseType, setDiseaseType] = useState("");
    const [stage, setStage] = useState("");
    const [statusVal, setStatusVal] = useState("");
    const [symptomName, setSymptomName] = useState("");
    const [severityVal, setSeverityVal] = useState("Low");
    const [notes, setNotes] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");

    // Body Vitals states
    const [vitalsPatientId, setVitalsPatientId] = useState("");
    const [vitalBp, setVitalBp] = useState("");
    const [vitalPulse, setVitalPulse] = useState("");
    const [vitalTemp, setVitalTemp] = useState("");
    const [vitalWeight, setVitalWeight] = useState("");
    const [vitalsMessage, setVitalsMessage] = useState("");
    const [savingVitals, setSavingVitals] = useState(false);
    const [showVitalsHistory, setShowVitalsHistory] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const resPatients = await fetch("/api/patients?all=true");
            const dataPatients = await resPatients.json();
            if (dataPatients.success) {
                setPatients(dataPatients.patients);
                setStats(dataPatients.stats);
                if (dataPatients.patients.length > 0) {
                    setVitalsPatientId(prev => {
                        const targetId = prev || dataPatients.patients[0].id || dataPatients.patients[0]._id;
                        const pt = dataPatients.patients.find((p: any) => (p.id || p._id) === targetId);
                        if (pt && pt.vitals) {
                            setVitalBp(pt.vitals.bp || "");
                            setVitalPulse(pt.vitals.pulse || "");
                            setVitalTemp(pt.vitals.temp || "");
                            setVitalWeight(pt.vitals.weight || "");
                        }
                        return targetId;
                    });
                }
            }

            const resAppts = await fetch("/api/appointments");
            const dataAppts = await resAppts.json();
            if (dataAppts.success) {
                setAppointmentsList(dataAppts.appointments);
            }
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVitalsPatientChange = (patientId: string) => {
        setVitalsPatientId(patientId);
        setVitalsMessage("");
        const pt = patients.find(p => (p.id || p._id) === patientId);
        if (pt && pt.vitals) {
            setVitalBp(pt.vitals.bp || "");
            setVitalPulse(pt.vitals.pulse || "");
            setVitalTemp(pt.vitals.temp || "");
            setVitalWeight(pt.vitals.weight || "");
        } else {
            setVitalBp("");
            setVitalPulse("");
            setVitalTemp("");
            setVitalWeight("");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpdate = async () => {
        if (!selectedPatientId) {
            setUpdateMessage("Please select a patient.");
            return;
        }
        try {
            const body: any = {
                notes: notes !== undefined ? notes : undefined,
                stage: stage !== undefined ? stage : undefined,
                status: statusVal !== undefined ? statusVal : undefined,
                disease: diseaseType !== undefined ? diseaseType : undefined,
            };
            if (symptomName) {
                body.symptom = symptomName;
                body.severity = severityVal;
            }

            const res = await fetch(`/api/patient?id=${selectedPatientId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setUpdateMessage("Patient profile updated successfully!");
                setSymptomName("");
                setNotes("");
                fetchDashboardData();
                setTimeout(() => setUpdateMessage(""), 3000);
            } else {
                setUpdateMessage(data.message || "Failed to update patient.");
            }
        } catch (err: any) {
            setUpdateMessage("Error updating patient profile.");
        }
    };

    const handleUpdateVitals = async () => {
        const targetId = vitalsPatientId || selectedPatientId;
        if (!targetId) {
            setVitalsMessage("Please select a patient first.");
            return;
        }
        if (!vitalBp && !vitalPulse && !vitalTemp && !vitalWeight) {
            setVitalsMessage("Please provide at least one vital measurement.");
            return;
        }
        try {
            setSavingVitals(true);
            const res = await fetch(`/api/patient?id=${targetId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vitals: {
                        bp: vitalBp,
                        pulse: vitalPulse,
                        temp: vitalTemp,
                        weight: vitalWeight,
                    },
                }),
            });
            const data = await res.json();
            if (data.success) {
                setVitalsMessage("Patient body vitals updated and saved to database successfully!");
                setPatients(prev => prev.map(p => {
                    if ((p.id || p._id) === targetId) {
                        return {
                            ...p,
                            vitals: data.patient?.vitals || {
                                bp: vitalBp,
                                pulse: vitalPulse,
                                temp: vitalTemp,
                                weight: vitalWeight,
                                lastUpdated: "Just now"
                            }
                        };
                    }
                    return p;
                }));
                fetchDashboardData();
                setTimeout(() => setVitalsMessage(""), 4000);
            } else {
                setVitalsMessage(data.message || "Failed to save vitals.");
            }
        } catch (err: any) {
            setVitalsMessage("Error updating patient vitals.");
        } finally {
            setSavingVitals(false);
        }
    };

    const doctorName = currentUser?.name || "Dr. Priya Sharma";
    const initials = doctorName.split(" ").map((n: any) => n[0]).join("").toUpperCase();
    const specialty = currentUser?.specialty || "Medical Oncology";
    const experience = currentUser?.experience || "18 Years Experience";

    const flagged = patients.filter(p => p.flagged);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-teal-800 font-medium">Loading Dashboard Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-900 to-teal-700 text-white px-4 py-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">{initials}</div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold">{doctorName}</h1>
                            <div className="text-teal-200 text-sm">{specialty} · {experience}</div>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {[[appointmentsList.length.toString(), "Total Appts"], ["5", "Unread Messages"], [flagged.length.toString(), "Flagged Patients"]].map(([n, l]) => (
                            <div key={l} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
                                <div className="text-xl font-bold">{n}</div>
                                <div className="text-teal-200 text-xs">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Top Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Patients", value: stats.total, icon: Users, color: "bg-teal-600", sub: "Under your care" },
                        { label: "Active Treatment", value: stats.active, icon: Zap, color: "bg-teal-700", sub: "Ongoing cycles" },
                        { label: "In Remission", value: stats.remission, icon: TrendingUp, color: "bg-emerald-600", sub: "Positive outcome" },
                        { label: "Avg Recovery", value: `${stats.avgRecovery}%`, icon: Heart, color: "bg-purple-600", sub: "Recovery index" },
                    ].map(({ label, value, icon: Icon, color, sub }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                                <Icon size={22} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
                                <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Flagged Alert */}
                {flagged.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-semibold text-red-700 mb-1">⚠ {flagged.length} patient{flagged.length > 1 ? "s" : ""} need immediate attention</div>
                            <div className="flex flex-wrap gap-2">
                                {flagged.map(p => (
                                    <span key={p.id} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        {p.name} — {p.disease}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setPage("patients")} className="shrink-0 text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors font-medium">
                            View All
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Calendar size={16} className="text-teal-600" />Today's Appointments</h3>
                            <button onClick={() => setPage("appointments")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">View all <ChevronRight size={13} /></button>
                        </div>
                        {appointmentsList.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No appointments scheduled.</div>
                        ) : (
                            <div className="space-y-3">
                                {appointmentsList.map(a => (
                                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-teal-50/40 transition-colors">
                                        <div className="bg-teal-600 text-white rounded-lg px-2 py-1 text-xs font-semibold w-16 text-center shrink-0">{a.time}</div>

                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <span className="font-semibold text-sm text-slate-800">{a.patientName || a.patient}</span>
                                                {a.contact && <span className="text-xs text-slate-400">({a.contact})</span>}
                                            </div>

                                            <div className="text-xs text-slate-500 font-medium">
                                                Appointment type: <span className="text-slate-700">{a.type}</span>
                                            </div>

                                            {(a.diseaseDetails || a.treatmentPlan) && (
                                                <div className="pt-1.5 border-t border-slate-100/60 grid sm:grid-cols-2 gap-2 text-xs">
                                                    {a.diseaseDetails && (
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Disease Details</span>
                                                            <span className="text-slate-600">{a.diseaseDetails}</span>
                                                        </div>
                                                    )}
                                                    {a.treatmentPlan && (
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Stage & Treatment Plan</span>
                                                            <span className="text-slate-600">{a.treatmentPlan}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.status}</span>
                                            <button onClick={() => setPage("chat")} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><MessageSquare size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick patient overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Users size={16} className="text-teal-600" />My Patients</h3>
                            <button onClick={() => setPage("patients")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">Full View <ArrowRight size={13} /></button>
                        </div>
                        {patients.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No patients assigned.</div>
                        ) : (
                            patients.map(patient => (
                                <div key={patient.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white ${patient.flagged ? "bg-red-500" : "bg-teal-600"}`}>
                                        {patient.initials || patient.name.split(" ").map((n: any) => n[0]).join("").toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <div className="text-sm font-semibold text-slate-700 truncate">{patient.name}</div>
                                            {patient.flagged && <AlertTriangle size={11} className="text-red-500 shrink-0" />}
                                            {patient.unreadMessages > 0 && (
                                                <span className="w-4 h-4 bg-teal-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold shrink-0">{patient.unreadMessages}</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">{patient.disease} — {patient.stage}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="text-xs font-bold text-slate-600">{patient.recoveryIndex}%</div>
                                        <button onClick={() => setPage("chat")} className="p-1 text-teal-500 hover:text-teal-700"><MessageSquare size={12} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                        <button onClick={() => setPage("patients")} className="w-full mt-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                            <Eye size={13} /> View All Patient Stats
                        </button>
                    </div>
                </div>

                {/* Assign Patient Status & Symptoms */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" />Assign / Update Patient Status &amp; Symptoms</h3>
                    {updateMessage && (
                        <div className={`p-3 rounded-xl text-xs mb-4 ${updateMessage.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {updateMessage}
                        </div>
                    )}
                    <div className="grid sm:grid-cols-4 gap-4">
                        <select 
                            value={selectedPatientId}
                            onChange={e => {
                                const val = e.target.value;
                                setSelectedPatientId(val);
                                const pt = patients.find(p => p.id === val || p._id === val);
                                if (pt) {
                                    setDiseaseType(pt.disease || "");
                                    setStage(pt.stage || "");
                                    setStatusVal(pt.status || "");
                                    setNotes(pt.notes || "");
                                    setVitalBp(pt.vitals?.bp || "");
                                    setVitalPulse(pt.vitals?.pulse || "");
                                    setVitalTemp(pt.vitals?.temp || "");
                                    setVitalWeight(pt.vitals?.weight || "");
                                } else {
                                    setDiseaseType("");
                                    setStage("");
                                    setStatusVal("");
                                    setNotes("");
                                    setVitalBp("");
                                    setVitalPulse("");
                                    setVitalTemp("");
                                    setVitalWeight("");
                                }
                            }}
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                        >
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
                        </select>
                        <select 
                            value={diseaseType}
                            onChange={e => setDiseaseType(e.target.value)}
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                        >
                            <option value="">Disease Type</option>
                            <option>Breast Cancer</option><option>Lung Cancer</option><option>Lymphoma</option><option>Leukaemia</option>
                        </select>
                        <select 
                            value={stage}
                            onChange={e => setStage(e.target.value)}
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                        >
                            <option value="">Stage</option>
                            <option>Stage I</option><option>Stage II</option><option>Stage III</option><option>Stage IV</option>
                        </select>
                        <select 
                            value={statusVal}
                            onChange={e => setStatusVal(e.target.value)}
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                        >
                            <option value="">Patient Status</option>
                            <option>Active Treatment</option>
                            <option>Post-Chemotherapy</option>
                            <option>Remission</option>
                        </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Assign / Log Symptom (Optional)</label>
                            <input 
                                type="text"
                                value={symptomName}
                                onChange={e => setSymptomName(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                placeholder="Symptom name (e.g. Nausea, Fatigue)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Symptom Severity</label>
                            <div className="flex gap-2">
                                {["Low", "Moderate", "High", "Severe"].map(s => (
                                    <button 
                                        key={s} 
                                        type="button"
                                        onClick={() => setSeverityVal(s)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${severityVal === s 
                                            ? s === "High" || s === "Severe" ? "bg-red-500 text-white" : s === "Moderate" ? "bg-amber-400 text-white" : "bg-emerald-500 text-white" 
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <textarea 
                            rows={2} 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" 
                            placeholder="Doctor notes for this patient…" 
                        />
                        <button 
                            onClick={handleUpdate}
                            className="bg-teal-600 text-white px-5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shrink-0"
                        >
                            Update Status &amp; Symptoms
                        </button>
                    </div>
                </div>

                {/* Patient Body Vitals Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Activity size={16} className="text-rose-500" />
                                Record / Update Patient Body Vitals
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Select any patient to inspect or record body vitals. Saved vitals persist to the database and sync across portals.
                            </p>
                        </div>
                        {vitalsPatientId && (
                            <button
                                type="button"
                                onClick={() => setShowVitalsHistory(true)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                            >
                                <Clock size={13} className="text-teal-600" />
                                View Vitals History
                            </button>
                        )}
                    </div>

                    {/* Dedicated Patient Selector for Vitals */}
                    <div className="mb-5 p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <User size={14} className="text-teal-700" />
                                Select Patient to Update Vitals
                            </label>
                            <select
                                value={vitalsPatientId}
                                onChange={(e) => handleVitalsPatientChange(e.target.value)}
                                className="w-full bg-white border border-teal-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs transition-all"
                            >
                                <option value="">-- Choose Patient to Update Vitals --</option>
                                {patients.map((p) => (
                                    <option key={p.id || p._id} value={p.id || p._id}>
                                        {p.name} {p.disease ? `— ${p.disease}` : ""} ({p.patientId || "Patient"})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {(() => {
                            const selectedPt = patients.find(p => (p.id || p._id) === vitalsPatientId);
                            if (!selectedPt) return null;
                            return (
                                <div className="bg-white border border-teal-200/80 rounded-xl p-3 text-xs shrink-0 min-w-[240px] shadow-2xs">
                                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {selectedPt.name}
                                    </div>
                                    <div className="text-slate-500 mt-0.5">
                                        {selectedPt.disease || "Oncology Care"} • {selectedPt.stage || "Stage I"}
                                    </div>
                                    <div className="text-[11px] text-teal-700 font-medium mt-1">
                                        {selectedPt.vitals?.lastUpdated 
                                            ? `Last recorded: ${formatVitalsTimestamp(selectedPt.vitals.lastUpdated, selectedPt.vitals.updatedAt)}` 
                                            : "No vitals recorded in database yet"}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowVitalsHistory(true)}
                                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                                    >
                                        <Clock size={11} /> View past vitals history
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {vitalsMessage && (
                        <div className={`p-3 rounded-xl text-xs mb-4 ${vitalsMessage.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {vitalsMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Blood Pressure */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <Heart size={14} className="text-rose-500" />
                                Blood Pressure
                            </label>
                            <input
                                type="text"
                                value={vitalBp}
                                onChange={e => setVitalBp(e.target.value)}
                                placeholder="e.g. 120/80 mmHg"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-medium text-slate-700"
                            />
                        </div>

                        {/* Pulse Rate */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <Zap size={14} className="text-amber-500" />
                                Pulse Rate
                            </label>
                            <input
                                type="text"
                                value={vitalPulse}
                                onChange={e => setVitalPulse(e.target.value)}
                                placeholder="e.g. 72 bpm"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-medium text-slate-700"
                            />
                        </div>

                        {/* Body Temperature */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <Thermometer size={14} className="text-orange-500" />
                                Body Temperature
                            </label>
                            <input
                                type="text"
                                value={vitalTemp}
                                onChange={e => setVitalTemp(e.target.value)}
                                placeholder="e.g. 98.6 °F"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-medium text-slate-700"
                            />
                        </div>

                        {/* Weight */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <Droplets size={14} className="text-blue-500" />
                                Body Weight
                            </label>
                            <input
                                type="text"
                                value={vitalWeight}
                                onChange={e => setVitalWeight(e.target.value)}
                                placeholder="e.g. 64 kg"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                            {!vitalsPatientId ? "Please choose a patient from the selector above to load and update vitals." : "Make changes and click below to record to patient's clinical file."}
                        </span>
                        <button
                            type="button"
                            disabled={savingVitals || !vitalsPatientId}
                            onClick={handleUpdateVitals}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                savingVitals || !vitalsPatientId
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm cursor-pointer"
                            }`}
                        >
                            {savingVitals ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving Vitals...
                                </>
                            ) : (
                                <>
                                    <Activity size={15} /> Save Patient Vitals
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Vitals History Modal */}
            {(() => {
                const selectedPt = patients.find(p => (p.id || p._id) === vitalsPatientId);
                return (
                    <VitalsHistoryModal
                        isOpen={showVitalsHistory}
                        onClose={() => setShowVitalsHistory(false)}
                        patientId={vitalsPatientId}
                        patientName={selectedPt?.name}
                        currentVitals={selectedPt?.vitals}
                        canAddVitals={true}
                        onVitalsRecorded={(savedVitals) => {
                            if (vitalsPatientId) {
                                setPatients(prev => prev.map(p => {
                                    if ((p.id || p._id) === vitalsPatientId) {
                                        return { ...p, vitals: savedVitals };
                                    }
                                    return p;
                                }));
                                setVitalBp(savedVitals.bp || "");
                                setVitalPulse(savedVitals.pulse || "");
                                setVitalTemp(savedVitals.temp || "");
                                setVitalWeight(savedVitals.weight || "");
                            }
                            fetchDashboardData();
                        }}
                    />
                );
            })()}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function AdminDashboard() {
    const { setPage, currentUser } = useApp();
    const [loading, setLoading] = useState(true);
    const [doctorsList, setDoctorsList] = useState<any[]>([]);
    const [patientsList, setPatientsList] = useState<any[]>([]);
    const [eventsList, setEventsList] = useState<any[]>([]);
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const [message, setMessage] = useState("");

    // Doctor registration form
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
    const [docForm, setDocForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "Department of Oncology",
        position: "",
        degree: "",
        yoe: "",
        experience: "",
        available: true,
    });
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("all");
    const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
    const [isSyncingSpecialists, setIsSyncingSpecialists] = useState(false);
    const [docSaving, setDocSaving] = useState(false);

    // Patient assignment edit modal state
    const [assignModalPatient, setAssignModalPatient] = useState<any | null>(null);
    const [selectedDoctorIdForPatient, setSelectedDoctorIdForPatient] = useState<string>("");
    const [isSavingAssignment, setIsSavingAssignment] = useState(false);
    const [patientSearchQuery, setPatientSearchQuery] = useState("");
    const [patientFilterStatus, setPatientFilterStatus] = useState<"all" | "unassigned" | "assigned" | "blocked">("all");

    // Patient block / unblock modal state
    const [blockModalPatient, setBlockModalPatient] = useState<any | null>(null);
    const [blockReason, setBlockReason] = useState("");
    const [unblockModalPatient, setUnblockModalPatient] = useState<any | null>(null);
    const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

    const flash = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3500);
    };

    const handleOpenAssignModal = (patient: any) => {
        setAssignModalPatient(patient);
        const currentDocId = patient.assignedDoctor?._id || patient.assignedDoctor || "";
        setSelectedDoctorIdForPatient(currentDocId ? String(currentDocId) : "");
    };

    const handleSaveDoctorAssignment = async () => {
        if (!assignModalPatient || isSavingAssignment) return;
        setIsSavingAssignment(true);
        try {
            const patientId = assignModalPatient._id || assignModalPatient.id;
            const targetDocId = selectedDoctorIdForPatient ? selectedDoctorIdForPatient : null;

            const res = await fetch("/api/patient/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    doctorId: targetDocId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                flash(data.message || "Doctor assignment updated successfully!");
                setAssignModalPatient(null);
                fetchAll();
            } else {
                flash(data.error || "Failed to update doctor assignment.");
            }
        } catch (err: any) {
            flash("Error updating doctor assignment.");
        } finally {
            setIsSavingAssignment(false);
        }
    };

    const handleOpenBlockModal = (patient: any) => {
        setBlockModalPatient(patient);
        setBlockReason("");
    };

    const handleConfirmBlock = async () => {
        if (!blockModalPatient || !blockReason.trim() || isSubmittingBlock) return;
        setIsSubmittingBlock(true);
        try {
            const patientId = blockModalPatient._id || blockModalPatient.id;
            const res = await fetch("/api/admin/block-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    isBlocked: true,
                    reason: blockReason.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                flash(data.message || `User ${blockModalPatient.name} blocked successfully.`);
                setBlockModalPatient(null);
                setBlockReason("");
                fetchAll();
            } else {
                flash(data.error || "Failed to block user.");
            }
        } catch (err: any) {
            flash("Error blocking user.");
        } finally {
            setIsSubmittingBlock(false);
        }
    };

    const handleConfirmUnblock = async () => {
        if (!unblockModalPatient || isSubmittingBlock) return;
        setIsSubmittingBlock(true);
        try {
            const patientId = unblockModalPatient._id || unblockModalPatient.id;
            const res = await fetch("/api/admin/block-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    isBlocked: false,
                }),
            });
            const data = await res.json();
            if (data.success) {
                flash(data.message || `User ${unblockModalPatient.name} unblocked successfully.`);
                setUnblockModalPatient(null);
                fetchAll();
            } else {
                flash(data.error || "Failed to unblock user.");
            }
        } catch (err: any) {
            flash("Error unblocking user.");
        } finally {
            setIsSubmittingBlock(false);
        }
    };

    const filteredPatients = patientsList.filter(p => {
        if (!p) return false;
        if (patientFilterStatus === "blocked" && !p.isBlocked) return false;
        if (patientFilterStatus === "unassigned" && (p.assignedDoctor || p.isBlocked)) return false;
        if (patientFilterStatus === "assigned" && (!p.assignedDoctor || p.isBlocked)) return false;

        if (patientSearchQuery.trim()) {
            const q = patientSearchQuery.toLowerCase();
            const nameMatch = p.name?.toLowerCase().includes(q);
            const emailMatch = p.email?.toLowerCase().includes(q);
            const diseaseMatch = p.disease?.toLowerCase().includes(q) || p.primaryConcern?.toLowerCase().includes(q);
            const docMatch = p.assignedDoctor?.name?.toLowerCase().includes(q);
            const reasonMatch = p.blockedReason?.toLowerCase().includes(q);
            return Boolean(nameMatch || emailMatch || diseaseMatch || docMatch || reasonMatch);
        }
        return true;
    });

    const fetchAll = async () => {
        try {
            // Seed admin on first load
            await fetch("/api/seed/admin");

            const [docRes, patRes, evtRes, apptRes] = await Promise.all([
                fetch("/api/users?role=doctor"),
                fetch("/api/users?role=patient"),
                fetch("/api/events"),
                fetch("/api/appointments"),
            ]);
            const [docData, patData, evtData, apptData] = await Promise.all([
                docRes.json(), patRes.json(), evtRes.json(), apptRes.json(),
            ]);

            setDoctorsList(docData.users || []);
            setPatientsList(patData.users || []);
            setEventsList(evtData.events || []);
            setAppointmentsCount(apptData.appointments?.length || 0);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // Doctor registration / update
    const handleDoctorSave = async () => {
        if (!docForm.name || !docForm.department || !docForm.position || !docForm.degree) {
            flash("Doctor Name, Department, Position, and Degree are required.");
            return;
        }

        setDocSaving(true);
        try {
            if (editingDoctorId) {
                // Update existing doctor
                const res = await fetch("/api/users", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingDoctorId,
                        name: docForm.name,
                        department: docForm.department,
                        position: docForm.position,
                        degree: docForm.degree,
                        yoe: docForm.yoe,
                        experience: docForm.experience,
                        specialty: docForm.department,
                        available: docForm.available,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    flash("Doctor details updated successfully!");
                    resetDoctorForm();
                    fetchAll();
                } else {
                    flash(data.error || "Failed to update doctor.");
                }
            } else {
                // Register new doctor via /api/users POST (preserves admin session)
                if (!docForm.email || !docForm.password) {
                    flash("Email and temporary password are required for new doctor registration.");
                    return;
                }
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: docForm.name,
                        email: docForm.email,
                        password: docForm.password,
                        department: docForm.department,
                        position: docForm.position,
                        degree: docForm.degree,
                        yoe: docForm.yoe,
                        experience: docForm.experience,
                        specialty: docForm.department,
                        available: docForm.available,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    flash("Doctor registered successfully under " + docForm.department + "!");
                    resetDoctorForm();
                    fetchAll();
                } else {
                    flash(data.error || "Failed to register doctor.");
                }
            }
        } catch (err) {
            flash("An error occurred while saving doctor details.");
        } finally {
            setDocSaving(false);
        }
    };

    const resetDoctorForm = () => {
        setShowDoctorForm(false);
        setEditingDoctorId(null);
        setDocForm({
            name: "",
            email: "",
            password: "",
            department: "Department of Oncology",
            position: "",
            degree: "",
            yoe: "",
            experience: "",
            available: true,
        });
    };

    const handleEditDoctor = (doc: any) => {
        setEditingDoctorId(doc.id || doc._id);
        setDocForm({
            name: doc.name || "",
            email: doc.email || "",
            password: "",
            department: doc.department || doc.specialty || "Department of Oncology",
            position: doc.position || "",
            degree: doc.degree || "",
            yoe: doc.yoe || "",
            experience: doc.experience || "",
            available: doc.available !== false,
        });
        setShowDoctorForm(true);
    };

    const handleSyncAllDoctors = async () => {
        if (!confirm("This will synchronize all hospital departments and specialists from the master chart to the database. Continue?")) return;
        setIsSyncingSpecialists(true);
        try {
            const res = await fetch("/api/seed/doctors", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                flash(data.message || "Specialists synchronized successfully!");
                fetchAll();
            } else {
                flash(data.error || "Failed to synchronize specialists.");
            }
        } catch {
            flash("Error synchronizing specialists.");
        } finally {
            setIsSyncingSpecialists(false);
        }
    };

    const handleDeleteDoctor = async (id: string) => {
        if (!confirm("Are you sure you want to remove this doctor?")) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                flash("Doctor removed successfully!");
                fetchAll();
            } else {
                flash(data.error || "Failed to remove doctor.");
            }
        } catch (err) {
            flash("An error occurred.");
        }
    };

    const adminName = currentUser?.name || "System Admin";
    const initials = adminName.split(" ").map((n: string) => n[0]).join("").toUpperCase();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-700 font-medium">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    const activeDoctors = doctorsList.filter(d => d.available !== false).length;
    const activePatients = patientsList.filter(p => p.status === "Active Treatment").length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">{initials}</div>
                            <div>
                                <h1 className="text-2xl font-display font-semibold">{adminName}</h1>
                                <p className="text-slate-300 text-sm">Apex Onco Care — Admin Control Panel</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Flash Message */}
                {message && (
                    <div className={`p-3 rounded-xl text-sm ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {message}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: "Total Patients", value: patientsList.length, sub: `${activePatients} active treatment`, icon: Users, color: "bg-teal-600" },
                        { label: "Active Doctors", value: activeDoctors, sub: `${doctorsList.length} total registered`, icon: Activity, color: "bg-indigo-600" },
                        { label: "Appointments", value: appointmentsCount, sub: "Total booked", icon: Calendar, color: "bg-amber-500" },
                        { label: "Events", value: eventsList.length, sub: `Across all categories`, icon: TrendingUp, color: "bg-purple-600" },
                    ].map(({ label, value, sub, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                                <Icon size={22} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
                                <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Doctor Management Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                                <Building2 size={18} className="text-teal-600" />
                                Hospital Specialists by Department
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {doctorsList.length} specialists across {new Set(doctorsList.map(d => d.department || "Other")).size} clinical departments
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleSyncAllDoctors}
                                disabled={isSyncingSpecialists}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100/70 text-teal-700 text-xs font-semibold transition-all disabled:opacity-50"
                                title="Sync all specialists and departments from the master brochure chart"
                            >
                                <RefreshCw size={13} className={isSyncingSpecialists ? "animate-spin" : ""} />
                                {isSyncingSpecialists ? "Syncing..." : "Sync Master Chart"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDoctorForm(true);
                                    setEditingDoctorId(null);
                                    setDocForm({
                                        name: "",
                                        email: "",
                                        password: "",
                                        department: "Department of Oncology",
                                        position: "",
                                        degree: "",
                                        yoe: "",
                                        experience: "",
                                        available: true,
                                    });
                                }}
                                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                            >
                                <Plus size={13} /> Add Specialist
                            </button>
                        </div>
                    </div>

                    {/* Department Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
                        <div className="relative flex-1 w-full">
                            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search doctor by name, position, degree, or experience..."
                                value={doctorSearchQuery}
                                onChange={e => setDoctorSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50/50"
                            />
                        </div>
                        <select
                            value={selectedDepartmentFilter}
                            onChange={e => setSelectedDepartmentFilter(e.target.value)}
                            className="w-full sm:w-auto text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-teal-500 font-medium"
                        >
                            <option value="all">All Departments ({doctorsList.length})</option>
                            {HOSPITAL_DEPARTMENTS.map(dept => {
                                const count = doctorsList.filter(d => (d.department || d.specialty) === dept).length;
                                return (
                                    <option key={dept} value={dept}>
                                        {dept} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Doctor Form (Add / Edit) */}
                    {showDoctorForm && (
                        <div className="bg-slate-50/80 rounded-2xl border border-teal-100 p-5 mb-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <Stethoscope size={16} className="text-teal-600" />
                                        {editingDoctorId ? "Edit Doctor Details" : "Register New Specialist Doctor"}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Store doctor under department with doctor name, position, degree and experience
                                    </p>
                                </div>
                                <button onClick={resetDoctorForm} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {/* Doctor Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Amit M. Gupta"
                                        value={docForm.name}
                                        onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                                    <select
                                        value={docForm.department}
                                        onChange={e => setDocForm({ ...docForm, department: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    >
                                        {HOSPITAL_DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctor Position */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Position *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Head, Department of Oncology"
                                        value={docForm.position}
                                        onChange={e => setDocForm({ ...docForm, position: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Doctor Degree */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Degree *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mch. Surgical Oncology, Tata Memorial Hospital"
                                        value={docForm.degree}
                                        onChange={e => setDocForm({ ...docForm, degree: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Years of Experience (YoE) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience (YoE) *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 22 Years or 15+ Years"
                                        value={docForm.yoe}
                                        onChange={e => setDocForm({ ...docForm, yoe: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Doctor Experience */}
                                <div className="sm:grid-cols-2 lg:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Experience Details / Timings *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HPB - GI & Thoracic oncology · 9 AM–12 PM Daily"
                                        value={docForm.experience}
                                        onChange={e => setDocForm({ ...docForm, experience: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Email & Password for new registrations */}
                                {!editingDoctorId && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Email Address *</label>
                                            <input
                                                type="email"
                                                placeholder="doctor@apex.com"
                                                value={docForm.email}
                                                onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                                            <input
                                                type="password"
                                                placeholder="Temporary login password"
                                                value={docForm.password}
                                                onChange={e => setDocForm({ ...docForm, password: e.target.value })}
                                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Availability Toggle */}
                                <div className="flex items-center pt-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={docForm.available}
                                            onChange={e => setDocForm({ ...docForm, available: e.target.checked })}
                                            className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                                        />
                                        <span>Available for Active Consultations</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-200">
                                <button onClick={resetDoctorForm} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                <button
                                    onClick={handleDoctorSave}
                                    disabled={docSaving}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {docSaving ? "Saving..." : editingDoctorId ? "Update Doctor" : "Register Doctor"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Doctor List Grouped by Department */}
                    {doctorsList.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            <Stethoscope size={32} className="mx-auto text-slate-300 mb-2" />
                            No doctors registered yet. Click &quot;Sync Master Chart&quot; to seed all hospital specialists.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(() => {
                                const filtered = doctorsList.filter(doc => {
                                    if (selectedDepartmentFilter !== "all" && (doc.department || doc.specialty) !== selectedDepartmentFilter) {
                                        return false;
                                    }
                                    if (doctorSearchQuery.trim()) {
                                        const q = doctorSearchQuery.toLowerCase();
                                        const matchName = doc.name?.toLowerCase().includes(q);
                                        const matchDept = (doc.department || doc.specialty)?.toLowerCase().includes(q);
                                        const matchPos = doc.position?.toLowerCase().includes(q);
                                        const matchDeg = doc.degree?.toLowerCase().includes(q);
                                        const matchExp = doc.experience?.toLowerCase().includes(q);
                                        return matchName || matchDept || matchPos || matchDeg || matchExp;
                                    }
                                    return true;
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-slate-400 text-sm">
                                            No specialists match your filter criteria.
                                        </div>
                                    );
                                }

                                // Group by Department
                                const grouped: Record<string, any[]> = {};
                                filtered.forEach(d => {
                                    const dept = d.department || d.specialty || "General Oncology";
                                    if (!grouped[dept]) grouped[dept] = [];
                                    grouped[dept].push(d);
                                });

                                return Object.entries(grouped).map(([dept, docs]) => (
                                    <div key={dept} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                                                <h4 className="text-sm font-bold text-slate-800">{dept}</h4>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold">
                                                    {docs.length} {docs.length === 1 ? "Specialist" : "Specialists"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {docs.map(doc => (
                                                <div key={doc.id || doc._id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                                    {doc.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-900 leading-snug">{doc.name}</div>
                                                                    <div className="text-xs font-semibold text-teal-700">{doc.position || "Specialist Consultant"}</div>
                                                                    {doc.yoe && (
                                                                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                                                                            {doc.yoe} Exp
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${doc.available !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                                {doc.available !== false ? "Active" : "Offline"}
                                                            </span>
                                                        </div>

                                                        {doc.degree && (
                                                            <div className="text-xs text-slate-600 font-medium flex items-start gap-1.5 mt-2 bg-slate-50 p-2 rounded-lg">
                                                                <GraduationCap size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                                                <span className="leading-tight">{doc.degree}</span>
                                                            </div>
                                                        )}

                                                        {doc.experience && (
                                                            <div className="text-xs text-slate-500 flex items-start gap-1.5 mt-1.5 px-1">
                                                                <Clock size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                                                <span className="leading-tight line-clamp-2">{doc.experience}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                                                        <span className="text-slate-400 truncate max-w-[150px]">{doc.email}</span>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => handleEditDoctor(doc)}
                                                                className="px-2 py-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium flex items-center gap-1"
                                                                title="Edit Doctor Details"
                                                            >
                                                                <Edit3 size={12} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDoctor(doc.id || doc._id)}
                                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Remove Doctor"
                                                            >
                                                                <AlertTriangle size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Patient Directory & Access Control Module */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Users size={16} className="text-teal-600" />
                                    Patient Directory & Access Control
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {patientsList.length} total patients · {patientsList.filter(p => !p.assignedDoctor && !p.isBlocked).length} unassigned · {patientsList.filter(p => p.isBlocked).length} blocked
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs flex-wrap">
                                <button
                                    onClick={() => setPatientFilterStatus("all")}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                        patientFilterStatus === "all" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    All ({patientsList.length})
                                </button>
                                <button
                                    onClick={() => setPatientFilterStatus("unassigned")}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                        patientFilterStatus === "unassigned" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                    }`}
                                >
                                    Unassigned ({patientsList.filter(p => !p.assignedDoctor && !p.isBlocked).length})
                                </button>
                                <button
                                    onClick={() => setPatientFilterStatus("assigned")}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                        patientFilterStatus === "assigned" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                                    }`}
                                >
                                    Assigned ({patientsList.filter(p => p.assignedDoctor && !p.isBlocked).length})
                                </button>
                                <button
                                    onClick={() => setPatientFilterStatus("blocked")}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                        patientFilterStatus === "blocked" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    }`}
                                >
                                    Blocked ({patientsList.filter(p => p.isBlocked).length})
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by patient name, email, doctor, or block reason..."
                                value={patientSearchQuery}
                                onChange={(e) => setPatientSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700"
                            />
                            {patientSearchQuery && (
                                <button
                                    onClick={() => setPatientSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-xs">
                                {patientSearchQuery || patientFilterStatus !== "all"
                                    ? "No patients match the filter criteria."
                                    : "No patients registered yet."}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto space-y-1 pr-1">
                                {filteredPatients.map(p => {
                                    const assignedDoc = p.assignedDoctor;
                                    const docName = assignedDoc?.name
                                        ? (assignedDoc.name.startsWith("Dr.") ? assignedDoc.name : `Dr. ${assignedDoc.name}`)
                                        : null;

                                    return (
                                        <div key={p.id || p._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs ${p.isBlocked ? "bg-rose-600" : "bg-teal-600"}`}>
                                                    {p.initials || p.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "PT"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-sm font-semibold truncate ${p.isBlocked ? "text-rose-900" : "text-slate-800"}`}>
                                                            {p.name}
                                                        </span>
                                                        {p.isBlocked ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg font-bold">
                                                                <Ban size={11} className="text-rose-600 shrink-0" />
                                                                <span>Blocked</span>
                                                            </span>
                                                        ) : docName ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg font-medium">
                                                                <Stethoscope size={11} className="text-teal-600 shrink-0" />
                                                                <span className="truncate">{docName}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">
                                                                <AlertCircle size={11} className="text-amber-600 shrink-0" />
                                                                <span>Unassigned</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 truncate mt-0.5">
                                                        {p.email || "No email"} · {p.primaryConcern || p.disease || "No primary concern recorded"}
                                                    </div>

                                                    {/* Block Reason Display */}
                                                    {p.isBlocked && p.blockedReason && (
                                                        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1 mt-1 font-medium leading-relaxed">
                                                            <span className="font-bold">Reason:</span> &ldquo;{p.blockedReason}&rdquo;
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action buttons: Doctor Allotment + Block/Unblock */}
                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                {!p.isBlocked && (
                                                    <button
                                                        onClick={() => handleOpenAssignModal(p)}
                                                        className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                                                        title="Assign or change doctor for this patient"
                                                    >
                                                        <UserCheck size={13} />
                                                        <span className="hidden sm:inline">
                                                            {docName ? "Change Doctor" : "Assign Doctor"}
                                                        </span>
                                                    </button>
                                                )}

                                                {p.isBlocked ? (
                                                    <button
                                                        onClick={() => setUnblockModalPatient(p)}
                                                        className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                                                        title="Unblock this user and restore platform access"
                                                    >
                                                        <ShieldCheck size={13} className="text-emerald-600" />
                                                        <span>Unblock</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenBlockModal(p)}
                                                        className="flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                                                        title="Block this rogue or unethical user from the platform"
                                                    >
                                                        <Ban size={13} className="text-rose-600" />
                                                        <span>Block</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Events Overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar size={16} className="text-purple-600" />
                                Events Overview
                            </h3>
                            <button onClick={() => setPage("events-admin")} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                                Manage Events <ChevronRight size={13} />
                            </button>
                        </div>
                        {eventsList.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No events available.</div>
                        ) : (
                            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                                {eventsList.slice(0, 8).map(ev => (
                                    <div key={ev.id || ev._id} className="flex items-center gap-3 py-2.5">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                            ev.type === "Seminar" ? "bg-teal-600" : ev.type === "Workshop" ? "bg-amber-500" : "bg-purple-600"
                                        }`}>
                                            {ev.date.split(",")[0].split(" ")[1] || "∞"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-slate-700 truncate">{ev.title}</div>
                                            <div className="text-xs text-slate-400 truncate">{ev.speaker} · {ev.date}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                            ev.type === "Seminar" ? "bg-teal-50 text-teal-700" :
                                            ev.type === "Workshop" ? "bg-amber-50 text-amber-700" :
                                            "bg-purple-50 text-purple-700"
                                        }`}>
                                            {ev.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Admin Assign / Change Doctor for Patient */}
            {assignModalPatient && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isSavingAssignment) {
                            setAssignModalPatient(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-slideIn">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 relative bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/40">
                            <button
                                type="button"
                                disabled={isSavingAssignment}
                                onClick={() => setAssignModalPatient(null)}
                                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                                    <UserCheck size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-800">
                                        Assign / Change Doctor
                                    </h3>
                                    <p className="text-xs text-indigo-600 font-medium">
                                        Clinical Allotment for {assignModalPatient.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Patient Info Card */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {assignModalPatient.initials || assignModalPatient.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "PT"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-800 text-sm truncate">{assignModalPatient.name}</div>
                                    <div className="text-xs text-slate-500 truncate">{assignModalPatient.email} {assignModalPatient.phone ? `· ${assignModalPatient.phone}` : ""}</div>
                                    <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                                        Currently: {assignModalPatient.assignedDoctor?.name ? `Assigned to ${assignModalPatient.assignedDoctor.name}` : "Unassigned (Open to all doctors)"}
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Selection Form */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Select Doctor to Assign
                                </label>
                                <select
                                    value={selectedDoctorIdForPatient}
                                    onChange={(e) => setSelectedDoctorIdForPatient(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                                >
                                    <option value="">— Unassign (No Doctor Allocated) —</option>
                                    {doctorsList.map((doc) => {
                                        const docId = doc.id || doc._id;
                                        return (
                                            <option key={docId} value={docId}>
                                                {doc.name} — {doc.specialty || "Integrated Oncology"} ({doc.experience || "10+ yrs"})
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Choosing &quot;Unassign&quot; allows the patient to chat freely with any doctor until an oncologist accepts them.
                                </p>
                            </div>

                            {/* Selected Doctor Preview */}
                            {(() => {
                                const matchedDoc = doctorsList.find(d => String(d.id || d._id) === String(selectedDoctorIdForPatient));
                                if (!matchedDoc) return null;
                                return (
                                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3 animate-fadeIn">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                            {matchedDoc.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-slate-800 text-xs truncate">
                                                {matchedDoc.name}
                                            </div>
                                            <div className="text-[11px] text-indigo-700 font-medium truncate">
                                                {matchedDoc.specialty || "Oncology Specialist"} · {matchedDoc.experience || "10+ yrs"}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                {matchedDoc.email}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${matchedDoc.available !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                                            {matchedDoc.available !== false ? "Active" : "Offline"}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isSavingAssignment}
                                    onClick={() => setAssignModalPatient(null)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSavingAssignment}
                                    onClick={handleSaveDoctorAssignment}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingAssignment ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving Assignment...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            <span>Save Doctor Assignment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Admin Block Patient */}
            {blockModalPatient && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isSubmittingBlock) {
                            setBlockModalPatient(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-slideIn">
                        {/* Header */}
                        <div className="p-6 border-b border-rose-100 relative bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30">
                            <button
                                type="button"
                                disabled={isSubmittingBlock}
                                onClick={() => setBlockModalPatient(null)}
                                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
                                    <ShieldAlert size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-800">
                                        Block Patient from Platform
                                    </h3>
                                    <p className="text-xs text-rose-600 font-medium">
                                        Suspend access for {blockModalPatient.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="bg-rose-50/60 border border-rose-200/70 rounded-2xl p-3.5 flex items-start gap-3">
                                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-rose-800 leading-relaxed">
                                    Blocking this user will immediately revoke their access. When they sign in, they will be redirected to the suspension page with your provided reason and admin contact info.
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {blockModalPatient.initials || blockModalPatient.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "PT"}
                                </div>
                                <div className="min-w-0 flex-1 text-xs">
                                    <div className="font-semibold text-slate-800 text-sm">{blockModalPatient.name}</div>
                                    <div className="text-slate-500">{blockModalPatient.email} {blockModalPatient.phone ? `· ${blockModalPatient.phone}` : ""}</div>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Reason for Blocking <span className="text-rose-500">* (Required)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Describe the rogue, abusive, or unethical behavior in detail..."
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
                                />

                                {/* Quick Preset Reason Pills */}
                                <div className="mt-2">
                                    <span className="text-[11px] text-slate-400 block mb-1">Quick Select Predefined Reasons:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "Unethical & abusive behavior in doctor chat",
                                            "Harassment of hospital medical staff",
                                            "Rogue communication & terms violation",
                                            "Fraudulent patient identity / spam activity",
                                        ].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setBlockReason(preset)}
                                                className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                                            >
                                                + {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isSubmittingBlock}
                                    onClick={() => setBlockModalPatient(null)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={!blockReason.trim() || isSubmittingBlock}
                                    onClick={handleConfirmBlock}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingBlock ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Blocking User...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Ban size={14} />
                                            <span>Confirm & Block User</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Admin Unblock Patient */}
            {unblockModalPatient && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isSubmittingBlock) {
                            setUnblockModalPatient(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-slideIn">
                        <div className="p-6 border-b border-emerald-100 relative bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30">
                            <button
                                type="button"
                                disabled={isSubmittingBlock}
                                onClick={() => setUnblockModalPatient(null)}
                                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-800">
                                        Unblock Patient Access
                                    </h3>
                                    <p className="text-xs text-emerald-600 font-medium">
                                        Restore access for {unblockModalPatient.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Are you sure you want to unblock <strong className="text-slate-800 font-semibold">{unblockModalPatient.name}</strong>? 
                                Their platform suspension will be lifted immediately, allowing them to sign in and use the platform normally.
                            </p>

                            {unblockModalPatient.blockedReason && (
                                <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-600">
                                    <span className="font-semibold text-slate-700">Previous suspension reason:</span>
                                    <div className="italic mt-0.5">&ldquo;{unblockModalPatient.blockedReason}&rdquo;</div>
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isSubmittingBlock}
                                    onClick={() => setUnblockModalPatient(null)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmittingBlock}
                                    onClick={handleConfirmUnblock}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingBlock ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Unblocking User...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            <span>Confirm Unblock</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}