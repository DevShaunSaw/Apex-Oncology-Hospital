"use client";
import { useState } from "react";
import { appointments } from "../data/mockData";
import { Calendar, Clock, Video, MapPin, Check, ChevronRight } from "lucide-react";

const months = ["May 2024", "June 2024"];
const calDays = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const bookedDays = [22, 25];
const slots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];
const bookedSlots = ["10:00 AM", "2:30 PM"];

export default function AppointmentsPage() {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    const confirm = () => {
        if (selectedDay && selectedSlot) setConfirmed(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-display mb-1">Appointments</h1>
                    <p className="text-teal-200">Book, manage, and track your visits</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Upcoming */}
                <div className="mb-8">
                    <h2 className="font-semibold text-slate-700 mb-4">Upcoming Appointments</h2>
                    <div className="space-y-3">
                        {appointments.slice(0, 2).map(a => (
                            <div key={a.id} className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 flex items-center gap-4">
                                <div className="bg-teal-600 text-white rounded-xl p-3 text-center min-w-[56px]">
                                    <div className="text-lg font-bold leading-none">{a.date.split("-")[2]}</div>
                                    <div className="text-xs text-teal-200 mt-0.5">May</div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-800">{a.type}</div>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={13} />{a.time}</span>
                                        <span className="flex items-center gap-1"><MapPin size={13} />Apex Onco Care</span>
                                        <span className="text-teal-600">{a.doctor}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                    {a.status === "confirmed" ? <span className="flex items-center gap-1"><Check size={11} />Confirmed</span> : "Pending"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Book New */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-700 mb-5 flex items-center gap-2"><Calendar size={18} className="text-teal-600" /> Book New Appointment</h2>

                    {confirmed ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Appointment Confirmed!</h3>
                            <p className="text-slate-500">May {selectedDay}, {selectedSlot} — Dr. Priya Sharma</p>
                            <p className="text-sm text-teal-600 mt-2">You'll receive a confirmation on your registered mobile number.</p>
                            <button onClick={() => { setConfirmed(false); setSelectedDay(null); setSelectedSlot(null); }} className="mt-5 text-teal-600 text-sm hover:underline">Book another</button>
                        </div>
                    ) : (
                        <>
                            {/* Calendar Strip */}
                            <div className="mb-5">
                                <div className="text-sm font-medium text-slate-500 mb-3">May 2024 — Select a Date</div>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {calDays.map(day => {
                                        const isBooked = bookedDays.includes(day);
                                        const isSelected = selectedDay === day;
                                        return (
                                            <button key={day} onClick={() => !isBooked && setSelectedDay(day)} disabled={isBooked}
                                                className={`shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center text-sm transition-all ${isSelected ? "bg-teal-600 text-white shadow-teal-glow" :
                                                        isBooked ? "bg-slate-100 text-slate-300 cursor-not-allowed" :
                                                            "bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-100"
                                                    }`}>
                                                <span className="font-bold text-base">{day}</span>
                                                <span className="text-xs opacity-70">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(2024, 4, day).getDay()]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Slots */}
                            {selectedDay && (
                                <div className="mb-5">
                                    <div className="text-sm font-medium text-slate-500 mb-3">Available Slots — May {selectedDay}</div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                        {slots.map(slot => {
                                            const isBooked = bookedSlots.includes(slot);
                                            const isSelected = selectedSlot === slot;
                                            return (
                                                <button key={slot} onClick={() => !isBooked && setSelectedSlot(slot)} disabled={isBooked}
                                                    className={`py-2 rounded-xl text-xs font-medium transition-all ${isSelected ? "bg-teal-600 text-white" :
                                                            isBooked ? "bg-slate-100 text-slate-300 cursor-not-allowed line-through" :
                                                                "bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-100"
                                                        }`}>
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Type Select */}
                            {selectedSlot && (
                                <div className="mb-5">
                                    <div className="text-sm font-medium text-slate-500 mb-2">Appointment Type</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {["Infusion", "Consultation", "Lab Review", "Follow-up", "Radiation", "Second Opinion"].map(type => (
                                            <button key={type} className="py-2 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors text-left">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={confirm} disabled={!selectedDay || !selectedSlot}
                                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${selectedDay && selectedSlot ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                                Confirm Appointment <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}