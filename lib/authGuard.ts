import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import jwt from "jsonwebtoken";

export type Role = "patient" | "doctor" | "admin";

export interface SessionUser {
    id: string;
    role: Role;
    isBlocked?: boolean;
}

/**
 * Retrieves and cryptographically validates the session user from the HTTP-only auth token cookie.
 */
export async function getServerSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return null;

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret"
        ) as SessionUser;

        if (!decoded || !decoded.id || !decoded.role) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

/**
 * Server-side guard to strictly enforce authentication and role isolation:
 * - If not logged in -> redirects to /login.
 * - If account suspended -> redirects to /blocked.
 * - If user's role is not in allowedRoles -> triggers notFound() (HTTP 404).
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<SessionUser> {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    if (session.isBlocked) {
        redirect("/blocked");
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        // Cross-role URL tampering: display error 404 page does not exist
        notFound();
    }

    return session;
}
