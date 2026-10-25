"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type Role = "patient" | "doctor" | "admin" | null;

export const pageToRouteMap: Record<string, string> = {
    "home": "/",
    "register": "/register",
    "login": "/login",
    "dashboard": "/dashboard",
    "patient-dashboard": "/patient-dashboard",
    "doctor-dashboard": "/doctor-dashboard",
    "admin-dashboard": "/admin-dashboard",
    "chat": "/chat",
    "packages": "/packages",
    "services": "/services",
    "events": "/events",
    "events-admin": "/events-admin",
    "about": "/about",
    "appointments": "/appointments",
    "disease-info": "/disease-info",
    "symptoms": "/symptoms",
    "patients": "/patients",
    "blocked": "/blocked",
};

export const routeToPageMap: Record<string, string> = {
    "/": "home",
    "/register": "register",
    "/login": "login",
    "/dashboard": "dashboard",
    "/patient-dashboard": "patient-dashboard",
    "/doctor-dashboard": "doctor-dashboard",
    "/admin-dashboard": "admin-dashboard",
    "/dashboard/patient": "patient-dashboard",
    "/dashboard/doctor": "doctor-dashboard",
    "/dashboard/admin": "admin-dashboard",
    "/chat": "chat",
    "/packages": "packages",
    "/services": "services",
    "/events": "events",
    "/events-admin": "events-admin",
    "/about": "about",
    "/appointments": "appointments",
    "/disease-info": "disease-info",
    "/symptoms": "symptoms",
    "/patients": "patients",
    "/blocked": "blocked",
};

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

const getPageFromPath = (path: string): string => {
    if (routeToPageMap[path]) return routeToPageMap[path];
    const stripped = path ? path.replace(/^\//, "") : "home";
    return stripped || "home";
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [role, setRole] = useState<Role>(null);
    const [lang, setLang] = useState("en");
    const [page, setPageState] = useState<string>(() => getPageFromPath(pathname || "/"));
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeChatPartner, setActiveChatPartner] = useState<any>(null);

    // Synchronize page state whenever URL pathname changes (e.g. browser back/forward or Link navigation)
    useEffect(() => {
        if (pathname) {
            setPageState(getPageFromPath(pathname));
        }
    }, [pathname]);

    const setPage = useCallback((p: string) => {
        setPageState(p);
        const targetRoute = pageToRouteMap[p] || (p.startsWith("/") ? p : `/${p}`);
        if (pathname !== targetRoute) {
            router.push(targetRoute);
        }
    }, [pathname, router]);

    // Force blocked users to stay on /blocked
    useEffect(() => {
        if (currentUser?.isBlocked && pathname !== "/blocked") {
            setPageState("blocked");
            router.push("/blocked");
        }
    }, [currentUser, pathname, router]);

    const checkUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.user) {
                setCurrentUser(data.user);
                setIsLoggedIn(true);
                setRole(data.user.role);

                // If user has been blocked, force redirect to /blocked
                if (data.user.isBlocked) {
                    setPageState("blocked");
                    if (pathname !== "/blocked") {
                        router.push("/blocked");
                    }
                    return;
                }

                // If user is on home screen or auth screens while logged in, route to their role dashboard
                if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/blocked") {
                    router.push(`/${data.user.role}-dashboard`);
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

                // If user is blocked, route directly to /blocked
                if (data.user.isBlocked || data.blocked) {
                    setPageState("blocked");
                    router.push("/blocked");
                    return { success: true, blocked: true, blockedReason: data.blockedReason };
                }

                const target = `/${data.user.role}-dashboard`;
                setPageState(`${data.user.role}-dashboard`);
                router.push(target);
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
                const target = `/${data.user.role}-dashboard`;
                setPageState(`${data.user.role}-dashboard`);
                router.push(target);
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
        setPageState("home");
        router.push("/");
    };

    return (
        <AppContext.Provider value={{ role, setRole, lang, setLang, page, setPage, isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser, login, register, logout, loading, activeChatPartner, setActiveChatPartner }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);