"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Heart, Zap, Thermometer, Droplets, X, RefreshCw, AlertCircle, Calendar, Plus, Check } from "lucide-react";
import { formatVitalsTimestamp, formatToISTDateTime } from "@/lib/dateTime";

export interface VitalsHistoryEntry {
    _id?: string;
    bp?: string;
    temp?: string;
    pulse?: string;
    weight?: string;
    lastUpdated?: string;
    formattedDate?: string;
    recordedAt?: string | Date;
    recordedBy?: string;
    notes?: string;
}

interface VitalsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId?: string;
    patientName?: string;
    currentVitals?: {
        bp?: string;
        temp?: string;
        pulse?: string;
        weight?: string;
        lastUpdated?: string;
        updatedAt?: Date | string;
    };
    onVitalsRecorded?: (newVitals: any) => void;
    canAddVitals?: boolean;
}

export default function VitalsHistoryModal({
    isOpen,
    onClose,
    patientId,
    patientName,
    currentVitals,
    onVitalsRecorded,
    canAddVitals = false,
}: VitalsHistoryModalProps) {
    const [history, setHistory] = useState<VitalsHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    // Form inputs for inline record
    const [newBp, setNewBp] = useState("");
    const [newPulse, setNewPulse] = useState("");
    const [newTemp, setNewTemp] = useState("");
    const [newWeight, setNewWeight] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitFeedback, setSubmitFeedback] = useState("");

    const fetchHistory = async () => {
        if (!isOpen) return;
        setLoading(true);
        setError("");
        try {
            const url = patientId
                ? `/api/patient/vitals-history?patientId=${patientId}`
                : `/api/patient/vitals-history`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setHistory(data.history || []);
            } else {
                setError(data.message || "Failed to load vitals history.");
            }
        } catch (err) {
            setError("Failed to fetch vitals history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, patientId]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSaveNewVitals = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBp && !newPulse && !newTemp && !newWeight) {
            setSubmitFeedback("Please enter at least one measurement.");
            return;
        }

        try {
            setSubmitting(true);
            setSubmitFeedback("");
            const res = await fetch("/api/patient/vitals-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    vitals: {
                        bp: newBp,
                        pulse: newPulse,
                        temp: newTemp,
                        weight: newWeight,
                        notes: newNotes,
                    },
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSubmitFeedback("Vitals recorded and saved to database successfully in IST!");
                onVitalsRecorded?.(data.vitals);
                setNewBp("");
                setNewPulse("");
                setNewTemp("");
                setNewWeight("");
                setNewNotes("");
                setShowAddForm(false);
                fetchHistory();
                setTimeout(() => setSubmitFeedback(""), 3500);
            } else {
                setSubmitFeedback(data.message || "Failed to save vitals.");
            }
        } catch {
            setSubmitFeedback("Network error saving vitals.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 text-white p-5 flex items-start justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-white/20 text-teal-100">
                                <Activity size={18} />
                            </span>
                            <h2 className="text-xl font-bold font-display tracking-tight">Patient Vitals History</h2>
                        </div>
                        <p className="text-teal-100 text-xs flex flex-wrap items-center gap-2 mt-1">
                            {patientName && (
                                <span className="font-semibold bg-white/15 px-2 py-0.5 rounded-md text-white">
                                    {patientName}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 bg-teal-900/50 px-2 py-0.5 rounded-md text-teal-200 border border-teal-500/30">
                                <Clock size={11} className="text-teal-300" /> All timestamps in IST (UTC+05:30)
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        title="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sub-bar / Actions */}
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-700">
                            Total Records: <strong className="text-teal-700">{history.length}</strong>
                        </span>
                        {history.length > 0 && history[0].lastUpdated && (
                            <span className="hidden sm:inline text-slate-400">
                                Latest: {history[0].formattedDate || history[0].lastUpdated}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {canAddVitals && (
                            <button
                                type="button"
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                            >
                                <Plus size={13} />
                                {showAddForm ? "Close Form" : "Record New Reading"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={fetchHistory}
                            disabled={loading}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title="Refresh vitals history"
                        >
                            <RefreshCw size={13} className={loading ? "animate-spin text-teal-600" : ""} />
                        </button>
                    </div>
                </div>

                {/* Optional Record Vitals Form inside Modal */}
                {showAddForm && (
                    <form onSubmit={handleSaveNewVitals} className="bg-teal-50/70 border-b border-teal-100 p-4 shrink-0">
                        <div className="text-xs font-bold text-teal-900 mb-2.5 flex items-center gap-1.5">
                            <Activity size={13} className="text-teal-700" />
                            Record New Vitals (Timestamped automatically in IST)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2.5">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Blood Pressure</label>
                                <input
                                    type="text"
                                    value={newBp}
                                    onChange={(e) => setNewBp(e.target.value)}
                                    placeholder="e.g. 120/80"
                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Pulse Rate</label>
                                <input
                                    type="text"
                                    value={newPulse}
                                    onChange={(e) => setNewPulse(e.target.value)}
                                    placeholder="e.g. 72 bpm"
                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Temperature</label>
                                <input
                                    type="text"
                                    value={newTemp}
                                    onChange={(e) => setNewTemp(e.target.value)}
                                    placeholder="e.g. 98.6 °F"
                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Weight</label>
                                <input
                                    type="text"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="e.g. 64 kg"
                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                placeholder="Clinical observation / notes (optional)"
                                className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? "Saving..." : "Save to Database"}
                            </button>
                        </div>
                    </form>
                )}

                {submitFeedback && (
                    <div
                        className={`mx-5 mt-3 p-2.5 rounded-lg text-xs font-medium ${
                            submitFeedback.includes("successfully")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {submitFeedback}
                    </div>
                )}

                {/* Content Area */}
                <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-medium text-slate-600">Retrieving vitals history from database...</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center p-6">
                            <AlertCircle size={32} className="text-rose-500 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">{error}</p>
                            <button
                                onClick={fetchHistory}
                                className="mt-3 text-xs text-teal-600 hover:underline font-medium"
                            >
                                Try again
                            </button>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-14 text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Activity size={36} className="text-slate-300 mx-auto mb-2" />
                            <h4 className="text-sm font-semibold text-slate-700 mb-1">No Past Vitals Recorded Yet</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                                Once vitals are recorded and saved from the doctor or patient dashboard, they will be archived here in chronological order with exact timestamps in IST.
                            </p>
                            {currentVitals && (currentVitals.bp || currentVitals.temp || currentVitals.pulse || currentVitals.weight) && (
                                <div className="mt-3 inline-block text-left bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs max-w-md w-full">
                                    <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wide mb-2 flex items-center justify-between">
                                        <span>Current Profile Baseline</span>
                                        <span className="text-slate-400 font-normal">
                                            {formatVitalsTimestamp(currentVitals.lastUpdated, currentVitals.updatedAt) || "Recorded"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-[10px] text-slate-400">BP</div>
                                            <div className="font-bold text-slate-700">{currentVitals.bp || "--"}</div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-[10px] text-slate-400">Pulse</div>
                                            <div className="font-bold text-slate-700">{currentVitals.pulse || "--"}</div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-[10px] text-slate-400">Temp</div>
                                            <div className="font-bold text-slate-700">{currentVitals.temp || "--"}</div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-[10px] text-slate-400">Weight</div>
                                            <div className="font-bold text-slate-700">{currentVitals.weight || "--"}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        history.map((entry, idx) => {
                            const isLatest = idx === 0;
                            const timestampStr =
                                entry.formattedDate ||
                                (entry.recordedAt
                                    ? formatToISTDateTime(entry.recordedAt)
                                    : formatVitalsTimestamp(entry.lastUpdated));

                            return (
                                <div
                                    key={entry._id || idx}
                                    className={`p-4 rounded-xl border transition-all ${
                                        isLatest
                                            ? "bg-teal-50/40 border-teal-200/80 shadow-2xs"
                                            : "bg-white border-slate-200/80 hover:border-slate-300"
                                    }`}
                                >
                                    {/* Entry Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    isLatest
                                                        ? "bg-teal-600 text-white"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {isLatest ? "Latest Recording" : `#${history.length - idx}`}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                <Clock size={12} className="text-teal-600" />
                                                <span>{timestampStr}</span>
                                            </div>
                                        </div>
                                        {entry.recordedBy && (
                                            <span className="text-[11px] text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                                Recorded by: <span className="font-medium text-slate-600">{entry.recordedBy}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* 4 Vitals Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center gap-2.5 shadow-2xs">
                                            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 shrink-0">
                                                <Heart size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-semibold text-slate-400">Blood Pressure</div>
                                                <div className="text-xs font-bold text-slate-800">{entry.bp || "--"}</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center gap-2.5 shadow-2xs">
                                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                                                <Zap size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-semibold text-slate-400">Pulse</div>
                                                <div className="text-xs font-bold text-slate-800">{entry.pulse || "--"}</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center gap-2.5 shadow-2xs">
                                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500 shrink-0">
                                                <Thermometer size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-semibold text-slate-400">Temperature</div>
                                                <div className="text-xs font-bold text-slate-800">{entry.temp || "--"}</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center gap-2.5 shadow-2xs">
                                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 shrink-0">
                                                <Droplets size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-semibold text-slate-400">Weight</div>
                                                <div className="text-xs font-bold text-slate-800">{entry.weight || "--"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Notes if present */}
                                    {entry.notes && (
                                        <div className="mt-2.5 pt-2 border-t border-slate-100/70 text-[11px] text-slate-500 italic">
                                            <span className="font-semibold not-italic text-slate-600">Note:</span> {entry.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 text-center sm:text-left flex items-center gap-1.5">
                        <Check size={12} className="text-teal-600" /> All records stored in database with IST timestamps
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
