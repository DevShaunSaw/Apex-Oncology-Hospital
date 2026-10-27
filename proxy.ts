import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Public pages accessible when logged out
const PUBLIC_PATHS = new Set([
    "/",
    "/login",
    "/register",
    "/reset-password",
    "/packages",
    "/about",
    "/services",
    "/events",
    "/blocked",
    "/_not-found",
]);

// Map of protected route prefixes to authorized roles
const ROUTE_ROLE_PERMISSIONS: { prefix: string; exact?: boolean; allowedRoles: ("patient" | "doctor" | "admin")[] }[] = [
    { prefix: "/patient-dashboard", allowedRoles: ["patient"] },
    { prefix: "/dashboard/patient", allowedRoles: ["patient"] },
    { prefix: "/symptoms", allowedRoles: ["patient"] },
    { prefix: "/disease-info", allowedRoles: ["patient"] },

    { prefix: "/doctor-dashboard", allowedRoles: ["doctor"] },
    { prefix: "/dashboard/doctor", allowedRoles: ["doctor"] },

    { prefix: "/admin-dashboard", allowedRoles: ["admin"] },
    { prefix: "/dashboard/admin", allowedRoles: ["admin"] },
    { prefix: "/events-admin", allowedRoles: ["admin"] },

    { prefix: "/patients", allowedRoles: ["doctor", "admin"] },
    { prefix: "/appointments", allowedRoles: ["patient", "doctor", "admin"] },
    { prefix: "/chat", allowedRoles: ["patient", "doctor", "admin"] },
];

interface DecodedToken {
    id: string;
    role: "patient" | "doctor" | "admin";
    isBlocked?: boolean;
}

function verifyToken(token: string | undefined): DecodedToken | null {
    if (!token) return null;
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret"
        ) as DecodedToken;
        if (!decoded || !decoded.id || !decoded.role) return null;
        return decoded;
    } catch {
        return null;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Retrieve session from HTTP-only cookie
    const token = request.cookies.get("auth_token")?.value;
    const session = verifyToken(token);

    // 1. If user is blocked, redirect them to /blocked
    if (session?.isBlocked) {
        if (pathname !== "/blocked") {
            return NextResponse.redirect(new URL("/blocked", request.url));
        }
        return NextResponse.next();
    }

    // 2. Redirect logged-in users away from /login or /register to their dashboard
    if (session && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url));
    }

    // 3. Handle /dashboard generic route
    if (pathname === "/dashboard") {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url));
    }

    // 4. Check if the requested route is one of the protected routes
    const matchingRule = ROUTE_ROLE_PERMISSIONS.find(rule =>
        pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
    );

    if (matchingRule) {
        // If not logged in, divert to login page
        if (!session) {
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // If logged in, check role permissions:
        // Cross-role URL tampering: render 404 This page does not exist
        if (!matchingRule.allowedRoles.includes(session.role)) {
            const notFoundUrl = new URL("/_not-found", request.url);
            return NextResponse.rewrite(notFoundUrl, { status: 404 });
        }
    }

    // For public paths or any other route, proceed normally
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
