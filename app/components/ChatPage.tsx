"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
    Send, Paperclip, Calendar, FileText,
    Image as ImageIcon, CheckCircle2, Clock, X, AlertCircle, Bell, Film,
    ZoomIn, ZoomOut, Download, Maximize2, Menu, Info, Search, Users,
    Stethoscope, UserCheck, MessageCircle, Star, AtSign, User,
    MoreVertical, UserPlus
} from "lucide-react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { doctors as mockDoctors } from "../data/mockData";

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

// Helper to safely get user or doctor initials without throwing if name is missing/undefined
const getInitials = (name?: string, fallback = "AP") => {
    if (!name || typeof name !== "string") return fallback;
    const clean = name.replace(/^Dr\.?\s*/i, "").trim();
    if (!clean) return fallback;
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return fallback;
    return parts.map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

interface ActiveMediaItem {
    type: "image" | "video";
    url: string;
    fileName: string;
    objectKey?: string;
    fileSize?: number;
}

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
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const isInitialLoadRef = useRef(true);

    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // Mobile drawers & conversation search
    const [showMobileConversations, setShowMobileConversations] = useState(false);
    const [showMobileUserDetails, setShowMobileUserDetails] = useState(false);
    const [conversationSearch, setConversationSearch] = useState("");

    // Doctor referral @ mention state
    const [allDoctors, setAllDoctors] = useState<any[]>([]);
    const [showDoctorMentionMenu, setShowDoctorMentionMenu] = useState(false);
    const [doctorMentionQuery, setDoctorMentionQuery] = useState("");
    const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
    const [viewingDoctorProfile, setViewingDoctorProfile] = useState<any | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Doctor patient self-assignment state
    const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
    const [showAssignConfirmModal, setShowAssignConfirmModal] = useState(false);
    const [isAssigningPatient, setIsAssigningPatient] = useState(false);
    const ellipsisMenuRef = useRef<HTMLDivElement>(null);

    // Attachment menu state (clip button popup)
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);

    // Built-in Media Viewer state
    const [activeMedia, setActiveMedia] = useState<ActiveMediaItem | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

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

        const fetchDoctorsList = async () => {
            try {
                const res = await fetch("/api/users?role=doctor&all=true");
                const data = await res.json();
                if (data.users && Array.isArray(data.users) && data.users.length > 0) {
                    setAllDoctors(data.users);
                } else {
                    setAllDoctors(mockDoctors.map(d => ({ ...d, _id: d.id })));
                }
            } catch (err) {
                console.error("Error fetching doctors for referral:", err);
                setAllDoctors(mockDoctors.map(d => ({ ...d, _id: d.id })));
            }
        };

        if (role) {
            fetchAvailableUsers();
            fetchDoctorsList();
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
                        const defaultPartner = data.conversations.find((c: any) => !c.isGreyedOut) || data.conversations[0];
                        if (defaultPartner && !defaultPartner.isGreyedOut) {
                            setActiveChatPartner(defaultPartner);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, [activeChatPartner, setActiveChatPartner]);

    // Filtered conversations based on search
    const filteredConversations = useMemo(() => {
        const validList = conversations.filter(c => c && typeof c === "object");
        if (!conversationSearch.trim()) return validList;
        const q = conversationSearch.toLowerCase();
        return validList.filter(c =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.specialty && c.specialty.toLowerCase().includes(q)) ||
            (c.city && c.city.toLowerCase().includes(q))
        );
    }, [conversations, conversationSearch]);

    // Fetch and poll messages with deduplication so we don't trigger unnecessary re-renders or scrolls
    useEffect(() => {
        if (!activeChatPartner) return;
        const partnerId = activeChatPartner._id || activeChatPartner.id;
        if (!partnerId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/messages?userId=${partnerId}`);
                const data = await res.json();
                if (data.messages && Array.isArray(data.messages)) {
                    setMessages((prev) => {
                        if (prev.length === data.messages.length) {
                            const lastPrev = prev[prev.length - 1];
                            const lastNew = data.messages[data.messages.length - 1];
                            if (lastPrev?._id === lastNew?._id && lastPrev?.time === lastNew?.time) {
                                return prev; // Exactly the same, keep existing array to prevent re-render
                            }
                        }
                        return data.messages;
                    });
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [activeChatPartner]);

    // Track scroll position in message list container
    const handleMessagesScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        isAtBottomRef.current = nearBottom;
    };

    // Auto scroll to bottom only on initial load or if user is already at the bottom
    useEffect(() => {
        if (isInitialLoadRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            isInitialLoadRef.current = false;
            return;
        }
        if (isAtBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Reset initial load and scroll-to-bottom flag when switching chats
    useEffect(() => {
        isInitialLoadRef.current = true;
        isAtBottomRef.current = true;
    }, [activeChatPartner?._id]);

    // Doctors filtered by @ query, excluding current user if doctor
    const filteredDoctorMentions = useMemo(() => {
        const query = doctorMentionQuery.trim().toLowerCase();
        return allDoctors.filter((doc) => {
            const docId = (doc._id || doc.id)?.toString();
            const myId = (currentUser?._id || currentUser?.id)?.toString();
            if (docId && myId && docId === myId) return false;
            if (!query) return true;
            return (
                doc.name?.toLowerCase().includes(query) ||
                doc.specialty?.toLowerCase().includes(query) ||
                doc.city?.toLowerCase().includes(query)
            );
        });
    }, [allDoctors, doctorMentionQuery, currentUser]);

    const handleInputChange = (val: string) => {
        setInput(val);

        if (role !== "doctor") return;

        // Check if there is an active '@' mention at the cursor position
        const cursor = textareaRef.current?.selectionStart ?? val.length;
        const textBeforeCursor = val.slice(0, cursor);
        const lastAt = textBeforeCursor.lastIndexOf("@");

        if (lastAt !== -1) {
            const charBeforeAt = lastAt > 0 ? textBeforeCursor[lastAt - 1] : " ";
            // Valid mention prefix: start of string or whitespace preceding @
            if (charBeforeAt === " " || charBeforeAt === "\n" || lastAt === 0) {
                const queryText = textBeforeCursor.slice(lastAt + 1);
                // Ensure there's no whitespace inside the mention query
                if (!/\s/.test(queryText)) {
                    setDoctorMentionQuery(queryText);
                    setShowDoctorMentionMenu(true);
                    setMentionSelectedIndex(0);
                    return;
                }
            }
        }
        setShowDoctorMentionMenu(false);
    };

    // Send Doctor Referral Card to active chat
    const sendDoctorReferral = async (doc: any) => {
        const partnerId = activeChatPartner?._id || activeChatPartner?.id;
        if (!partnerId) {
            alert("Please select a patient or contact from the conversations list to send the referral.");
            return;
        }

        const currentInput = input;
        const lastAt = currentInput.lastIndexOf("@");
        const userNote = lastAt !== -1 ? currentInput.slice(0, lastAt).trim() : currentInput.trim();
        const docDisplayName = doc.name?.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`;

        setShowDoctorMentionMenu(false);
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }

        const referralPayload = {
            doctorId: doc._id || doc.id,
            name: doc.name,
            specialty: doc.specialty || "Oncology Specialist",
            experience: doc.experience || "10+ years",
            city: doc.city || "Pan-India",
            rating: doc.rating || 4.9,
            email: doc.email || "",
            phone: doc.phone || "",
            available: doc.available !== false,
        };

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: partnerId,
                    message: userNote || `Recommended Specialist: ${docDisplayName} (${doc.specialty || "Oncology Specialist"})`,
                    type: "doctor_referral",
                    referredDoctor: referralPayload,
                }),
            });
            const data = await res.json();
            if (res.ok && data.message) {
                setMessages((prev) => [...prev, data.message]);
                isAtBottomRef.current = true;
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
            } else {
                console.error("Failed to send referral:", data);
                setInput(currentInput);
                alert("Failed to send doctor referral: " + (data.error || "Server error"));
            }
        } catch (error) {
            console.error("Error sending doctor referral:", error);
            setInput(currentInput);
            alert("Error sending referral. Please try again.");
        }
    };

    // When doctor selects a specialist from @ list
    const handleSelectReferredDoctor = (doc: any) => {
        sendDoctorReferral(doc);
    };

    // Check if the current chat partner is a patient
    const isPartnerPatient = Boolean(
        activeChatPartner && (activeChatPartner.role === "patient" || (!activeChatPartner.specialty && activeChatPartner.role !== "doctor"))
    );

    // Check if the active partner is already assigned to the logged-in doctor
    const isPartnerAssignedToMe = useMemo(() => {
        if (!activeChatPartner || !currentUser) return false;
        const assignedDocId = activeChatPartner.assignedDoctor?._id || activeChatPartner.assignedDoctor;
        const myId = currentUser.id || currentUser._id;
        return Boolean(assignedDocId && myId && String(assignedDocId) === String(myId));
    }, [activeChatPartner, currentUser]);

    // Doctor self-assigning this patient
    const handleAssignPatientToMe = async () => {
        if (!activeChatPartner || isAssigningPatient) return;
        setIsAssigningPatient(true);
        try {
            const partnerId = activeChatPartner._id || activeChatPartner.id;
            const res = await fetch("/api/patient/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: partnerId }),
            });
            const data = await res.json();
            if (data.success) {
                setToastMessage(`Patient ${activeChatPartner.name} assigned to your care!`);
                setShowAssignConfirmModal(false);
                setShowEllipsisMenu(false);

                // Update activeChatPartner in local state
                const updatedDocInfo = {
                    _id: currentUser?.id || currentUser?._id,
                    name: currentUser?.name,
                    specialty: currentUser?.specialty,
                };
                setActiveChatPartner((prev: any) => ({
                    ...prev,
                    assignedDoctor: updatedDocInfo,
                }));

                // Update in conversations list
                setConversations((prev) =>
                    prev.map((c) =>
                        (c._id === partnerId || c.id === partnerId)
                            ? { ...c, assignedDoctor: updatedDocInfo }
                            : c
                    )
                );

                // If a system confirmation message was created, append to chat
                if (data.systemMessage) {
                    setMessages((prev) => [...prev, data.systemMessage]);
                    isAtBottomRef.current = true;
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                }
            } else {
                alert(data.error || "Failed to assign patient.");
            }
        } catch (err) {
            console.error("Error assigning patient:", err);
            alert("Failed to assign patient. Please try again.");
        } finally {
            setIsAssigningPatient(false);
        }
    };

    const send = async () => {
        if (!input.trim() || !activeChatPartner) return;
        const partnerId = activeChatPartner._id || activeChatPartner.id;
        if (!partnerId) return;

        const msgText = input;
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }
        setShowDoctorMentionMenu(false);

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: partnerId,
                    message: msgText,
                    type: "text",
                }),
            });
            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [...prev, data.message]);
                // When user actively sends a message, immediately scroll to bottom
                isAtBottomRef.current = true;
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
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

                const partnerId = activeChatPartner._id || activeChatPartner.id;
                const msgRes = await fetch("/api/chat/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        receiverId: partnerId,
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
                    isAtBottomRef.current = true;
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
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

    const triggerDownload = (fileUrl: string, fileName?: string, objectKey?: string) => {
        if (!fileUrl && !objectKey) return;
        const cleanName = fileName || "attachment";
        const downloadEndpoint = `/api/chat/download?filename=${encodeURIComponent(cleanName)}${fileUrl ? `&url=${encodeURIComponent(fileUrl)}` : ""}${objectKey ? `&key=${encodeURIComponent(objectKey)}` : ""}`;

        const a = document.createElement("a");
        a.href = downloadEndpoint;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes || bytes <= 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const openMediaViewer = (media: ActiveMediaItem) => {
        setActiveMedia(media);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
    };

    const closeMediaViewer = () => {
        setActiveMedia(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
    };

    // Close attachment menu and ellipsis menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
                setShowAttachmentMenu(false);
            }
            if (ellipsisMenuRef.current && !ellipsisMenuRef.current.contains(e.target as Node)) {
                setShowEllipsisMenu(false);
            }
        };
        if (showAttachmentMenu || showEllipsisMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAttachmentMenu, showEllipsisMenu]);

    // Handle Escape key to close modal or menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (activeMedia) {
                    closeMediaViewer();
                } else if (showAssignConfirmModal) {
                    setShowAssignConfirmModal(false);
                } else if (showEllipsisMenu) {
                    setShowEllipsisMenu(false);
                } else if (showMobileUserDetails) {
                    setShowMobileUserDetails(false);
                } else if (showMobileConversations) {
                    setShowMobileConversations(false);
                } else if (showAttachmentMenu) {
                    setShowAttachmentMenu(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeMedia, showAssignConfirmModal, showEllipsisMenu, showMobileUserDetails, showMobileConversations, showAttachmentMenu]);

    return (
        <div className="h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] bg-slate-50 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Desktop Sidebar — Conversations */}
            <div className="hidden lg:flex lg:w-72 bg-white border-r border-slate-100 flex-col shrink-0 h-full">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center relative">
                    <h2 className="font-bold text-slate-800 text-sm">Conversations</h2>
                    <button onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
                        className="text-xs bg-teal-600 text-white px-2.5 py-1.5 rounded-xl hover:bg-teal-700 transition-all font-semibold flex items-center gap-1 cursor-pointer">
                        + New Chat
                    </button>
                    {showNewChatDropdown && (
                        <div className="absolute right-4 top-full mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-card p-2 z-50 max-h-60 overflow-y-auto">
                            <div className="text-xs font-semibold text-slate-400 p-1 border-b border-slate-50 mb-1">
                                {role === "patient" ? "Choose a Doctor" : "Choose a Patient"}
                            </div>
                            {availableUsers.map((u) => {
                                const isGreyed = Boolean(u.isGreyedOut);
                                return (
                                    <button
                                        key={u._id}
                                        disabled={isGreyed}
                                        onClick={() => {
                                            if (isGreyed) return;
                                            setActiveChatPartner(u);
                                            setShowNewChatDropdown(false);
                                            if (!conversations.some(c => c._id === u._id)) {
                                                setConversations(prev => [u, ...prev]);
                                            }
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium truncate block ${
                                            isGreyed
                                                ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 select-none"
                                                : "hover:bg-teal-50 text-slate-700 cursor-pointer"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{u.name} {u.specialty ? `(${u.specialty})` : ""}</span>
                                            {isGreyed && (
                                                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold uppercase">
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                            {availableUsers.length === 0 && (
                                <div className="text-slate-400 text-xs p-2 text-center">No registered contacts.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Search Bar in Desktop Sidebar */}
                <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={conversationSearch}
                            onChange={(e) => setConversationSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((c) => {
                        const isGreyed = Boolean(c.isGreyedOut);
                        const active = activeChatPartner?._id === c._id && !isGreyed;
                        const initials = getInitials(c?.name);
                        return (
                            <div
                                key={c._id || c.id}
                                onClick={() => {
                                    if (isGreyed) {
                                        setToastMessage("Hospital Staff Panel is under development. Please chat directly with Dr. Amit Gupta.");
                                        setTimeout(() => setToastMessage(null), 4000);
                                        return;
                                    }
                                    setActiveChatPartner(c);
                                }}
                                className={`p-4 flex items-start gap-3 transition-colors ${
                                    isGreyed
                                        ? "opacity-60 cursor-not-allowed bg-slate-50/70 border-b border-dashed border-slate-200 select-none hover:bg-slate-50"
                                        : active
                                            ? "bg-teal-50 border-l-3 border-l-teal-600 cursor-pointer"
                                            : "cursor-pointer border-b border-slate-50 hover:bg-teal-50"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs ${
                                    isGreyed ? "bg-slate-400" : "bg-teal-600"
                                }`}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-800 truncate">{c?.name || "User"}</span>
                                        {isGreyed && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wider shrink-0">
                                                Unavailable
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-xs font-medium truncate ${isGreyed ? "text-slate-500" : "text-teal-600"}`}>
                                        {isGreyed ? "Admin Staff Desk" : (c?.position || c?.specialty || (c?.role === "patient" ? "Patient" : "Support Team"))}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {isGreyed ? "Staff Panel Coming Soon" : (c?.department || c?.city || "Online")}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredConversations.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-xs mt-8">
                            {conversationSearch ? "No matching contacts found." : "No active chats found."}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative">
                {/* Chat Header — ALWAYS PRESENT & STICKY */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-3 sm:px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Mobile Conversations Button — Opens Chat Switcher Panel */}
                        <button
                            type="button"
                            onClick={() => setShowMobileConversations(true)}
                            className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            title="Open conversations list"
                        >
                            <Menu size={19} className="text-teal-600" />
                            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Chats</span>
                            {conversations.length > 0 && (
                                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                    {conversations.length}
                                </span>
                            )}
                        </button>

                        {activeChatPartner ? (
                            <div
                                onClick={() => setShowMobileUserDetails(true)}
                                className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group"
                                title="Click to view contact profile details"
                            >
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs group-hover:ring-2 group-hover:ring-teal-400 transition-all">
                                        {getInitials(activeChatPartner?.name)}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-slate-800 text-sm sm:text-base truncate group-hover:text-teal-700 transition-colors">
                                            {activeChatPartner?.name || "Contact"}
                                        </span>
                                        <Info size={13} className="text-slate-400 group-hover:text-teal-600 shrink-0 xl:hidden" />
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-emerald-600 font-medium truncate flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                                        <span className="truncate">Online — {activeChatPartner.specialty || (activeChatPartner.role === "patient" ? "Patient" : "Support Team")}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-800 text-sm">Clinical Care Chat</div>
                                    <div className="text-[11px] text-slate-400">Select a conversation to start chatting</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {activeChatPartner ? (
                            <>
                                {/* Push notification status / quick-optin */}
                                {!isSubscribed ? (
                                    <button
                                        onClick={subscribeToPush}
                                        title="Click to receive instant push alerts when you receive messages"
                                        className="hidden md:flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                                    >
                                        <Bell size={13} className="text-amber-600" />
                                        <span className="hidden lg:inline">Alerts</span>
                                    </button>
                                ) : (
                                    <span
                                        title="Push notifications active on this device"
                                        className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold"
                                    >
                                        <Bell size={12} className="text-emerald-600" />
                                        <span className="hidden lg:inline">Active</span>
                                    </span>
                                )}

                                {role === "doctor" && (
                                    <button onClick={() => setShowSlots(!showSlots)} className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-teal-700 bg-teal-50 border border-teal-200 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-teal-100 transition-colors font-medium cursor-pointer">
                                        <Calendar size={14} className="text-teal-600 shrink-0" />
                                        <span className="hidden sm:inline">Book Visit</span>
                                    </button>
                                )}

                                {/* Mobile User Details Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMobileUserDetails(true)}
                                    className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer xl:hidden"
                                    title="View Contact Details"
                                >
                                    <Info size={17} />
                                </button>

                                {/* Ellipsis Menu for Doctor Chat Options */}
                                {role === "doctor" && isPartnerPatient && (
                                    <div className="relative" ref={ellipsisMenuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowEllipsisMenu(!showEllipsisMenu)}
                                            className="p-1.5 sm:p-2 text-slate-500 hover:text-teal-700 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer border border-slate-200 hover:border-teal-200"
                                            title="Chat options"
                                        >
                                            <MoreVertical size={17} />
                                        </button>

                                        {showEllipsisMenu && (
                                            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-fadeIn">
                                                <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    Care Options
                                                </div>
                                                {isPartnerAssignedToMe ? (
                                                    <div className="px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 font-medium">
                                                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                                        <span>Assigned to your care</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowEllipsisMenu(false);
                                                            setShowAssignConfirmModal(true);
                                                        }}
                                                        className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                                                    >
                                                        <UserPlus size={16} className="text-teal-600 shrink-0" />
                                                        <span>Assign this patient to me</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setShowNewChatDropdown(true)}
                                className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-xl hover:bg-teal-700 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                + New Chat
                            </button>
                        )}
                    </div>
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
                                            Book an appointment with {activeChatPartner?.name || "the doctor"}
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
                                                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${isBooked
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

                {!activeChatPartner ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-xs">
                            <Users size={30} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">Select a Conversation</h3>
                        <p className="text-xs text-slate-500 max-w-xs mb-5">
                            Connect directly with your oncologists and care team. Choose an ongoing chat or start a new consultation.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowMobileConversations(true)}
                            className="lg:hidden bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
                        >
                            <Menu size={16} /> Open Conversations
                        </button>
                    </div>
                ) : (
                    /* Messages */
                    <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender === currentUser?._id || msg.sender?.toString() === currentUser?._id;
                            const isVideo = msg.type === "video" || ["MP4", "WEBM", "MOV", "M4V"].includes(msg.fileType?.toUpperCase());
                            const isImage = msg.type === "image" || ["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG"].includes(msg.fileType?.toUpperCase());
                            const isDocument = msg.type === "document" || (!isImage && !isVideo && Boolean(msg.fileName || msg.fileUrl));

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
                                                    {getInitials(activeChatPartner?.name)}
                                                </div>
                                            )}
                                            <div className={`max-w-xs sm:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                                {!isMe && <span className="text-xs text-slate-400 ml-1">{activeChatPartner?.name || "User"}</span>}

                                                {/* Image Message */}
                                                {isImage && msg.fileUrl ? (
                                                    <div
                                                        onClick={() => openMediaViewer({
                                                            type: "image",
                                                            url: msg.fileUrl,
                                                            fileName: msg.fileName || "Image",
                                                            objectKey: msg.objectKey,
                                                            fileSize: msg.fileSize,
                                                        })}
                                                        className={`group relative cursor-pointer overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md ${isMe ? "rounded-2xl rounded-br-none bg-teal-600 p-1" : "rounded-2xl rounded-bl-none bg-white p-1"
                                                            } max-w-[240px] sm:max-w-[300px]`}
                                                        title="Click to view and zoom image"
                                                    >
                                                        <div className="relative overflow-hidden rounded-xl bg-slate-900">
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt={msg.fileName || "Chat Image"}
                                                                className="w-full h-auto max-h-[240px] object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow">
                                                                    <Maximize2 size={13} /> View & Zoom
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : isVideo && msg.fileUrl ? (
                                                    /* Video Message */
                                                    <div className={`relative group max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black p-1 ${isMe ? "rounded-br-none" : "rounded-bl-none"
                                                        }`}>
                                                        <video
                                                            controls
                                                            playsInline
                                                            preload="metadata"
                                                            src={msg.fileUrl}
                                                            className="w-full max-h-[220px] rounded-xl object-contain bg-black"
                                                        >
                                                            Your browser does not support HTML5 video.
                                                        </video>
                                                        <button
                                                            type="button"
                                                            onClick={() => openMediaViewer({
                                                                type: "video",
                                                                url: msg.fileUrl,
                                                                fileName: msg.fileName || "Video",
                                                                objectKey: msg.objectKey,
                                                                fileSize: msg.fileSize,
                                                            })}
                                                            className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow cursor-pointer"
                                                            title="Open in media viewer"
                                                        >
                                                            <Maximize2 size={13} />
                                                        </button>
                                                    </div>
                                                ) : isDocument ? (
                                                    /* Document Message */
                                                    <div
                                                        onClick={() => triggerDownload(msg.fileUrl, msg.fileName, msg.objectKey)}
                                                        className={`p-3 rounded-2xl text-sm leading-relaxed transition-all cursor-pointer hover:shadow-md active:scale-[0.99] ${isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                                                            }`}
                                                        title={`Click to download ${msg.fileName || "document"}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? "bg-white/20 text-white" : "bg-teal-100 text-teal-600"
                                                                }`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-1">
                                                                <div className="font-semibold text-sm truncate max-w-[170px] sm:max-w-[200px]">
                                                                    {msg.fileName || "Document"}
                                                                </div>
                                                                <div className={`text-xs mt-0.5 flex items-center gap-1.5 ${isMe ? "text-white/80" : "text-teal-600 font-medium"
                                                                    }`}>
                                                                    <span>{msg.fileType ? msg.fileType.toUpperCase() : "FILE"}</span>
                                                                    {msg.fileSize && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>{formatFileSize(msg.fileSize)}</span>
                                                                        </>
                                                                    )}
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-0.5 font-semibold hover:underline">
                                                                        <Download size={11} /> Download
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (msg.type === "doctor_referral" && msg.referredDoctor?.name) ? (
                                                    <div className="flex flex-col gap-2">
                                                        {msg.message && !msg.message.startsWith("Recommended Specialist:") && (
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-white border border-slate-100 rounded-bl-none shadow-sm text-slate-800"}`}>

                                                                {msg.message}
                                                            </div>
                                                        )}
                                                        {/* Doctor Referral Contact Card (WhatsApp Contact Card Style) */}
                                                        <div className="w-[280px] sm:w-[320px] bg-white rounded-2xl border border-teal-100 shadow-md overflow-hidden text-slate-800">
                                                            {/* Contact Card Header */}
                                                            <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-3.5 text-white flex items-center gap-3">
                                                                <div className="relative shrink-0">
                                                                    <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-base shadow-sm">
                                                                        {getInitials(msg.referredDoctor?.name, "DR")}
                                                                    </div>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[10px] font-bold tracking-wider uppercase bg-teal-600/80 text-teal-100 px-2 py-0.5 rounded-full">
                                                                            Referred Specialist
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm sm:text-base text-white truncate mt-0.5">
                                                                        {msg.referredDoctor?.name?.startsWith("Dr.") ? msg.referredDoctor.name : `Dr. ${msg.referredDoctor?.name}`}
                                                                    </h4>
                                                                    <p className="text-xs text-teal-100 truncate">
                                                                        {msg.referredDoctor?.specialty || "Oncology Specialist"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Contact Details Body */}
                                                            {msg.referredDoctor?.experience && (
                                                                <div className="p-3 bg-teal-50/40 space-y-1.5 text-xs">
                                                                    <div className="flex items-center justify-between text-slate-600">
                                                                        <span className="text-slate-400">Experience</span>
                                                                        <span className="font-medium text-slate-700">{msg.referredDoctor.experience} years</span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Side-by-Side Action Buttons (View Profile & Chat) */}
                                                            <div className="grid grid-cols-2 border-t border-teal-100 divide-x divide-teal-100 bg-white">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingDoctorProfile(msg.referredDoctor)}
                                                                    className="py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                                                                >
                                                                    <User size={14} className="text-teal-600" />
                                                                    <span>View Profile</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const docObj = {
                                                                            _id: msg.referredDoctor?.doctorId || msg.referredDoctor?._id,
                                                                            name: msg.referredDoctor?.name,
                                                                            specialty: msg.referredDoctor?.specialty,
                                                                            role: "doctor",
                                                                            email: msg.referredDoctor?.email,
                                                                            phone: msg.referredDoctor?.phone,
                                                                            experience: msg.referredDoctor?.experience,
                                                                            city: msg.referredDoctor?.city,
                                                                            available: msg.referredDoctor?.available,
                                                                        };
                                                                        setActiveChatPartner(docObj);
                                                                        if (!conversations.some(c => c._id === docObj._id)) {
                                                                            setConversations(prev => [docObj, ...prev]);
                                                                        }
                                                                    }}
                                                                    className="py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                                >
                                                                    <MessageCircle size={14} className="text-emerald-600" />
                                                                    <span>Chat</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Standard Text Message */
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-white border border-slate-100 rounded-bl-none shadow-sm text-slate-800"
                                                        }`}>
                                                        {msg.message}
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
                )}

                {/* Input */}
                {activeChatPartner && (
                    <div className="bg-white border-t border-slate-100 px-4 py-3">
                        {uploading && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 animate-pulse">
                                <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-medium">Uploading attachment...</span>
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

                            {/* Single Clip Button with Attachment Popup Menu */}
                            <div className="relative shrink-0 flex items-center" ref={attachmentMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowAttachmentMenu(prev => !prev)}
                                    disabled={uploading}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${showAttachmentMenu
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    title="Send attachment (Image, Video, Document)"
                                >
                                    <Paperclip size={18} className="shrink-0" />
                                </button>

                                {/* Popup Menu */}
                                {showAttachmentMenu && (
                                    <div className="absolute bottom-full left-0 mb-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 animate-fadeIn">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2.5 py-1 mb-1">
                                            Send Attachment
                                        </div>

                                        {/* Photo / Image */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAttachmentMenu(false);
                                                imageInputRef.current?.click();
                                            }}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-teal-50 text-slate-700 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                                <ImageIcon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-slate-800">Photo / Image</div>
                                                <div className="text-[10px] text-slate-400 truncate">JPG, PNG, WEBP, GIF</div>
                                            </div>
                                        </button>

                                        {/* Video */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAttachmentMenu(false);
                                                videoInputRef.current?.click();
                                            }}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-purple-50 text-slate-700 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                                <Film size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-slate-800">Video</div>
                                                <div className="text-[10px] text-slate-400 truncate">MP4, WEBM, MOV</div>
                                            </div>
                                        </button>

                                        {/* Document */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAttachmentMenu(false);
                                                fileInputRef.current?.click();
                                            }}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-indigo-50 text-slate-700 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-slate-800">Document</div>
                                                <div className="text-[10px] text-slate-400 truncate">PDF, DOC, TXT, RTF</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Doctor Referral @ Mention Suggestions Popup */}
                            <div className="relative flex-1">
                                {role === "doctor" && showDoctorMentionMenu && (
                                    <div className="absolute bottom-full left-0 right-0 mb-3 bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden z-50 animate-fadeIn max-h-72 flex flex-col">
                                        <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-3.5 py-2.5 text-white flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                <AtSign size={14} className="text-teal-300" />
                                                <span>Refer A Specialist Doctor</span>
                                            </div>
                                            <span className="text-[10px] text-teal-200">
                                                {filteredDoctorMentions.length} available
                                            </span>
                                        </div>

                                        <div
                                            className="p-1.5 overflow-y-auto max-h-60 space-y-1"
                                            onMouseDown={e => e.preventDefault()}
                                        >
                                            {filteredDoctorMentions.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-slate-400">
                                                    No doctors found matching "{doctorMentionQuery}"
                                                </div>
                                            ) : (
                                                filteredDoctorMentions.map((doc, idx) => {
                                                    const isSelected = idx === mentionSelectedIndex;
                                                    const initials = getInitials(doc?.name, "DR");

                                                    return (
                                                        <button
                                                            key={doc._id || doc.id || idx}
                                                            type="button"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSelectReferredDoctor(doc);
                                                            }}
                                                            className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer ${isSelected
                                                                ? "bg-teal-50 border border-teal-200"
                                                                : "hover:bg-slate-50 border border-transparent"
                                                                }`}
                                                        >
                                                            <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                                                {initials}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-bold text-slate-800 truncate">
                                                                        {doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}
                                                                    </div>
                                                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                        Available
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-teal-700 font-medium truncate">
                                                                    {doc.specialty || "Oncology Specialist"}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 truncate">
                                                                    {doc.city || "Pan-India"} {doc.experience ? `• ${doc.experience}` : ""}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div
                                            className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between"
                                            onMouseDown={e => e.preventDefault()}
                                        >
                                            <span>Press ↑ ↓ to navigate, Enter to select</span>
                                            <button
                                                type="button"
                                                onMouseDown={e => {
                                                    e.preventDefault();
                                                    setShowDoctorMentionMenu(false);
                                                }}
                                                onClick={() => setShowDoctorMentionMenu(false)}
                                                className="text-slate-500 hover:text-slate-800 cursor-pointer"
                                            >
                                                Esc to cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={input}
                                    onChange={e => {
                                        handleInputChange(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                                    }}
                                    onKeyDown={e => {
                                        if (showDoctorMentionMenu && filteredDoctorMentions.length > 0) {
                                            if (e.key === "ArrowDown") {
                                                e.preventDefault();
                                                setMentionSelectedIndex(prev => (prev + 1) % filteredDoctorMentions.length);
                                                return;
                                            }
                                            if (e.key === "ArrowUp") {
                                                e.preventDefault();
                                                setMentionSelectedIndex(prev => (prev - 1 + filteredDoctorMentions.length) % filteredDoctorMentions.length);
                                                return;
                                            }
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const selectedDoc = filteredDoctorMentions[mentionSelectedIndex];
                                                if (selectedDoc) {
                                                    handleSelectReferredDoctor(selectedDoc);
                                                }
                                                return;
                                            }
                                            if (e.key === "Escape") {
                                                e.preventDefault();
                                                setShowDoctorMentionMenu(false);
                                                return;
                                            }
                                        }

                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            send();
                                        }
                                    }}
                                    placeholder={
                                        activeChatPartner?.isGreyedOut
                                            ? "Staff messaging is disabled. Please chat with Dr. Amit Gupta."
                                            : uploading
                                                ? "Uploading file..."
                                                : role === "doctor"
                                                    ? "Type a message or '@' to refer a doctor..."
                                                    : "Type a message to Dr. Amit Gupta..."
                                    }
                                    disabled={uploading || Boolean(activeChatPartner?.isGreyedOut)}
                                    style={{ height: "40px" }}
                                    className="block w-full min-h-[40px] max-h-32 border border-slate-200 rounded-xl px-4 py-2.5 text-sm leading-5 resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 bg-slate-50/40 focus:bg-white transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={send}
                                disabled={uploading || !input.trim() || Boolean(activeChatPartner?.isGreyedOut)}
                                className="w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95"
                                title="Send message"
                            >
                                <Send size={17} className="shrink-0 -translate-x-px" />
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

            {/* Mobile Slide-Over Drawer — Conversations Switcher */}
            {showMobileConversations && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
                        onClick={() => setShowMobileConversations(false)}
                    />
                    {/* Drawer */}
                    <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-slideInLeft">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 text-base">Conversations</h2>
                                <p className="text-[11px] text-slate-400">Select a chat or start a new one</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
                                    className="text-xs bg-teal-600 text-white px-2.5 py-1.5 rounded-xl hover:bg-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    + New
                                </button>
                                <button
                                    onClick={() => setShowMobileConversations(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* New Chat Dropdown (in mobile drawer) */}
                        {showNewChatDropdown && (
                            <div className="p-3 bg-teal-50/60 border-b border-teal-100 max-h-56 overflow-y-auto">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2">
                                    {role === "patient" ? "Choose an Oncologist" : "Choose a Patient"}
                                </div>
                                <div className="space-y-1">
                                    {availableUsers.map((u) => {
                                        const isGreyed = Boolean(u.isGreyedOut);
                                        return (
                                            <button
                                                key={u._id}
                                                disabled={isGreyed}
                                                onClick={() => {
                                                    if (isGreyed) return;
                                                    setActiveChatPartner(u);
                                                    setShowNewChatDropdown(false);
                                                    setShowMobileConversations(false);
                                                    if (!conversations.some(c => c._id === u._id)) {
                                                        setConversations(prev => [u, ...prev]);
                                                    }
                                                }}
                                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold truncate block border transition-all ${
                                                    isGreyed
                                                        ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200 select-none"
                                                        : "bg-white hover:bg-teal-100 text-slate-800 border-teal-100/60 shadow-xs cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{u.name}</span>
                                                    {isGreyed && (
                                                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold uppercase">
                                                            Soon
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-[10px] font-normal ${isGreyed ? "text-slate-400" : "text-teal-600"}`}>
                                                    {isGreyed ? "Staff Panel Coming Soon" : (u.specialty || (u.role === "patient" ? "Patient" : "Support"))}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {availableUsers.length === 0 && (
                                        <div className="text-slate-400 text-xs p-2 text-center">No registered contacts.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Filter Search */}
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={conversationSearch}
                                    onChange={(e) => setConversationSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-medium"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.map((c) => {
                                const isGreyed = Boolean(c.isGreyedOut);
                                const active = activeChatPartner?._id === c._id && !isGreyed;
                                const initials = getInitials(c?.name);
                                return (
                                    <div
                                        key={c._id || c.id}
                                        onClick={() => {
                                            if (isGreyed) {
                                                setToastMessage("Hospital Staff Panel is under development. Please chat directly with Dr. Amit Gupta.");
                                                setTimeout(() => setToastMessage(null), 4000);
                                                return;
                                            }
                                            setActiveChatPartner(c);
                                            setShowMobileConversations(false);
                                        }}
                                        className={`p-3.5 flex items-start gap-3 border-b transition-colors ${
                                            isGreyed
                                                ? "opacity-60 cursor-not-allowed bg-slate-50/70 border-dashed border-slate-200 select-none hover:bg-slate-50"
                                                : active
                                                    ? "bg-teal-50 border-l-3 border-l-teal-600 cursor-pointer"
                                                    : "cursor-pointer border-slate-50 hover:bg-teal-50/60"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs ${
                                            isGreyed ? "bg-slate-400" : "bg-teal-600"
                                        }`}>
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-800 truncate">{c?.name || "User"}</span>
                                                {isGreyed && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wider shrink-0">
                                                        Unavailable
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`text-xs font-medium truncate ${isGreyed ? "text-slate-500" : "text-teal-600"}`}>
                                                {isGreyed ? "Admin Staff Desk" : (c?.position || c?.specialty || (c?.role === "patient" ? "Patient" : "Support Team"))}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {isGreyed ? "Staff Panel Coming Soon" : (c?.department || c?.city || "Online")}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredConversations.length === 0 && (
                                <div className="p-6 text-center text-slate-400 text-xs">
                                    {conversationSearch ? "No matching contacts found." : "No active chats found."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Slide-Over Drawer — User Details */}
            {showMobileUserDetails && activeChatPartner && (
                <div className="fixed inset-0 z-50 xl:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
                        onClick={() => setShowMobileUserDetails(false)}
                    />
                    {/* Drawer */}
                    <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-slideInRight overflow-y-auto">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {role === "doctor" ? "Patient Profile" : "Doctor Profile"}
                            </h3>
                            <button
                                onClick={() => setShowMobileUserDetails(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Profile Header Card */}
                        <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 bg-gradient-to-b from-teal-50/50 to-white">
                            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md mb-3">
                                {getInitials(activeChatPartner?.name)}
                            </div>
                            <h4 className="font-bold text-slate-800 text-base">{activeChatPartner?.name || "Contact"}</h4>
                            <div className="text-xs text-teal-600 font-semibold mt-0.5">
                                {activeChatPartner.specialty || (activeChatPartner.role === "patient" ? "Oncology Patient" : "Medical Staff")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span>{activeChatPartner.available ? "Online Now" : "Active in Care"}</span>
                            </div>
                        </div>

                        {/* Profile Information List */}
                        <div className="p-4 space-y-3.5 text-sm flex-1">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">Email Address</span>
                                <span className="font-medium text-slate-700 break-all">{activeChatPartner.email || "Not Provided"}</span>
                            </div>

                            {activeChatPartner.phone && (
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-medium">Phone</span>
                                    <span className="font-medium text-slate-700">{activeChatPartner.phone}</span>
                                </div>
                            )}

                            {role === "doctor" ? (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">City / Location</span>
                                        <span className="font-medium text-slate-700">{activeChatPartner.city || "Not Provided"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">Date of Birth</span>
                                        <span className="font-medium text-slate-700">{activeChatPartner.dob || "Not Provided"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">Preferred Language</span>
                                        <span className="font-medium text-slate-700">{activeChatPartner.preferredLanguage || "English"}</span>
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <span className="text-xs text-slate-400 font-medium mb-1">Clinical Diagnosis / History</span>
                                        <div className="text-xs bg-teal-50 border border-teal-100 p-3 rounded-xl text-teal-900 leading-relaxed font-medium">
                                            {activeChatPartner.healthHistory || activeChatPartner.primaryConcern || "No medical history recorded."}
                                        </div>
                                    </div>

                                    {/* Quick CTA to book consultation */}
                                    <div className="pt-2">
                                        <button
                                            onClick={() => {
                                                setShowMobileUserDetails(false);
                                                setShowSlots(true);
                                            }}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                                        >
                                            <Calendar size={15} /> Schedule Consultation Visit
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">Specialty</span>
                                        <span className="font-medium text-teal-700">{activeChatPartner.specialty || "Medical Oncology"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">Clinical Experience</span>
                                        <span className="font-medium text-slate-700">{activeChatPartner.experience || "10+ years"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium">Availability</span>
                                        <span className="font-medium text-emerald-600">{activeChatPartner.available ? "Yes (Accepting Consultations)" : "Offline"}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Built-in Media Viewer Modal (Images & Videos) */}
            {activeMedia && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fadeIn select-none"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeMediaViewer();
                        }
                    }}
                >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/50 border-b border-white/10 text-white z-20 shrink-0">
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-400 shrink-0">
                                {activeMedia.type === "image" ? <ImageIcon size={18} /> : <Film size={18} />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold truncate text-white max-w-[180px] sm:max-w-md">
                                    {activeMedia.fileName || (activeMedia.type === "image" ? "Photo Preview" : "Video Preview")}
                                </h3>
                                <div className="text-[11px] text-white/60 flex items-center gap-2">
                                    <span>{activeMedia.type === "image" ? "Image Viewer" : "Video Player"}</span>
                                    {activeMedia.fileSize ? (
                                        <>
                                            <span>•</span>
                                            <span>{formatFileSize(activeMedia.fileSize)}</span>
                                        </>
                                    ) : null}
                                    <span>•</span>
                                    <span className="text-teal-400 font-mono font-medium">{Math.round(zoom * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            {/* Zoom Out */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoom(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
                                }}
                                disabled={zoom <= 0.5}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut size={16} />
                            </button>

                            {/* Reset Zoom */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoom(1);
                                    setPan({ x: 0, y: 0 });
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-white transition-colors cursor-pointer"
                                title="Reset Zoom (100%)"
                            >
                                {Math.round(zoom * 100)}%
                            </button>

                            {/* Zoom In */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoom(prev => Math.min(4, Number((prev + 0.25).toFixed(2))));
                                }}
                                disabled={zoom >= 4}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
                                title="Zoom In (+)"
                            >
                                <ZoomIn size={16} />
                            </button>

                            <div className="w-px h-6 bg-white/20 mx-1 hidden sm:block"></div>

                            {/* Download Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerDownload(activeMedia.url, activeMedia.fileName, activeMedia.objectKey);
                                }}
                                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                                title="Download media"
                            >
                                <Download size={14} />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            {/* Close Cross Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeMediaViewer();
                                }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors ml-1 cursor-pointer"
                                title="Close (Esc)"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Media Display Area (Clicking outside photo/video triggers close) */}
                    <div
                        className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                closeMediaViewer();
                            }
                        }}
                        onWheel={(e) => {
                            e.preventDefault();
                            if (e.deltaY < 0) {
                                setZoom(prev => Math.min(4, Number((prev + 0.15).toFixed(2))));
                            } else {
                                setZoom(prev => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
                            }
                        }}
                    >
                        {activeMedia.type === "image" ? (
                            <div
                                className={`relative max-w-full max-h-full transition-transform ${isDragging ? "cursor-grabbing duration-0" : zoom > 1 ? "cursor-grab duration-150" : "cursor-default duration-150"
                                    }`}
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transformOrigin: "center center",
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => {
                                    if (zoom <= 1) return;
                                    setIsDragging(true);
                                    dragStartRef.current = {
                                        x: e.clientX,
                                        y: e.clientY,
                                        panX: pan.x,
                                        panY: pan.y,
                                    };
                                }}
                                onMouseMove={(e) => {
                                    if (!isDragging) return;
                                    const dx = e.clientX - dragStartRef.current.x;
                                    const dy = e.clientY - dragStartRef.current.y;
                                    setPan({
                                        x: dragStartRef.current.panX + dx,
                                        y: dragStartRef.current.panY + dy,
                                    });
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                                onDoubleClick={() => {
                                    if (zoom > 1) {
                                        setZoom(1);
                                        setPan({ x: 0, y: 0 });
                                    } else {
                                        setZoom(2);
                                    }
                                }}
                            >
                                <img
                                    src={activeMedia.url}
                                    alt={activeMedia.fileName}
                                    className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-auto"
                                    draggable={false}
                                />
                            </div>
                        ) : (
                            <div
                                className="relative max-w-full max-h-full transition-transform duration-150"
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: "center center",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <video
                                    controls
                                    autoPlay
                                    playsInline
                                    src={activeMedia.url}
                                    className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl bg-black"
                                >
                                    Your browser does not support HTML5 video playback.
                                </video>
                            </div>
                        )}
                    </div>

                    {/* Bottom Hint Footer */}
                    <div className="py-2 text-center text-[11px] text-white/50 bg-black/50 border-t border-white/10 shrink-0">
                        Click outside photo/video or press Esc to close • Scroll or buttons to zoom
                    </div>
                </div>
            )}

            {/* Confirmation Modal: Assign This Patient to Me */}
            {showAssignConfirmModal && activeChatPartner && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isAssigningPatient) {
                            setShowAssignConfirmModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-slideIn">
                        <div className="p-6 border-b border-slate-100 relative bg-gradient-to-br from-teal-50/70 via-white to-teal-50/30">
                            <button
                                type="button"
                                disabled={isAssigningPatient}
                                onClick={() => setShowAssignConfirmModal(false)}
                                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
                                    <UserPlus size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-800">
                                        Assign this patient to me
                                    </h3>
                                    <p className="text-xs text-teal-600 font-medium">
                                        Primary Oncology Care Allotment
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                    {getInitials(activeChatPartner?.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-800 text-sm truncate">
                                        {activeChatPartner.name}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate">
                                        {activeChatPartner.email || "No email"} · {activeChatPartner.city || "Pan-India"}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Are you sure you want to assign <strong>{activeChatPartner.name}</strong> to yourself?
                                You will be established as their primary oncologist, and the patient will appear in your clinical dashboard.
                            </p>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isAssigningPatient}
                                    onClick={() => setShowAssignConfirmModal(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isAssigningPatient}
                                    onClick={handleAssignPatientToMe}
                                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isAssigningPatient ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Assigning...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={15} />
                                            <span>Confirm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Doctor Profile Modal for "View Profile" */}
            {viewingDoctorProfile && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setViewingDoctorProfile(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-teal-100 animate-slideIn">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 p-6 text-white relative">
                            <button
                                type="button"
                                onClick={() => setViewingDoctorProfile(null)}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                    {getInitials(viewingDoctorProfile?.name, "DR")}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1">
                                        <Stethoscope size={11} /> Verified Oncologist
                                    </div>
                                    <h3 className="text-xl font-bold font-display truncate">
                                        {viewingDoctorProfile.name?.startsWith("Dr.") ? viewingDoctorProfile.name : `Dr. ${viewingDoctorProfile.name || "Specialist"}`}
                                    </h3>
                                    <p className="text-xs text-teal-200 truncate">
                                        {viewingDoctorProfile.specialty || "Integrated Oncology Specialist"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3">
                                    <div className="text-[10px] uppercase font-bold text-teal-600 mb-0.5">Clinical Experience</div>
                                    <div className="text-sm font-bold text-slate-800">{viewingDoctorProfile.experience || "10+ Years"}</div>
                                </div>
                                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3">
                                    <div className="text-[10px] uppercase font-bold text-teal-600 mb-0.5">Patient Rating</div>
                                    <div className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1">
                                        <Star size={14} fill="currentColor" /> {viewingDoctorProfile.rating || 4.9} / 5.0
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-400 font-medium">Practice Location</span>
                                    <span className="font-semibold text-slate-800">{viewingDoctorProfile.city || "Mumbai, India"}</span>
                                </div>
                                {viewingDoctorProfile.email && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">Email</span>
                                        <span className="font-medium text-slate-700">{viewingDoctorProfile.email}</span>
                                    </div>
                                )}
                                {viewingDoctorProfile.phone && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">Contact Phone</span>
                                        <span className="font-medium text-slate-700">{viewingDoctorProfile.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-400 font-medium">Consultation Status</span>
                                    <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Available for Referrals & Consultations
                                    </span>
                                </div>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setViewingDoctorProfile(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const docObj = {
                                            _id: viewingDoctorProfile.doctorId || viewingDoctorProfile._id,
                                            name: viewingDoctorProfile.name,
                                            specialty: viewingDoctorProfile.specialty,
                                            role: "doctor",
                                            email: viewingDoctorProfile.email,
                                            phone: viewingDoctorProfile.phone,
                                            experience: viewingDoctorProfile.experience,
                                            city: viewingDoctorProfile.city,
                                            available: viewingDoctorProfile.available,
                                        };
                                        setActiveChatPartner(docObj);
                                        if (!conversations.some(c => c._id === docObj._id)) {
                                            setConversations(prev => [docObj, ...prev]);
                                        }
                                        setViewingDoctorProfile(null);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                                >
                                    <MessageCircle size={15} /> Message Doctor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}