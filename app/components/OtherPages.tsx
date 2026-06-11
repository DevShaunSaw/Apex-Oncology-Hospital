"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { patientProfile, appointments, doctors } from "../data/mockData";
import { ChevronRight, AlertCircle, Plus, Activity, Users, Calendar, MessageSquare, Check } from "lucide-react";

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
                {/* Disease Overview */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
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

                {/* Treatment Timeline */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-800 mb-5">Treatment Roadmap</h2>
                    <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
                        {phases.map((phase, i) => {
                            const isDone = i < currentPhase;
                            const isActive = i === currentPhase;
                            return (
                                <div key={phase} className="relative flex items-start gap-4 mb-6 last:mb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-teal-600 text-white pulse-teal" : "bg-slate-100 text-slate-400"}`}>
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

                {/* What About Disease Section */}
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

export function SymptomsPage() {
    const [symptoms, setSymptoms] = useState(patientProfile.symptoms);
    const [form, setForm] = useState({ symptom: "", severity: "Low", notes: "" });
    const [saved, setSaved] = useState(false);

    const logSymptom = () => {
        if (!form.symptom) return;
        setSymptoms([{ date: "Today", symptom: form.symptom, severity: form.severity }, ...symptoms]);
        setForm({ symptom: "", severity: "Low", notes: "" });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-display mb-1">Symptom Tracker</h1>
                    <p className="text-teal-200 text-sm">Log symptoms and side effects — your doctor reviews these before each appointment</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Log Form */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16} className="text-teal-600" /> Log a Symptom</h2>
                    <div className="space-y-3">
                        <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                            placeholder="Describe your symptom (e.g. Nausea, Fatigue, Joint pain)" value={form.symptom} onChange={e => setForm({ ...form, symptom: e.target.value })} />
                        <div>
                            <div className="text-xs text-slate-400 mb-2">Severity</div>
                            <div className="flex gap-2">
                                {["Low", "Moderate", "High", "Severe"].map(s => (
                                    <button key={s} onClick={() => setForm({ ...form, severity: s })}
                                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${form.severity === s ?
                                            s === "High" || s === "Severe" ? "bg-red-500 text-white" : s === "Moderate" ? "bg-amber-400 text-white" : "bg-emerald-500 text-white"
                                            : "bg-slate-100 text-slate-500"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none"
                            placeholder="Additional notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        <button onClick={logSymptom} className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${saved ? "bg-emerald-500 text-white" : "bg-teal-600 text-white hover:bg-teal-700"}`}>
                            {saved ? <><Check size={16} /> Logged!</> : "Log Symptom"}
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Activity size={16} className="text-teal-600" /> Symptom History</h2>
                    <div className="space-y-3">
                        {symptoms.map((s, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${s.severity === "Low" ? "bg-emerald-400" : s.severity === "Moderate" ? "bg-amber-400" : "bg-red-400"}`} />
                                <div className="flex-1">
                                    <div className="font-medium text-slate-700 text-sm">{s.symptom}</div>
                                    <div className="text-xs text-slate-400">{s.date}</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${s.severity === "Low" ? "bg-green-50 text-green-600" : s.severity === "Moderate" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{s.severity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DoctorDashboard() {
    const { setPage, setActiveChatPartner } = useApp();
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/chat/conversations");
                const data = await res.json();
                if (data.conversations) {
                    setPatients(data.conversations);
                }
            } catch (error) {
                console.error("Error fetching patients for dashboard:", error);
            }
        };
        fetchPatients();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white px-4 py-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">PS</div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold">Dr. Priya Sharma</h1>
                            <div className="text-teal-200 text-sm">Medical Oncology · 18 Years Experience</div>
                        </div>
                    </div>
                    <div className="hidden sm:flex gap-4 text-center">
                        {[["12", "Active Patients"], ["3", "Today's Appts"], ["5", "Unread Messages"]].map(([n, l]) => (
                            <div key={l} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                                <div className="text-xl font-bold">{n}</div>
                                <div className="text-teal-200 text-xs">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Calendar size={16} className="text-teal-600" /> Today's Appointments</h3>
                        <div className="space-y-3">
                            {appointments.map(a => (
                                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-teal-50 transition-colors">
                                    <div className="bg-teal-600 text-white rounded-lg px-2 py-1 text-xs font-semibold w-16 text-center">{a.time}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm text-slate-800">{a.patient}</div>
                                        <div className="text-xs text-slate-500">{a.type}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.status}</span>
                                    <button onClick={() => {
                                        const patientUser = patients.find(p => p.name.toLowerCase() === a.patient.toLowerCase());
                                        if (patientUser) {
                                            setActiveChatPartner(patientUser);
                                        } else if (patients.length > 0) {
                                            setActiveChatPartner(patients[0]);
                                        }
                                        setPage("chat");
                                    }} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><MessageSquare size={15} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Patients */}
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Users size={16} className="text-teal-600" /> My Patients</h3>
                        {patients.map(patient => {
                            const initials = patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                            return (
                                <div key={patient._id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">{initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{patient.name}</div>
                                        <div className="text-xs text-slate-400 truncate">{patient.city || "Pune"}</div>
                                    </div>
                                    <button onClick={() => {
                                        setActiveChatPartner(patient);
                                        setPage("chat");
                                    }} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><MessageSquare size={15} /></button>
                                </div>
                            );
                        })}
                        {patients.length === 0 && (
                            <div className="text-slate-400 text-xs py-4 text-center">No patients registered.</div>
                        )}
                    </div>
                </div>

                {/* Assign Disease Status section */}
                <div className="mt-6 bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" /> Assign / Update Disease Status</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400">
                            <option>Select Patient</option>
                            <option>Meera Joshi</option><option>Rajesh Patel</option><option>Sunita Das</option>
                        </select>
                        <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400">
                            <option>Disease Type</option>
                            <option>Breast Cancer</option><option>Lung Cancer</option><option>Lymphoma</option><option>Leukaemia</option>
                        </select>
                        <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400">
                            <option>Stage</option>
                            <option>Stage I</option><option>Stage II</option><option>Stage III</option><option>Stage IV</option>
                        </select>
                    </div>
                    <div className="mt-3 flex gap-3">
                        <textarea rows={2} className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" placeholder="Doctor's notes for the patient..." />
                        <button className="bg-teal-600 text-white px-5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">Update Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-display font-semibold">Admin Dashboard</h1>
                    <p className="text-slate-300 text-sm">Apex Onco Care — Control Panel</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {[["Total Patients", "1,247", "↑ 12 this week", "teal"], ["Active Doctors", "8", "4 online now", "blue"], ["Appointments Today", "34", "6 pending confirmation", "amber"], ["Events This Month", "5", "2 upcoming", "purple"]].map(([label, value, sub, color]) => (
                        <div key={label} className={`bg-white rounded-2xl shadow-card border border-${color}-100 p-5`}>
                            <div className={`text-3xl font-display font-bold text-${color}-600`}>{value}</div>
                            <div className="font-semibold text-slate-700 mt-1">{label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Doctor Management</h3>
                        {doctors.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">{doc.image}</div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-slate-700">{doc.name}</div>
                                    <div className="text-xs text-slate-400">{doc.specialty} · {doc.patients} patients</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${doc.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {doc.available ? "Active" : "Offline"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Recent Patient Registrations</h3>
                        {[
                            { name: "Sunita Das", date: "Today", doctor: "Unassigned", status: "Pending" },
                            { name: "Vikram Rao", date: "Yesterday", doctor: "Dr. Nair", status: "Assigned" },
                            { name: "Preethi S.", date: "May 15", doctor: "Dr. Sharma", status: "Active" },
                            { name: "Mohan K.", date: "May 14", doctor: "Dr. Mehta", status: "Active" },
                        ].map(p => (
                            <div key={p.name} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">{p.name[0]}</div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-slate-700">{p.name}</div>
                                    <div className="text-xs text-slate-400">{p.date} · {p.doctor}</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : p.status === "Assigned" ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"}`}>{p.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}