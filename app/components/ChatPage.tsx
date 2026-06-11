"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Send, Paperclip, Phone, Video, MoreVertical, Calendar, FileText, ChevronRight, Image as ImageIcon } from "lucide-react";

const slotDates = [
    { date: "May 22", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "3:30 PM"] },
    { date: "May 23", slots: ["10:00 AM", "11:30 AM", "4:00 PM"] },
    { date: "May 24", slots: ["9:30 AM", "1:00 PM", "2:30 PM"] },
];

export default function ChatPage() {
    const { currentUser, role, activeChatPartner, setActiveChatPartner } = useApp();
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [showSlots, setShowSlots] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

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
                    // If no active partner is selected yet, choose the first one
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

    const bookSlot = async (date: string, slot: string) => {
        if (!activeChatPartner) return;
        setShowSlots(false);

        const apptText = `Appointment confirmed: ${date}, ${slot} — Apex Onco Care`;
        try {
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
        } catch (error) {
            console.error("Error booking appointment:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatPartner) return;

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
                // Send chat message with file details
                const msgRes = await fetch("/api/chat/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        receiverId: activeChatPartner._id,
                        message: `Shared file: ${uploadData.fileName}`,
                        type: "file",
                        fileName: uploadData.fileName,
                        fileUrl: uploadData.fileUrl,
                        fileType: uploadData.fileType,
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
                            {role === "patient" && (
                                <button onClick={() => setShowSlots(!showSlots)} className="flex items-center gap-1.5 text-sm text-teal-600 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-50 transition-colors">
                                    <Calendar size={14} /> Book Appointment
                                </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><Phone size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><Video size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"><MoreVertical size={18} /></button>
                        </div>
                    )}
                </div>

                {/* Slot Picker */}
                {showSlots && (
                    <div className="bg-teal-50 border-b border-teal-100 px-4 py-4">
                        <h4 className="text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2"><Calendar size={16} /> Select Appointment Slot</h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {slotDates.map(d => (
                                <div key={d.date} className="shrink-0">
                                    <button onClick={() => setSelectedDate(selectedDate === d.date ? null : d.date)}
                                        className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${selectedDate === d.date ? "bg-teal-600 text-white border-teal-600" : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100"}`}>
                                        {d.date}
                                    </button>
                                    {selectedDate === d.date && (
                                        <div className="mt-2 flex flex-col gap-1.5">
                                            {d.slots.map(slot => (
                                                <button key={slot} onClick={() => bookSlot(d.date, slot)}
                                                    className="bg-white text-teal-700 text-xs px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-600 hover:text-white transition-colors">
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.sender === currentUser?._id || msg.sender?.toString() === currentUser?._id;
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
                                                    msg.type === "file" ? "bg-white border border-slate-200 rounded-bl-none" :
                                                        "bg-white border border-slate-100 rounded-bl-none shadow-sm"
                                                }`}>
                                                {msg.type === "file" ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center"><FileText size={18} className="text-teal-600" /></div>
                                                        <div>
                                                            <div className="font-medium text-slate-700 text-sm truncate max-w-[150px]">{msg.fileName}</div>
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 flex items-center gap-1 mt-0.5 hover:underline">
                                                                {msg.fileType} <ChevronRight size={12} /> View / Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    msg.message
                                                )}
                                            </div>
                                            {msg.type === "file" && ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(msg.fileType?.toUpperCase()) && (
                                                <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden max-w-[200px]">
                                                    <img src={msg.fileUrl} alt={msg.fileName} className="object-cover w-full h-auto max-h-[150px]" />
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
                        <div className="flex items-end gap-2">
                            {/* Hidden file inputs */}
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                            <input type="file" ref={imageInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                className={`p-2.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors ${uploading ? "opacity-50" : ""}`} title="Upload PDF or Document">
                                <Paperclip size={18} />
                            </button>
                            <button onClick={() => imageInputRef.current?.click()} disabled={uploading}
                                className={`p-2.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors ${uploading ? "opacity-50" : ""}`} title="Upload Image">
                                <ImageIcon size={18} />
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