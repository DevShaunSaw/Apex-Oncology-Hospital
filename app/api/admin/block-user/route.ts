import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized: Missing authentication token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role: string };
        if (decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Forbidden: Only hospital administrators can block or unblock users." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { patientId, isBlocked, reason } = body;

        if (!patientId) {
            return NextResponse.json({ success: false, error: "Patient ID is required." }, { status: 400 });
        }

        const targetUser = await User.findById(patientId);
        if (!targetUser) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        if (targetUser.role === "admin") {
            return NextResponse.json({ success: false, error: "Administrators cannot be blocked." }, { status: 400 });
        }

        if (isBlocked) {
            const cleanReason = (reason || "").trim();
            if (!cleanReason) {
                return NextResponse.json(
                    { success: false, error: "A specific reason must be provided when blocking a user." },
                    { status: 400 }
                );
            }

            const updatedUser = await User.findByIdAndUpdate(
                patientId,
                {
                    isBlocked: true,
                    blockedReason: cleanReason,
                    blockedAt: new Date(),
                },
                { new: true }
            )
                .select("-password")
                .populate("assignedDoctor", "name specialty");

            return NextResponse.json({
                success: true,
                message: `User ${targetUser.name} has been blocked from the platform.`,
                user: updatedUser,
            });
        } else {
            // Unblock user
            const updatedUser = await User.findByIdAndUpdate(
                patientId,
                {
                    isBlocked: false,
                    blockedReason: "",
                    blockedAt: null,
                },
                { new: true }
            )
                .select("-password")
                .populate("assignedDoctor", "name specialty");

            return NextResponse.json({
                success: true,
                message: `User ${targetUser.name} has been unblocked and access restored.`,
                user: updatedUser,
            });
        }
    } catch (err: any) {
        console.error("[ADMIN BLOCK USER ERROR]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to update user block status." },
            { status: 500 }
        );
    }
}
