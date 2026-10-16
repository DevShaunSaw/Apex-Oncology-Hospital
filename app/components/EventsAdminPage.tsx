"use client";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
    Plus, Edit3, Trash2, Calendar, MapPin, Users, Video, Mic,
    Save, X, Search,
} from "lucide-react";

interface EventItem {
    id: string;
    _id?: string;
    title: string;
    type: string;
    date: string;
    time: string;
    speaker: string;
    seats: number;
    registered: number;
    mode: string;
    location: string;
}

const emptyEvent: Omit<EventItem, "id" | "_id"> = {
    title: "",
    type: "Seminar",
    date: "",
    time: "",
    speaker: "",
    seats: 100,
    registered: 0,
    mode: "In-Person",
    location: "",
};

export default function EventsAdminPage() {
    const { setPage } = useApp();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyEvent);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const flash = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleSave = async () => {
        if (!form.title || !form.date || !form.time || !form.speaker || !form.location) {
            flash("Please fill in all required fields.");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                // Update
                const res = await fetch("/api/events", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...form }),
                });
                const data = await res.json();
                if (data.success) {
                    flash("Event updated successfully!");
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyEvent);
                    fetchEvents();
                } else {
                    flash(data.error || "Failed to update event.");
                }
            } else {
                // Create
                const res = await fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (data.success) {
                    flash("Event created successfully!");
                    setShowForm(false);
                    setForm(emptyEvent);
                    fetchEvents();
                } else {
                    flash(data.error || "Failed to create event.");
                }
            }
        } catch (err) {
            flash("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ev: EventItem) => {
        setEditingId(ev.id || ev._id || "");
        setForm({
            title: ev.title,
            type: ev.type,
            date: ev.date,
            time: ev.time,
            speaker: ev.speaker,
            seats: ev.seats,
            registered: ev.registered,
            mode: ev.mode,
            location: ev.location,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                flash("Event deleted successfully!");
                fetchEvents();
            } else {
                flash(data.error || "Failed to delete event.");
            }
        } catch (err) {
            flash("An error occurred. Please try again.");
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyEvent);
    };

    const types = ["All", "Seminar", "Workshop", "Support Group"];
    const filtered = events
        .filter(e => filter === "All" || e.type === filter)
        .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.speaker.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-700 font-medium">Loading Events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-semibold">Events Management</h1>
                            <p className="text-slate-300 text-sm mt-1">Create, edit, and manage events &amp; seminars across the platform</p>
                        </div>
                        <button
                            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyEvent); }}
                            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-teal-500/20"
                        >
                            <Plus size={16} /> Create Event
                        </button>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        {[
                            ["Total Events", events.length],
                            ["Seminars", events.filter(e => e.type === "Seminar").length],
                            ["Workshops", events.filter(e => e.type === "Workshop").length],
                            ["Support Groups", events.filter(e => e.type === "Support Group").length],
                        ].map(([label, count]) => (
                            <div key={label as string} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-slate-300 text-xs">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Flash Message */}
                {message && (
                    <div className={`p-3 rounded-xl text-sm mb-6 ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {message}
                    </div>
                )}

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {editingId ? "Edit Event" : "Create New Event"}
                            </h3>
                            <button onClick={handleCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Event Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="e.g. Advances in Immuno-Oncology"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type *</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                                >
                                    <option>Seminar</option>
                                    <option>Workshop</option>
                                    <option>Support Group</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date *</label>
                                <input
                                    type="text"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="e.g. June 8, 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Time *</label>
                                <input
                                    type="text"
                                    value={form.time}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="e.g. 11:00 AM – 1:00 PM"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Speaker *</label>
                                <input
                                    type="text"
                                    value={form.speaker}
                                    onChange={e => setForm({ ...form, speaker: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="e.g. Dr. Priya Sharma"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mode *</label>
                                <select
                                    value={form.mode}
                                    onChange={e => setForm({ ...form, mode: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white"
                                >
                                    <option>In-Person</option>
                                    <option>Online</option>
                                    <option>In-Person + Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total Seats</label>
                                <input
                                    type="number"
                                    value={form.seats}
                                    onChange={e => setForm({ ...form, seats: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Location *</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                                    placeholder="e.g. Apex Onco Care, Mumbai"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
                            <button onClick={handleCancel} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                <Save size={14} /> {saving ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {types.map(t => (
                            <button key={t} onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${filter === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="relative sm:ml-auto">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 w-full sm:w-64"
                            placeholder="Search events..."
                        />
                    </div>
                </div>

                {/* Events List */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No events found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or create a new event.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(ev => {
                            const seatsLeft = ev.seats - ev.registered;
                            return (
                                <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all overflow-hidden">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Date Block */}
                                        <div className={`p-5 flex flex-col items-center justify-center sm:w-28 shrink-0 ${ev.type === "Seminar" ? "bg-teal-600" : ev.type === "Workshop" ? "bg-amber-500" : "bg-purple-600"} text-white`}>
                                            <div className="text-2xl font-display font-bold">{ev.date.split(",")[0].split(" ")[1] || "∞"}</div>
                                            <div className="text-xs text-white/70 mt-0.5">{ev.date.includes(",") ? ev.date.split(" ")[0] : "Weekly"}</div>
                                        </div>

                                        <div className="p-5 flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ev.type === "Seminar" ? "bg-teal-100 text-teal-700" : ev.type === "Workshop" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>{ev.type}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${ev.mode.includes("Online") ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"} flex items-center gap-1`}>
                                                            {ev.mode.includes("Online") ? <Video size={10} /> : <MapPin size={10} />} {ev.mode}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-slate-800">{ev.title}</h3>
                                                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1"><Calendar size={12} />{ev.date}</span>
                                                        <span className="flex items-center gap-1"><Mic size={12} />{ev.speaker}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={12} />{ev.location}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Users size={12} />{ev.registered}/{ev.seats}
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                                                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min((ev.registered / ev.seats) * 100, 100)}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-medium ${seatsLeft <= 5 ? "text-red-500" : "text-emerald-600"}`}>
                                                        {seatsLeft} seats left
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex sm:flex-col items-center justify-center gap-1 px-3 py-3 sm:py-0 border-t sm:border-t-0 sm:border-l border-slate-100">
                                            <button onClick={() => handleEdit(ev)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                                                <Edit3 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(ev.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
