"use client";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { events } from "../data/mockData";
import { Calendar, MapPin, Users, Video, Mic } from "lucide-react";

export default function EventsPage() {
    const { setPage } = useApp();
    const [filter, setFilter] = useState("All");
    const types = ["All", "Seminar", "Workshop", "Support Group"];
    const filtered = filter === "All" ? events : events.filter(e => e.type === filter);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-16 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-display mb-3">Events &amp; Seminars</h1>
                <p className="text-teal-200 max-w-xl mx-auto">Learn, connect, and heal together — in-person and online events for patients and families</p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                {/* Filters */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {types.map(t => (
                        <button key={t} onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${filter === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="space-y-5">
                    {filtered.map(ev => {
                        const seatsLeft = ev.seats - ev.registered;
                        return (
                            <div key={ev.id} className="bg-white rounded-2xl shadow-card border border-slate-100 hover:shadow-card-hover hover:border-teal-100 transition-all overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Date Block */}
                                    <div className="bg-teal-600 text-white p-6 flex flex-col items-center justify-center sm:w-32 shrink-0">
                                        <div className="text-3xl font-display font-bold">{ev.date.split(",")[0].split(" ")[1] || "∞"}</div>
                                        <div className="text-sm text-teal-200 mt-1">{ev.date.includes(",") ? ev.date.split(" ")[0] : "Weekly"}</div>
                                    </div>

                                    <div className="p-6 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ev.type === "Seminar" ? "bg-teal-100 text-teal-700" : ev.type === "Workshop" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>{ev.type}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ev.mode.includes("Online") ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"} flex items-center gap-1`}>
                                                        {ev.mode.includes("Online") ? <Video size={10} /> : <MapPin size={10} />} {ev.mode}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-800">{ev.title}</h3>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={13} />{ev.date}</span>
                                                    <span className="flex items-center gap-1"><Mic size={13} />{ev.speaker}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={13} />{ev.location}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm text-slate-500 flex items-center gap-1 justify-end">
                                                    <Users size={14} />{ev.registered}/{ev.seats} registered
                                                </div>
                                                <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 mb-3">
                                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(ev.registered / ev.seats) * 100}%` }} />
                                                </div>
                                                {seatsLeft <= 3 ? (
                                                    <span className="text-xs text-red-500 font-medium">Only {seatsLeft} seats left!</span>
                                                ) : (
                                                    <span className="text-xs text-emerald-600">{seatsLeft} seats available</span>
                                                )}
                                            </div>
                                        </div>

                                        <button onClick={() => setPage("register")} className="mt-4 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
                                            Register for Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Host CTA */}
                <div className="mt-10 bg-teal-900 text-white rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-display mb-2">Want to Suggest a Topic?</h3>
                    <p className="text-teal-300 text-sm mb-4">Our medical team organises seminars based on patient and family requests. Tell us what you'd like to learn about.</p>
                    <button onClick={() => setPage("chat")} className="bg-white text-teal-800 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors">
                        Suggest a Topic via Chat →
                    </button>
                </div>
            </div>
        </div>
    );
}