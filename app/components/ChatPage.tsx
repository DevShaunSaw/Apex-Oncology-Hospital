"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Send, Paperclip, Phone, Video, MoreVertical, Calendar, FileText, ChevronRight, Image as ImageIcon, CheckCircle2, Clock, X, AlertCircle, Bell, Film, Cloud } from "lucide-react";
import { usePushNotifications } from "@/lib/usePushNotifications";

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

// Helper to format Date to YYYY-MM-DD in local time
const getISODateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function ChatPage() {
    const { currentUser, role, activeChatPartner, setActiveChatPartner } = useApp();
    const { isSubscribed, subscribeToPush } = usePushNotifications();
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [showSlots, setShowSlots] = useState(false);
    
    // Date picker state - defaults to tomorrow (next day)
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return getISODateString(tomorrow);
    });
    
    const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // Fetch existing appointments when slot drawer opens to check booked slots
    useEffect(() => {
        if (!showSlots || role !== "doctor") return;
        const fetchExisting = async () => {
            setLoadingSlots(true);
            try {
                const res = await fetch("/api/appointments");
                const data = await res.json();
                if (data.success && Array.isArray(data.appointments)) {
                    setExistingAppointments(data.appointments);
                }
            } catch (err) {
                console.error("Error fetching appointments for slots:", err);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchExisting();
    }, [showSlots, role]);

    // Minimum selectable date is tomorrow
    const minDateStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return getISODateString(d);
    })();

    // Helper to format date display e.g. "Oct 17, 2026"
    const formatDateDisplay = (isoStr: string) => {
        try {
            const [y, m, d] = isoStr.split("-").map(Number);
            const dateObj = new Date(y, m - 1, d);
            return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return isoStr;
        }
    };

    // Calculate which hourly slots are already booked on the selected date
    const bookedSlotsForSelectedDate = useMemo(() => {
        if (!selectedDate) return new Set<string>();
        const booked = new Set<string>();
        existingAppointments.forEach(appt => {
            // Check matching date (either ISO YYYY-MM-DD or partial match)
            if (appt.status !== "cancelled" && (appt.date === selectedDate || appt.date?.includes(selectedDate))) {
                if (appt.time) {
                    // Normalize time format e.g. "09:00 AM" or "9:00 AM"
                    const normalizedApptTime = appt.time.replace(/^0/, "").toUpperCase().trim();
                    booked.add(normalizedApptTime);
                }
            }
        });
        return booked;
    }, [existingAppointments, selectedDate]);

    // Fetch all available contact options (doctors for patient, patients for doctor)
    useEffect(() => {
        const fetchAvailableUsers = async () => {
            try {
                const targetRole = role === "patient" ? "doctor" : "patient";
                const res = await fetch(`/api/users?role=${targetRole}`);
                const data = await res.json();
                if (data.users) {
                    setAvailableUsers(data.users);
                }
            } catch (err) {
                console.error("Error fetching available users:", err);
            }
        };

        if (role) {
            fetchAvailableUsers();
        }
    }, [role]);

    // Fetch conversations list
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch("/api/chat/conversations");
                const data = await res.json();
                if (data.conversations) {
                    setConversations(data.conversations);
                    if (!activeChatPartner && data.conversations.length > 0) {
                        setActiveChatPartner(data.conversations[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, [activeChatPartner, setActiveChatPartner]);

    // Fetch and poll messages
    useEffect(() => {
        if (!activeChatPartner) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/messages?userId=${activeChatPartner._id}`);
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [activeChatPartner]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || !activeChatPartner) return;
        const msgText = input;
        setInput("");

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: activeChatPartner._id,
                    message: msgText,
                    type: "text",
                }),
            });
            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [...prev, data.message]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const [bookingType, setBookingType] = useState("Consultation");
    const [isBooking, setIsBooking] = useState(false);

    const [bookingError, setBookingError] = useState<string | null>(null);

    const bookSlot = async (date: string, slot: string) => {
        if (!activeChatPartner || isBooking) return;
        setIsBooking(true);
        setBookingError(null);

        const appointmentType = bookingType || "Consultation";
        const formattedDisplayDate = formatDateDisplay(date);
        const apptText = `Appointment scheduled: ${formattedDisplayDate}, ${slot} (${appointmentType}) — Apex Onco Care`;
        
        try {
            // 1. Create real appointment in the database
            const apptRes = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: activeChatPartner._id,
                    date: date,
                    time: slot,
                    type: appointmentType,
                    contact: activeChatPartner.phone || activeChatPartner.email || "+91 99999 99999",
                    diseaseDetails: activeChatPartner.primaryConcern || activeChatPartner.healthHistory || "Consultation scheduled via chat",
                    treatmentPlan: "Review during scheduled chat visit",
                }),
            });
            const apptData = await apptRes.json();
            
            if (!apptRes.ok || !apptData.success) {
                setBookingError(apptData.error || "Failed to schedule appointment.");
                return;
            }

            // 2. Post appointment confirmation message to the chat
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: activeChatPartner._id,
                    message: apptText,
                    type: "appointment",
                }),
            });
            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [...prev, data.message]);
            }

            // 3. Update existingAppointments state with newly booked appointment
            if (apptData.appointment) {
                setExistingAppointments((prev) => [...prev, apptData.appointment]);
            }

            // 4. Trigger green success toast & close panel
            setShowSlots(false);
            setToastMessage(`Appointment booked successfully with ${activeChatPartner.name} on ${formattedDisplayDate} at ${slot}!`);
            setTimeout(() => {
                setToastMessage(null);
            }, 5000);
        } catch (error: any) {
            console.error("Error booking appointment:", error);
            setBookingError("Network or server error while booking appointment.");
        } finally {
            setIsBooking(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatPartner) return;
        if (e.target) e.target.value = "";

        const allowedExtensions = [
            "jpg", "jpeg", "png", "webp", "gif", "svg",
            "mp4", "webm", "mov", "m4v",
            "pdf",
            "doc", "docx", "txt", "rtf", "csv", "xls", "xlsx", "ppt", "pptx"
        ];

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!allowedExtensions.includes(ext) && !file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            alert("Unsupported file format. Only image formats (JPG, PNG, WEBP, GIF, SVG), short videos (MP4, WEBM, MOV), PDFs, and documents (DOC, DOCX, TXT, CSV, XLS, PPT) are allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/chat/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await res.json();

            if (res.ok && uploadData.fileUrl) {
                const isImage = uploadData.category === "image" || ["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG"].includes(uploadData.fileType?.toUpperCase());
                const isVideo = uploadData.category === "video" || ["MP4", "WEBM", "MOV", "M4V"].includes(uploadData.fileType?.toUpperCase());
                const validatedType = isImage ? "image" : isVideo ? "video" : "document";

                const msgRes = await fetch("/api/chat/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        receiverId: activeChatPartner._id,
                        message: isImage ? `Shared image: ${uploadData.fileName}` : isVideo ? `Shared video: ${uploadData.fileName}` : `Shared file: ${uploadData.fileName}`,
                        type: validatedType,
                        fileName: uploadData.fileName,
                        fileUrl: uploadData.fileUrl,
                        fileType: uploadData.fileType,
                        objectKey: uploadData.objectKey,
                        fileSize: uploadData.fileSize,
                        mimeType: uploadData.mimeType,
                    }),
                });

                const msgData = await msgRes.json();
                if (msgData.message) {
                    setMessages((prev) => [...prev, msgData.message]);
                }
            } else {
                alert(uploadData.error || "File upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("An error occurred while uploading file to cloud storage.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Sidebar — Conversations */}
            <div className="hidden lg:flex lg:w-72 bg-white border-r border-slate-100 flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center relative">
                    <h2 className="font-semibold text-slate-700">Conversations</h2>
                    <button onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
                        className="text-xs bg-teal-600 text-white px-2.5 py-1.5 rounded-xl hover:bg-teal-700 transition-all font-semibold flex items-center gap-1">
                        + New Chat
                    </button>
                    {showNewChatDropdown && (
                        <div className="absolute right-4 top-full mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-card p-2 z-50 max-h-60 overflow-y-auto">
                            <div className="text-xs font-semibold text-slate-400 p-1 border-b border-slate-50 mb-1">
                                {role === "patient" ? "Choose a Doctor" : "Choose a Patient"}
                            </div>
                            {availableUsers.map((u) => (
                                <button key={u._id} onClick={() => {
                                    setActiveChatPartner(u);
                                    setShowNewChatDropdown(false);
                                    if (!conversations.some(c => c._id === u._id)) {
                                        setConversations(prev => [u, ...prev]);
                                    }
                                }} className="w-full text-left px-2 py-1.5 rounded hover:bg-teal-50 text-xs font-medium text-slate-700 truncate block">
                                    {u.name} {u.specialty ? `(${u.specialty})` : ""}
                                </button>
                            ))}
                            {availableUsers.length === 0 && (
                                <div className="text-slate-400 text-xs p-2 text-center">No registered contacts.</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((c) => {
                        const active = activeChatPartner?._id === c._id;
                        const initials = c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                        return (
                            <div key={c._id} onClick={() => setActiveChatPartner(c)}
                                className={`p-4 flex items-start gap-3 cursor-pointer border-b border-slate-50 hover:bg-teal-50 transition-colors ${active ? "bg-teal-50 border-l-2 border-l-teal-500" : ""}`}>
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{initials}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-800 truncate">{c.name}</span>
                                    </div>
                                    <div className="text-xs text-teal-500">{c.specialty || (c.role === "patient" ? "Patient" : "Support Team")}</div>
                                    <div className="text-xs text-slate-500 truncate mt-0.5">{c.city || "Online"}</div>
                                </div>
                            </div>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-xs mt-8">No active chats found.</div>
                    )}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col max-h-screen">
                {/* Chat Header */}
                <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {activeChatPartner ? (
                            <>
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                                    {activeChatPartner.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-800">{activeChatPartner.name}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-teal"></span> Online — {activeChatPartner.specialty || (activeChatPartner.role === "patient" ? "Patient Dashboard" : "Support")}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-400 font-medium">Select a conversation</div>
                        )}
                    </div>
                    {activeChatPartner && (
                        <div className="flex items-center gap-2">
                            {/* Push notification status / quick-optin */}
                            {!isSubscribed ? (
                                <button
                                    onClick={subscribeToPush}
                                    title="Click to receive instant push alerts when you receive messages"
                                    className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                                >
                                    <Bell size={13} className="text-amber-600" />
                                    <span>Get Message Alerts</span>
                                </button>
                            ) : (
                                <span
                                    title="Push notifications active on this device"
                                    className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold"
                                >
                                    <Bell size={12} className="text-emerald-600" />
                                    <span>Alerts Active</span>
                                </span>
                            )}

                            {role === "doctor" && (
                                <button onClick={() => setShowSlots(!showSlots)} className="flex items-center gap-1.5 text-sm text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition-colors font-medium cursor-pointer">
                                    <Calendar size={14} className="text-teal-600" /> Book Appointment
                                </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><Phone size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><Video size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><MoreVertical size={18} /></button>
                        </div>
                    )}
                </div>

                {/* Slot Picker for Doctor */}
                {role === "doctor" && showSlots && (
                    <div className="bg-slate-50 border-b border-teal-100 p-4 transition-all animate-fadeIn">
                        <div className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                        <Calendar size={17} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800">
                                            Schedule Patient Visit
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Book an appointment with {activeChatPartner.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-slate-500 font-medium">Type:</span>
                                        <select 
                                            value={bookingType}
                                            onChange={(e) => setBookingType(e.target.value)}
                                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                        >
                                            <option value="Consultation">Consultation</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Lab Review">Lab Review</option>
                                            <option value="Infusion">Infusion</option>
                                            <option value="Second Opinion">Second Opinion</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={() => setShowSlots(false)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                        title="Close"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {bookingError && (
                                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{bookingError}</span>
                                </div>
                            )}

                            {/* Date Picker & Hourly Slot Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Date Picker Input */}
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

                                {/* Hourly Time Slots */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                            <Clock size={13} className="text-teal-600" />
                                            Available Hourly Slots
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

                                    {loadingSlots ? (
                                        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                            Checking booked slots...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                                            {HOURLY_SLOTS.map((slot) => {
                                                const normalizedSlot = slot.replace(/^0/, "").toUpperCase().trim();
                                                const isBooked = bookedSlotsForSelectedDate.has(normalizedSlot);

                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={isBooked || isBooking}
                                                        onClick={() => bookSlot(selectedDate, slot)}
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.sender === currentUser?._id || msg.sender?.toString() === currentUser?._id;
                        const isVideo = msg.type === "video" || ["MP4", "WEBM", "MOV", "M4V"].includes(msg.fileType?.toUpperCase());
                        const isImage = msg.type === "image" || ["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG"].includes(msg.fileType?.toUpperCase());
                        const isFileMessage = msg.type === "document" || isImage || isVideo;

                        return (
                            <div key={msg._id || msg.id}>
                                {msg.type === "appointment" ? (
                                    <div className="flex justify-center">
                                        <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-sm">
                                            <Calendar size={15} className="text-teal-500 shrink-0" />
                                            <span>{msg.message}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                                                {activeChatPartner?.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                            </div>
                                        )}
                                        <div className={`max-w-xs sm:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                            {!isMe && <span className="text-xs text-slate-400 ml-1">{activeChatPartner?.name}</span>}
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-teal-600 text-white rounded-br-none" :
                                                isFileMessage ? "bg-white border border-slate-200 rounded-bl-none shadow-sm" :
                                                    "bg-white border border-slate-100 rounded-bl-none shadow-sm"
                                                }`}>
                                                {isFileMessage ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                            isVideo ? "bg-purple-100 text-purple-600" : isImage ? "bg-teal-100 text-teal-600" : "bg-indigo-100 text-indigo-600"
                                                        }`}>
                                                            {isVideo ? <Film size={18} /> : isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-slate-700 text-sm truncate max-w-[170px]">{msg.fileName || "Attachment"}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 flex items-center gap-1 hover:underline font-semibold">
                                                                    {msg.fileType || "File"} <ChevronRight size={12} /> View
                                                                </a>
                                                                <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 flex items-center gap-0.5">
                                                                    <Cloud size={10} /> GCP
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    msg.message
                                                )}
                                            </div>

                                            {/* Show Video Player if attachment is video */}
                                            {isVideo && msg.fileUrl && (
                                                <div className="mt-1 border border-slate-200 rounded-xl overflow-hidden max-w-[280px] sm:max-w-[320px] shadow-sm bg-black p-1">
                                                    <video
                                                        controls
                                                        playsInline
                                                        preload="metadata"
                                                        src={msg.fileUrl}
                                                        className="w-full max-h-[200px] rounded-lg object-contain bg-black"
                                                    >
                                                        Your browser does not support HTML5 video.
                                                    </video>
                                                </div>
                                            )}

                                            {/* Show Image preview if message type is explicit or contains image file type mapping */}
                                            {isImage && msg.fileUrl && (
                                                <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden max-w-[220px] shadow-sm bg-white p-1">
                                                    <img src={msg.fileUrl} alt={msg.fileName || "Chat Upload"} className="object-cover w-full h-auto max-h-[170px] rounded-lg" />
                                                </div>
                                            )}
                                            <span className="text-xs text-slate-400 mx-1">{msg.time}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {messages.length === 0 && activeChatPartner && (
                        <div className="p-4 text-center text-slate-400 text-xs mt-8">No messages yet. Send a message to start the conversation!</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {activeChatPartner && (
                    <div className="bg-white border-t border-slate-100 px-4 py-3">
                        {uploading && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 animate-pulse">
                                <Cloud size={14} className="text-teal-600 animate-bounce" />
                                <span className="font-medium">Uploading attachment to Google Cloud Storage bucket...</span>
                            </div>
                        )}
                        <div className="flex items-end gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx,.ppt,.pptx,application/pdf"
                            />
                            <input
                                type="file"
                                ref={imageInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg"
                            />
                            <input
                                type="file"
                                ref={videoInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className={`p-2.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors ${uploading ? "opacity-50" : ""}`}
                                title="Upload PDF or Document (.pdf, .doc, .docx, .txt, .csv, etc.)"
                            >
                                <Paperclip size={18} />
                            </button>
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                disabled={uploading}
                                className={`p-2.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors ${uploading ? "opacity-50" : ""}`}
                                title="Upload Image (.jpg, .png, .webp, .gif, .svg)"
                            >
                                <ImageIcon size={18} />
                            </button>
                            <button
                                onClick={() => videoInputRef.current?.click()}
                                disabled={uploading}
                                className={`p-2.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors ${uploading ? "opacity-50" : ""}`}
                                title="Upload Short Video (.mp4, .webm, .mov)"
                            >
                                <Film size={18} />
                            </button>

                            <textarea
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                                placeholder={uploading ? "Uploading file..." : "Type a message..."}
                                disabled={uploading}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                            />
                            <button onClick={send} disabled={uploading} className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar — Selected Contact Info */}
            {activeChatPartner && (
                <div className="hidden xl:flex w-64 bg-white border-l border-slate-100 flex-col p-4">
                    <h3 className="font-semibold text-slate-700 mb-4">{role === "doctor" ? "Patient Info" : "Doctor Info"}</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Name</span>
                            <span className="font-medium text-slate-700">{activeChatPartner.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Email</span>
                            <span className="font-medium text-slate-700 break-all">{activeChatPartner.email}</span>
                        </div>
                        {role === "doctor" ? (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">City</span>
                                    <span className="font-medium text-slate-700">{activeChatPartner.city || "Not Provided"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Dob</span>
                                    <span className="font-medium text-slate-700">{activeChatPartner.dob || "Not Provided"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Preferred Language</span>
                                    <span className="font-medium text-slate-700">{activeChatPartner.preferredLanguage || "Not Provided"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">History / Diagnosis</span>
                                    <span className="font-medium text-slate-700 mt-1 line-clamp-6 leading-tight text-xs bg-teal-50 border border-teal-100 p-2 rounded-lg text-teal-800">
                                        {activeChatPartner.healthHistory || activeChatPartner.primaryConcern || "No record uploaded."}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Specialty</span>
                                    <span className="font-medium text-teal-700">{activeChatPartner.specialty || "Medical Oncology"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Experience</span>
                                    <span className="font-medium text-slate-700">{activeChatPartner.experience || "10+ years"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Available</span>
                                    <span className="font-medium text-emerald-600">{activeChatPartner.available ? "Yes (Online)" : "Offline"}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}