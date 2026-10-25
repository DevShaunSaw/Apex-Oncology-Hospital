import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Message from "@/models/Message";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role: string };
        const body = await req.json();
        const { patientId, doctorId } = body;

        if (!patientId) {
            return NextResponse.json({ success: false, error: "Patient ID is required." }, { status: 400 });
        }

        // Determine target doctor
        let targetDoctorId: string | null = null;
        if (decoded.role === "doctor") {
            // A doctor can assign the patient to themselves
            targetDoctorId = decoded.id;
        } else if (decoded.role === "admin") {
            // Admin can assign to a specified doctor or null (unassigned)
            targetDoctorId = doctorId || null;
        } else {
            return NextResponse.json(
                { success: false, error: "Forbidden: Only doctors or administrators can assign patients." },
                { status: 403 }
            );
        }

        let assignedDoctorUser = null;
        if (targetDoctorId) {
            assignedDoctorUser = await User.findOne({ _id: targetDoctorId, role: "doctor" });
            if (!assignedDoctorUser) {
                return NextResponse.json({ success: false, error: "Selected doctor does not exist." }, { status: 404 });
            }
        }

        const updatedPatient = await User.findOneAndUpdate(
            { _id: patientId, role: "patient" },
            { assignedDoctor: targetDoctorId },
            { new: true }
        ).populate("assignedDoctor", "name specialty experience email phone available");

        if (!updatedPatient) {
            return NextResponse.json({ success: false, error: "Patient not found." }, { status: 404 });
        }

        // If a doctor assigned the patient to themselves via chat, create a system confirmation message
        let systemMessage = null;
        if (decoded.role === "doctor" && targetDoctorId) {
            const formattedTime = new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const doctorName = assignedDoctorUser?.name || "Doctor";
            const doctorDisplayName = doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`;

            try {
                systemMessage = await Message.create({
                    sender: targetDoctorId,
                    receiver: patientId,
                    message: `${doctorDisplayName} has accepted you as their patient and is now your primary oncologist.`,
                    type: "appointment",
                    time: formattedTime,
                });
            } catch (msgErr) {
                console.error("[ASSIGN PATIENT] Error creating chat notification message:", msgErr);
            }
        }

        const docNameStr = assignedDoctorUser?.name
            ? (assignedDoctorUser.name.startsWith("Dr.") ? assignedDoctorUser.name : `Dr. ${assignedDoctorUser.name}`)
            : "doctor";

        return NextResponse.json({
            success: true,
            message: targetDoctorId
                ? `Patient successfully assigned to ${docNameStr}.`
                : "Patient successfully unassigned.",
            patient: updatedPatient,
            systemMessage,
        });
    } catch (err: any) {
        console.error("[ASSIGN PATIENT ERROR]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to update patient assignment." },
            { status: 500 }
        );
    }
}
