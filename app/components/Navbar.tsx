"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { languages } from "../data/mockData";
import {
    Menu,
    X,
    Globe,
    Bell,
    ChevronDown,
    LogOut,
    Home,
    LayoutDashboard,
    HeartPulse,
    Clock,
    MessageSquare,
    Activity,
    Package,
    Stethoscope,
    Users,
    Calendar,
    Info,
    ChevronRight,
    Check
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { usePushNotifications } from "@/lib/usePushNotifications";

interface NavItem {
    label: string;
    page: string;
    href: string;
}

const navLinks: NavItem[] = [
    { label: "Home", page: "home", href: "/" },
    { label: "Services", page: "services", href: "/services" },
    { label: "Packages", page: "packages", href: "/packages" },
    { label: "Events", page: "events", href: "/events" },
    { label: "About Us", page: "about", href: "/about" },
];

const dashLinks: Record<string, NavItem[]> = {
    patient: [
        { label: "Dashboard", page: "patient-dashboard", href: "/patient-dashboard" },
        { label: "My Care", page: "disease-info", href: "/disease-info" },
        { label: "Appointments", page: "appointments", href: "/appointments" },
        { label: "Chat", page: "chat", href: "/chat" },
        { label: "Symptoms", page: "symptoms", href: "/symptoms" },
        { label: "Packages", page: "packages", href: "/packages" },
    ],
    doctor: [
        { label: "Dashboard", page: "doctor-dashboard", href: "/doctor-dashboard" },
        { label: "Patients", page: "patients", href: "/patients" },
        { label: "Appointments", page: "appointments", href: "/appointments" },
        { label: "Chat", page: "chat", href: "/chat" },
        { label: "Events", page: "events", href: "/events" },
    ],
    admin: [
        { label: "Dashboard", page: "admin-dashboard", href: "/admin-dashboard" },
        { label: "Doctors", page: "services", href: "/services" },
        { label: "Patients", page: "patients", href: "/patients" },
        { label: "Events", page: "events-admin", href: "/events-admin" },
        { label: "Packages", page: "packages", href: "/packages" },
    ],
};

const getNavIcon = (page: string) => {
    switch (page) {
        case "home":
            return Home;
        case "patient-dashboard":
        case "doctor-dashboard":
        case "admin-dashboard":
        case "dashboard":
            return LayoutDashboard;
        case "disease-info":
            return HeartPulse;
        case "appointments":
            return Clock;
        case "chat":
            return MessageSquare;
        case "symptoms":
            return Activity;
        case "packages":
            return Package;
        case "services":
            return Stethoscope;
        case "patients":
            return Users;
        case "events":
        case "events-admin":
            return Calendar;
        case "about":
            return Info;
        default:
            return LayoutDashboard;
    }
};

export default function Navbar() {
    const { role, page, setPage, lang, setLang, isLoggedIn, logout, currentUser } = useApp();
    const { isSubscribed } = usePushNotifications();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

    // Prevent background scroll and handle Escape key when mobile drawer is open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        if (menuOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    // Close mobile drawer on route change
    useEffect(() => {
        setMenuOpen(false);
        setLangOpen(false);
    }, [pathname]);

    // Hide Navbar on authentication and blocked pages
    if (pathname === "/login" || pathname === "/register" || pathname === "/blocked") {
        return null;
    }

    const links = isLoggedIn && role ? dashLinks[role] : navLinks;
    const currentLang = languages.find(l => l.code === lang) || languages[0];

    const initials = currentUser?.initials || (currentUser?.name
        ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : (role === "patient" ? "MJ" : role === "doctor" ? "PS" : "AD"));

    const isLinkActive = (l: NavItem) => {
        if (pathname === l.href) return true;
        if (l.href !== "/" && pathname?.startsWith(l.href)) return true;
        if (page === l.page) return true;
        return false;
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-teal-100 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Side: Mobile Hamburger Menu Button (leftmost) + Brand Logo */}
                        <div className="flex items-center">
                            {/* Mobile Hamburger Toggle Button (Positioned leftmost to the left of Apex icon with matching height & flex centering) */}
                            <button
                                type="button"
                                onClick={() => setMenuOpen(true)}
                                aria-label="Open navigation menu"
                                aria-expanded={menuOpen}
                                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer mr-2 shrink-0"
                            >
                                <Menu size={22} className="shrink-0" />
                            </button>

                            {/* Brand Logo: Desktop uses apex-logo.png, Mobile uses apex-icon.png with identical height bounding */}
                            <Link
                                href={isLoggedIn && role ? `/${role}-dashboard` : "/"}
                                onClick={() => {
                                    if (isLoggedIn && role) {
                                        setPage(`${role}-dashboard`);
                                    } else {
                                        setPage("home");
                                    }
                                    setMenuOpen(false);
                                }}
                                className="flex items-center h-10 shrink-0 group mx-1"
                            >
                                {/* Desktop Dimension Logo */}
                                <Image
                                    src="/apex-logo.png"
                                    alt="Apex Onco Care"
                                    width={128}
                                    height={40}
                                    className="h-10 w-auto object-contain hidden md:block transition-transform duration-200 group-hover:scale-[1.02]"
                                    priority
                                />
                                {/* Mobile Dimension Logo */}
                                <Image
                                    src="/apex-icon.png"
                                    alt="Apex Onco Care"
                                    width={40}
                                    height={40}
                                    className="h-10 w-auto object-contain block md:hidden transition-transform duration-200 group-hover:scale-105"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {links.map(l => {
                                const active = isLinkActive(l);
                                return (
                                    <Link
                                        key={l.page}
                                        href={l.href}
                                        onClick={() => setPage(l.page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            active
                                                ? "bg-teal-50 text-teal-700 shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                        }`}
                                    >
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Right Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Language Selector Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setLangOpen(!langOpen)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                                    aria-label="Select language"
                                >
                                    <Globe size={15} />
                                    <span className="text-xs font-medium">{currentLang?.label}</span>
                                    <ChevronDown size={11} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
                                </button>
                                {langOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-teal-100 shadow-xl p-1.5 min-w-[150px] z-50 animate-fadeIn">
                                        {languages.map(l => (
                                            <button
                                                key={l.code}
                                                onClick={() => { setLang(l.code); setLangOpen(false); }}
                                                className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                                    lang === l.code ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                <span>{l.label}</span>
                                                {lang === l.code && <Check size={12} className="text-teal-600" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Push Notifications Bell */}
                            {isLoggedIn && (
                                <button
                                    onClick={() => setNotificationCenterOpen(true)}
                                    aria-label="Push Notifications"
                                    title="Push Notification Settings & Reminders"
                                    className="relative p-2 rounded-lg text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                                >
                                    <Bell size={17} />
                                    <span
                                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                                            isSubscribed
                                                ? "bg-emerald-500 ring-2 ring-white"
                                                : "bg-amber-400 animate-pulse"
                                        }`}
                                    ></span>
                                </button>
                            )}

                            {/* User Profile / Auth buttons */}
                            {isLoggedIn ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={dashLinks[role || "patient"]?.[0]?.href || "/dashboard"}
                                        className="flex items-center gap-2 px-2.5 py-1.5 bg-teal-50/80 hover:bg-teal-100/70 border border-teal-100 rounded-xl transition-colors cursor-pointer group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                            {initials}
                                        </div>
                                        <div className="text-left leading-none pr-1">
                                            <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                                                {currentUser?.name || "User"}
                                            </div>
                                            <div className="text-[10px] text-teal-700 font-medium capitalize mt-0.5">
                                                {role}
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Sign Out"
                                        aria-label="Sign Out"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setPage("login")}
                                        className="px-3.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setPage("register")}
                                        className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Hamburger Drawer Opening from the Left */}
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
                    menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setMenuOpen(false)}
                aria-hidden={!menuOpen}
            />

            {/* Slide-over Drawer Panel */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                aria-label="Mobile Navigation Menu"
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-teal-100 bg-gradient-to-r from-teal-50/60 via-white to-teal-50/20">
                    <Link
                        href={isLoggedIn && role ? `/${role}-dashboard` : "/"}
                        onClick={() => {
                            if (isLoggedIn && role) setPage(`${role}-dashboard`);
                            else setPage("home");
                            setMenuOpen(false);
                        }}
                        className="flex items-center shrink-0"
                    >
                        <Image
                            src="/apex-logo.png"
                            alt="Apex Onco Care"
                            width={120}
                            height={36}
                            className="h-9 w-auto object-contain"
                        />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation menu"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Signed-in User Profile Section */}
                {isLoggedIn ? (
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                        <Link
                            href={dashLinks[role || "patient"]?.[0]?.href || "/dashboard"}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 text-sm truncate group-hover:text-teal-700 transition-colors">
                                    {currentUser?.name || "Apex User"}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    {currentUser?.email || "Signed in"}
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded-md mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                    <span>{role === "doctor" ? "Specialist Doctor" : role === "admin" ? "Hospital Admin" : "Patient Portal"}</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                        <Link
                            href="/login"
                            onClick={() => { setPage("login"); setMenuOpen(false); }}
                            className="flex-1 py-2.5 text-center text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => { setPage("register"); setMenuOpen(false); }}
                            className="flex-1 py-2.5 text-center text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
                        >
                            Register
                        </Link>
                    </div>
                )}

                {/* Scrollable Middle Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* All Navigation Links */}
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-2">
                            Navigation
                        </div>
                        <div className="space-y-1">
                            {links.map(l => {
                                const active = isLinkActive(l);
                                const Icon = getNavIcon(l.page);
                                return (
                                    <Link
                                        key={l.page}
                                        href={l.href}
                                        onClick={() => {
                                            setPage(l.page);
                                            setMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            active
                                                ? "bg-teal-50 text-teal-800 font-semibold shadow-xs border-l-4 border-teal-600"
                                                : "text-slate-600 hover:text-teal-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Icon size={18} className={active ? "text-teal-700" : "text-slate-400"} />
                                        <span className="flex-1">{l.label}</span>
                                        {active && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notification Center Trigger */}
                    {isLoggedIn && (
                        <div className="pt-2 border-t border-slate-100">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                                <Bell size={13} className="text-teal-600" />
                                <span>Notifications &amp; Reminders</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationCenterOpen(true);
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/70 hover:border-teal-200 transition-colors text-left cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-white text-teal-600 border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Bell size={15} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                                            Notification Center
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {isSubscribed ? "Web Push Active" : "Reminders & Alerts"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${
                                            isSubscribed ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-amber-400 animate-pulse"
                                        }`}
                                    ></span>
                                    <span className="text-[11px] font-semibold text-teal-700">
                                        Open
                                    </span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                            <Globe size={13} className="text-teal-600" />
                            <span>Language Preferences</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 px-0.5">
                            {languages.map(l => {
                                const isSelected = lang === l.code;
                                return (
                                    <button
                                        key={l.code}
                                        type="button"
                                        onClick={() => setLang(l.code)}
                                        className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                                            isSelected
                                                ? "bg-teal-600 text-white font-semibold shadow-xs"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                                        }`}
                                    >
                                        {l.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Drawer Footer: Sign Out Button */}
                {isLoggedIn && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <button
                            type="button"
                            onClick={async () => {
                                setMenuOpen(false);
                                await logout();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <LogOut size={15} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Notification Center Dialog Modal */}
            <NotificationCenter
                isOpen={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
            />
        </>
    );
}