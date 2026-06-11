"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "patient" | "doctor" | "admin" | null;
interface AppContextType {
    role: Role;
    setRole: (r: Role) => void;
    lang: string;
    setLang: (l: string) => void;
    page: string;
    setPage: (p: string) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (v: boolean) => void;
    currentUser: any;
    setCurrentUser: (u: any) => void;
    login: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
    register: (form: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    loading: boolean;
    activeChatPartner: any;
    setActiveChatPartner: (u: any) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [lang, setLang] = useState("en");
    const [page, setPage] = useState("home");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeChatPartner, setActiveChatPartner] = useState<any>(null);

    const checkUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.user) {
                setCurrentUser(data.user);
                setIsLoggedIn(true);
                setRole(data.user.role);
                if (page === "home" || page === "login" || page === "register") {
                    setPage(`${data.user.role}-dashboard`);
                }
            } else {
                setCurrentUser(null);
                setIsLoggedIn(false);
                setRole(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email: string, password: string, role: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setCurrentUser(data.user);
                setIsLoggedIn(true);
                setRole(data.user.role);
                setPage(`${data.user.role}-dashboard`);
                return { success: true };
            } else {
                return { success: false, error: data.error || "Login failed" };
            }
        } catch (err: any) {
            return { success: false, error: err.message || "Login failed" };
        }
    };

    const register = async (form: any) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setCurrentUser(data.user);
                setIsLoggedIn(true);
                setRole(data.user.role);
                setPage(`${data.user.role}-dashboard`);
                return { success: true };
            } else {
                return { success: false, error: data.error || "Registration failed" };
            }
        } catch (err: any) {
            return { success: false, error: err.message || "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error(err);
        }
        setCurrentUser(null);
        setIsLoggedIn(false);
        setRole(null);
        setPage("home");
    };

    return (
        <AppContext.Provider value={{ role, setRole, lang, setLang, page, setPage, isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser, login, register, logout, loading, activeChatPartner, setActiveChatPartner }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);