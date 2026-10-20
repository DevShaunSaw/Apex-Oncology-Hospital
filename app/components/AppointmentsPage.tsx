"use client";
import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Calendar, Clock, Video, MapPin, Check, ChevronRight, MessageSquare, CheckCircle2, AlertCircle, X, User } from "lucide-react";
import AppointmentNotificationStatus from "./AppointmentNotificationStatus";

const HOURLY_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
];

const getISODateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function AppointmentsPage() {
    const { role, currentUser, setPage } = useApp();
    const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Doctor booking form states
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return getISODateString(tomorrow);
    });
    const [selectedType, setSelectedType] = useState("Consultation");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const minDateStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return getISODateString(d);
    })();

    const formatDateDisplay = (isoStr: string) => {
        try {
            const [y, m, d] = isoStr.split("-").map(Number);
            const dateObj = new Date(y, m - 1, d);
            return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return isoStr;
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            const data = await res.json();
            if (data.success) {
                setAppointmentsList(data.appointments);
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        if (role !== "doctor") return;
        try {
            const res = await fetch("/api/users?role=patient");
            const data = await res.json();
            if (data.users && data.users.length > 0) {
                setPatients(data.users);
                if (!selectedPatientId) {
                    setSelectedPatientId(data.users[0]._id);
                }
            }
        } catch (err) {
            console.error("Error fetching patients list:", err);
        }
    };

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
    }, [role]);

    // Calculate booked hourly slots for selected date
    const bookedSlotsForSelectedDate = useMemo(() => {
        if (!selectedDate) return new Set<string>();
        const booked = new Set<string>();
        appointmentsList.forEach(appt => {
            if (appt.status !== "cancelled" && (appt.date === selectedDate || appt.date?.includes(selectedDate))) {
                if (appt.time) {
                    const normalizedApptTime = appt.time.replace(/^0/, "").toUpperCase().trim();
                    booked.add(normalizedApptTime);
                }
            }
        });
        return booked;
    }, [appointmentsList, selectedDate]);

    const bookDoctorAppointment = async (slot: string) => {
        if (!selectedPatientId) {
            setBookingError("Please select a patient.");
            return;
        }
        if (!selectedDate) {
            setBookingError("Please pick a date.");
            return;
        }

        setIsBooking(true);
        setBookingError("");

        const chosenPatient = patients.find(p => p._id === selectedPatientId || p.id === selectedPatientId);
        const formattedDisplayDate = formatDateDisplay(selectedDate);

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    date: selectedDate,
                    time: slot,
                    type: selectedType,
                    contact: chosenPatient?.phone || chosenPatient?.email || "+91 99999 99999",
                    diseaseDetails: chosenPatient?.primaryConcern || chosenPatient?.healthHistory || "Scheduled via doctor appointments page",
                    treatmentPlan: "Review during scheduled appointment",
                }),
            });

            const data = await res.json();
            if (data.success) {
                fetchAppointments();
                setToastMessage(`Appointment booked successfully with ${chosenPatient?.name || "Patient"} on ${formattedDisplayDate} at ${slot}!`);
                setTimeout(() => setToastMessage(null), 5000);
            } else {
                setBookingError(data.error || "Booking failed.");
            }
        } catch (err: any) {
            setBookingError("Server error while scheduling appointment.");
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-teal-800 font-medium">Loading Appointments...</p>
                </div>
            </div>
        );
    }

    // DOCTOR SIDE: Shows schedule AND the same dynamic Date Picker & Hourly Slots booking system
    if (role === "doctor") {
        return (
            <div className="min-h-screen bg-slate-50 relative pb-16">
                {/* Header */}
                <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-display mb-1">Doctor's Schedule & Appointments</h1>
                        <p className="text-teal-200">Schedule patient consultations and manage upcoming visits</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                    <AppointmentNotificationStatus />

                    {/* Book New Appointment (Doctor Side) */}
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                    <Calendar size={19} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-800 text-base">Schedule New Appointment</h2>
                                    <p className="text-xs text-slate-400">Select patient, date, and available hourly slot</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Type:</span>
                                <select 
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                >
                                    <option value="Consultation">Consultation</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Lab Review">Lab Review</option>
                                    <option value="Infusion">Infusion</option>
                                    <option value="Second Opinion">Second Opinion</option>
                                </select>
                            </div>
                        </div>

                        {bookingError && (
                            <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{bookingError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Patient & Date Selection */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <User size={13} className="text-teal-600" />
                                        Select Patient
                                    </label>
                                    <select
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                                    >
                                        {patients.map((p) => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name} {p.disease ? `— ${p.disease}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <Calendar size={13} className="text-teal-600" />
                                        Appointment Date
                                    </label>
                                    <input 
                                        type="date"
                                        min={minDateStr}
                                        value={selectedDate}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setSelectedDate(e.target.value);
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Selected: <span className="font-semibold text-teal-700">{formatDateDisplay(selectedDate)}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Hourly Slots Grid */}
                            <div className="md:col-span-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <Clock size={13} className="text-teal-600" />
                                        Available Hourly Slots ({formatDateDisplay(selectedDate)})
                                    </label>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-teal-500"></span> Available
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Booked
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                                    {HOURLY_SLOTS.map((slot) => {
                                        const normalizedSlot = slot.replace(/^0/, "").toUpperCase().trim();
                                        const isBooked = bookedSlotsForSelectedDate.has(normalizedSlot);

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                disabled={isBooked || isBooking}
                                                onClick={() => bookDoctorAppointment(slot)}
                                                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
                                                    isBooked
                                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 line-through"
                                                        : "bg-white text-teal-800 border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:shadow-sm active:scale-95 cursor-pointer"
                                                }`}
                                                title={isBooked ? "Slot already booked" : `Book ${slot}`}
                                            >
                                                <span>{slot}</span>
                                                <span className="text-[9px] mt-0.5 opacity-80 font-normal">
                                                    {isBooked ? "Booked" : "Available"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Scheduled Appointments */}
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                        <h2 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
                            <Clock size={18} className="text-teal-600" />
                            All Scheduled Appointments ({appointmentsList.length})
                        </h2>

                        {appointmentsList.length === 0 ? (
                            <p className="text-center py-12 text-slate-400 text-sm font-medium">You have no appointments scheduled.</p>
                        ) : (
                            <div className="space-y-4">
                                {appointmentsList.map(a => (
                                    <div key={a.id || a._id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-teal-50 text-teal-800 font-bold p-3 rounded-xl text-center min-w-[80px]">
                                                <div className="text-[10px] text-teal-600 uppercase font-semibold leading-tight">{a.time}</div>
                                                <div className="text-xs mt-0.5 font-bold">{a.date}</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">{a.patientName || a.patient}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                                                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-medium">{a.type}</span>
                                                    {a.contact && <span>• {a.contact}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${a.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                                {a.status}
                                            </span>
                                            <button onClick={() => setPage("chat")} className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors" title="Chat with patient">
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Green Success Toast */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 z-50 animate-slideIn">
                        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 max-w-md">
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={18} className="text-white" />
                            </div>
                            <div className="text-xs font-medium leading-relaxed flex-1">
                                <span className="font-bold block text-sm">Appointment Confirmed</span>
                                {toastMessage}
                            </div>
                            <button
                                onClick={() => setToastMessage(null)}
                                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // USER / PATIENT SIDE: View-only dashboard of upcoming and past appointments. Booking is on doctor side.
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-display mb-1">My Appointments</h1>
                    <p className="text-teal-200">Track and manage your scheduled oncologist visits and care sessions</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <AppointmentNotificationStatus />

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="font-semibold text-slate-800 text-lg">Upcoming Care Visits</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Appointments are scheduled directly by your oncologist based on your personalized treatment plan.
                            </p>
                        </div>
                        <button
                            onClick={() => setPage("chat")}
                            className="flex items-center gap-2 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-3.5 py-2 rounded-xl hover:bg-teal-100 transition-colors"
                        >
                            <MessageSquare size={14} /> Message Doctor
                        </button>
                    </div>

                    <div className="mt-5">
                        {appointmentsList.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar size={22} />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">No upcoming appointments booked</p>
                                <p className="text-xs text-slate-400 mt-1">Your doctor will schedule your next consultation or review slot here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {appointmentsList.map((a) => (
                                    <div key={a.id || a._id} className="bg-slate-50/60 rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-teal-50/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-teal-600 text-white rounded-xl p-3 text-center min-w-[62px]">
                                                <div className="text-sm font-bold leading-tight">
                                                    {a.date?.includes("-") ? a.date.split("-").slice(1).join("/") : a.date}
                                                </div>
                                                <div className="text-[10px] text-teal-200 uppercase mt-0.5 font-semibold">Visit</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">{a.type}</div>
                                                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={13} className="text-teal-600" />{a.time}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={13} className="text-teal-600" />Apex Infusion Centre</span>
                                                    <span className="text-teal-700 font-semibold">{a.doctorName || a.doctor}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${a.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                            {a.status === "confirmed" ? (
                                                <span className="flex items-center gap-1"><Check size={11} />Confirmed</span>
                                            ) : (
                                                a.status
                                            )}
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