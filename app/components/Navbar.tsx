"use client";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { languages } from "../data/mockData";
import { Menu, X, Globe, Bell, ChevronDown, LogOut } from "lucide-react";

const navLinks = [
    { label: "Home", page: "home" },
    { label: "Services", page: "services" },
    { label: "Packages", page: "packages" },
    { label: "Events", page: "events" },
    { label: "About Us", page: "about" },
];

const dashLinks: Record<string, { label: string; page: string }[]> = {
    patient: [
        { label: "Dashboard", page: "patient-dashboard" },
        { label: "My Care", page: "disease-info" },
        { label: "Appointments", page: "appointments" },
        { label: "Chat", page: "chat" },
        { label: "Symptoms", page: "symptoms" },
    ],
    doctor: [
        { label: "Dashboard", page: "doctor-dashboard" },
        { label: "Patients", page: "patients" },
        { label: "Appointments", page: "appointments" },
        { label: "Chat", page: "chat" },
    ],
    admin: [
        { label: "Dashboard", page: "admin-dashboard" },
        { label: "Doctors", page: "doctors" },
        { label: "Patients", page: "patients" },
        { label: "Events", page: "events-admin" },
    ],
};

export default function Navbar() {
    const { role, page, setPage, lang, setLang, isLoggedIn, logout } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    const links = isLoggedIn && role ? dashLinks[role] : navLinks;
    const currentLang = languages.find(l => l.code === lang);

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-teal-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <button onClick={() => { setPage("home"); setMenuOpen(false); }} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="leading-tight">
                            <div className="font-display font-semibold text-teal-800 text-lg leading-none">Apex</div>
                            <div className="text-[10px] text-teal-500 tracking-widest uppercase leading-none">Onco Care</div>
                        </div>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(l => (
                            <button
                                key={l.page}
                                onClick={() => setPage(l.page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === l.page ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                                <Globe size={15} />
                                <span className="hidden sm:inline">{currentLang?.label}</span>
                                <ChevronDown size={12} />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-teal-100 shadow-card p-2 min-w-[140px] z-50">
                                    {languages.map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${lang === l.code ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isLoggedIn && (
                            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
                            </button>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                        {role === "patient" ? "MJ" : role === "doctor" ? "PS" : "AD"}
                                    </div>
                                    <span className="text-sm font-medium text-teal-700 capitalize">{role}</span>
                                </div>
                                <button
                                    onClick={() => { logout(); }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage("login")} className="px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">Login</button>
                                <button onClick={() => setPage("register")} className="px-4 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Register</button>
                            </div>
                        )}

                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-500">
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-teal-50">
                        {links.map(l => (
                            <button
                                key={l.page}
                                onClick={() => { setPage(l.page); setMenuOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${page === l.page ? "bg-teal-50 text-teal-700" : "text-slate-600"
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}