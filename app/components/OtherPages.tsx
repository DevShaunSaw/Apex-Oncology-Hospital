"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { patientProfile, appointments, doctors, doctorPatients } from "../data/mockData";
import {
    ChevronRight, AlertCircle, Plus, Activity, Users, Calendar,
    MessageSquare, Check, TrendingUp, AlertTriangle, Zap, Heart,
    ArrowRight, Eye, Clock, Thermometer, Droplets,
} from "lucide-react";

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
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    });
                    const time = d.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
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
                            : "Log symptoms and side effects — your oncologist sees these directly on their dashboard in real time"}
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

                {/* Log Symptom Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Plus size={16} className="text-teal-600" />
                            {role === "doctor" 
                                ? `Log Clinical Symptom for ${targetPatient?.name || "Patient"}` 
                                : "Log a New Symptom"}
                        </h2>
                        {role === "doctor" && targetPatient && (
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
                                placeholder={role === "doctor" ? "e.g. Peripheral neuropathy, Febrile neutropenia, Emesis" : "Describe your symptom (e.g. Nausea, Fatigue, Joint pain)"} 
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
                            <p className="text-xs text-slate-400 mt-0.5">Symptoms logged here will immediately be saved to the database.</p>
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
    const [vitalBp, setVitalBp] = useState("");
    const [vitalPulse, setVitalPulse] = useState("");
    const [vitalTemp, setVitalTemp] = useState("");
    const [vitalWeight, setVitalWeight] = useState("");
    const [vitalsMessage, setVitalsMessage] = useState("");
    const [savingVitals, setSavingVitals] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const resPatients = await fetch("/api/patients");
            const dataPatients = await resPatients.json();
            if (dataPatients.success) {
                setPatients(dataPatients.patients);
                setStats(dataPatients.stats);
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
        if (!selectedPatientId) {
            setVitalsMessage("Please select a patient first.");
            return;
        }
        if (!vitalBp && !vitalPulse && !vitalTemp && !vitalWeight) {
            setVitalsMessage("Please provide at least one vital measurement.");
            return;
        }
        try {
            setSavingVitals(true);
            const res = await fetch(`/api/patient?id=${selectedPatientId}`, {
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
                fetchDashboardData();
                setTimeout(() => setVitalsMessage(""), 3500);
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Activity size={16} className="text-rose-500" />
                                Record / Update Patient Body Vitals
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Enter measured body vitals. Changes are saved to the database and reflected directly across patient views.
                            </p>
                        </div>
                        {selectedPatientId && (
                            <span className="text-xs bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full self-start sm:self-auto">
                                Patient Selected: {patients.find(p => p.id === selectedPatientId || p._id === selectedPatientId)?.name}
                            </span>
                        )}
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
                            {!selectedPatientId ? "Please choose a patient from the dropdown above to load and update vitals." : "Make changes and click below to record to patient's clinical file."}
                        </span>
                        <button
                            type="button"
                            disabled={savingVitals || !selectedPatientId}
                            onClick={handleUpdateVitals}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                savingVitals || !selectedPatientId
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
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
    const [docForm, setDocForm] = useState({ name: "", email: "", password: "", specialty: "", experience: "", available: true });
    const [docSaving, setDocSaving] = useState(false);

    const flash = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3500);
    };

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

    // Doctor registration
    const handleDoctorSave = async () => {
        if (editingDoctorId) {
            // Update existing doctor
            if (!docForm.name || !docForm.specialty) {
                flash("Name and specialty are required.");
                return;
            }
            setDocSaving(true);
            try {
                const res = await fetch("/api/users", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingDoctorId,
                        name: docForm.name,
                        specialty: docForm.specialty,
                        experience: docForm.experience,
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
            } catch (err) {
                flash("An error occurred.");
            } finally {
                setDocSaving(false);
            }
        } else {
            // Register new doctor
            if (!docForm.name || !docForm.email || !docForm.password || !docForm.specialty) {
                flash("Name, email, password, and specialty are required.");
                return;
            }
            setDocSaving(true);
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: docForm.name,
                        email: docForm.email,
                        password: docForm.password,
                        role: "doctor",
                        specialty: docForm.specialty,
                        experience: docForm.experience,
                    }),
                });
                const data = await res.json();
                if (res.ok && data.user) {
                    flash("Doctor registered successfully!");
                    resetDoctorForm();
                    // Re-login as admin since register sets the cookie to the new user
                    await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: "admin@apex.com", password: "admin123", role: "admin" }),
                    });
                    fetchAll();
                } else {
                    flash(data.error || "Failed to register doctor.");
                }
            } catch (err) {
                flash("An error occurred.");
            } finally {
                setDocSaving(false);
            }
        }
    };

    const resetDoctorForm = () => {
        setShowDoctorForm(false);
        setEditingDoctorId(null);
        setDocForm({ name: "", email: "", password: "", specialty: "", experience: "", available: true });
    };

    const handleEditDoctor = (doc: any) => {
        setEditingDoctorId(doc.id || doc._id);
        setDocForm({
            name: doc.name,
            email: doc.email || "",
            password: "",
            specialty: doc.specialty || "",
            experience: doc.experience || "",
            available: doc.available !== false,
        });
        setShowDoctorForm(true);
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

                {/* Doctor Management */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Activity size={16} className="text-indigo-600" />
                            Doctor Management
                        </h3>
                        <button
                            onClick={() => { setShowDoctorForm(true); setEditingDoctorId(null); setDocForm({ name: "", email: "", password: "", specialty: "", experience: "", available: true }); }}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                        >
                            <Plus size={13} /> Register Doctor
                        </button>
                    </div>

                    {/* Doctor Form */}
                    {showDoctorForm && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-5">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                {editingDoctorId ? "Edit Doctor Details" : "Register New Doctor"}
                            </h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <input
                                    type="text" placeholder="Full Name *"
                                    value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                />
                                {!editingDoctorId && (
                                    <>
                                        <input
                                            type="email" placeholder="Email *"
                                            value={docForm.email} onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                        />
                                        <input
                                            type="password" placeholder="Password *"
                                            value={docForm.password} onChange={e => setDocForm({ ...docForm, password: e.target.value })}
                                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                        />
                                    </>
                                )}
                                <select
                                    value={docForm.specialty} onChange={e => setDocForm({ ...docForm, specialty: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                                >
                                    <option value="">Specialty *</option>
                                    <option>Medical Oncology</option>
                                    <option>Surgical Oncology</option>
                                    <option>Radiation Oncology</option>
                                    <option>Hematology-Oncology</option>
                                    <option>Pediatric Oncology</option>
                                </select>
                                <input
                                    type="text" placeholder="Experience (e.g. 12 years)"
                                    value={docForm.experience} onChange={e => setDocForm({ ...docForm, experience: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                />
                                {editingDoctorId && (
                                    <label className="flex items-center gap-2 text-sm text-slate-600 px-2">
                                        <input
                                            type="checkbox"
                                            checked={docForm.available}
                                            onChange={e => setDocForm({ ...docForm, available: e.target.checked })}
                                            className="w-4 h-4 rounded text-indigo-600"
                                        />
                                        Available / Active
                                    </label>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={resetDoctorForm} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                <button
                                    onClick={handleDoctorSave}
                                    disabled={docSaving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {docSaving ? "Saving..." : editingDoctorId ? "Update Doctor" : "Register Doctor"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Doctor List */}
                    {doctorsList.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No doctors registered yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {doctorsList.map(doc => (
                                <div key={doc.id || doc._id} className="flex items-center gap-3 py-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {doc.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700">{doc.name}</div>
                                        <div className="text-xs text-slate-400">{doc.specialty || "No specialty"} · {doc.experience || "N/A"} · {doc.email}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${doc.available !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                        {doc.available !== false ? "Active" : "Offline"}
                                    </span>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <button onClick={() => handleEditDoctor(doc)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteDoctor(doc.id || doc._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                            <AlertTriangle size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Patients */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Users size={16} className="text-teal-600" />
                                Patient Directory
                            </h3>
                            <button onClick={() => setPage("patients")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                                View All <ChevronRight size={13} />
                            </button>
                        </div>
                        {patientsList.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No patients registered yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                                {patientsList.slice(0, 10).map(p => (
                                    <div key={p.id || p._id} className="flex items-center gap-3 py-2.5">
                                        <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {p.initials || p.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-slate-700 truncate">{p.name}</div>
                                            <div className="text-xs text-slate-400 truncate">
                                                {p.disease || "No diagnosis"} · {p.assignedDoctor?.name || "Unassigned"}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                            p.status === "Active Treatment" ? "bg-teal-50 text-teal-700" :
                                            p.status === "Remission" ? "bg-emerald-50 text-emerald-700" :
                                            p.status === "Post-Chemotherapy" ? "bg-amber-50 text-amber-700" :
                                            "bg-slate-100 text-slate-500"
                                        }`}>
                                            {p.status || "Pending"}
                                        </span>
                                    </div>
                                ))}
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
        </div>
    );
}