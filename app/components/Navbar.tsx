"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { languages } from "../data/mockData";
import { Menu, X, Globe, Bell, ChevronDown, LogOut } from "lucide-react";

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

export default function Navbar() {
    const { role, page, setPage, lang, setLang, isLoggedIn, logout } = useApp();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    // Hide Navbar on authentication pages
    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    const links = isLoggedIn && role ? dashLinks[role] : navLinks;
    const currentLang = languages.find(l => l.code === lang);

    const initials = role === "patient" ? "MJ" : role === "doctor" ? "PS" : "AD";

    const isLinkActive = (l: NavItem) => {
        if (pathname === l.href) return true;
        if (l.href !== "/" && pathname?.startsWith(l.href)) return true;
        if (page === l.page) return true;
        return false;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-teal-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={() => { setPage("home"); setMenuOpen(false); }}
                        className="flex items-center gap-2 shrink-0 group"
                    >
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="leading-tight hidden sm:block">
                            <div className="font-display font-semibold text-teal-800 text-lg leading-none">Apex</div>
                            <div className="text-[10px] text-teal-500 tracking-widest uppercase leading-none">Onco Care</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
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
                                            ? "bg-teal-50 text-teal-700 shadow-xs"
                                            : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                    }`}
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                                <Globe size={15} />
                                <span className="hidden sm:inline text-xs">{currentLang?.label}</span>
                                <ChevronDown size={11} />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-teal-100 shadow-lg p-2 min-w-[140px] z-50">
                                    {languages.map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                lang === l.code ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isLoggedIn && (
                            <button
                                aria-label="Notifications"
                                className="relative p-2 rounded-lg text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                                <Bell size={17} />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                            </button>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href={dashLinks[role || "patient"]?.[0]?.href || "/dashboard"}
                                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg hover:bg-teal-100/70 transition-colors cursor-pointer"
                                >
                                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                        {initials}
                                    </div>
                                    <span className="text-sm font-medium text-teal-700 capitalize">{role}</span>
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Logout"
                                    aria-label="Logout"
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href="/login"
                                    onClick={() => setPage("login")}
                                    className="px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setPage("register")}
                                    className="px-4 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle navigation menu"
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-teal-50"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-teal-50 space-y-1">
                        {links.map(l => {
                            const active = isLinkActive(l);
                            return (
                                <Link
                                    key={l.page}
                                    href={l.href}
                                    onClick={() => { setPage(l.page); setMenuOpen(false); }}
                                    className={`w-full block text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        active ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}