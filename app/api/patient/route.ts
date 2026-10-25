import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        let id = searchParams.get("id");

        if (!id) {
            const cookieStore = await cookies();
            const token = cookieStore.get("auth_token")?.value;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
                id = decoded.id;
            }
        }

        if (!id) {
            return NextResponse.json({ success: false, message: "Missing patient ID." }, { status: 400 });
        }

        const patient = await User.findOne({ _id: id, role: "patient" });
        if (!patient) {
            return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, patient });
    } catch (err: any) {
        console.error("[PATIENT GET]", err);
        return NextResponse.json({ success: false, message: err.message || "Server error." }, { status: 500 });
    }
}

// PATCH — update doctor notes, disease status, stage, prognosis, and log symptoms
export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        let id = searchParams.get("id");

        if (!id) {
            const cookieStore = await cookies();
            const token = cookieStore.get("auth_token")?.value;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
                id = decoded.id;
            }
        }

        if (!id) {
            return NextResponse.json({ success: false, message: "Missing patient ID." }, { status: 400 });
        }

        const body = await req.json();
        const { notes, stage, status, prognosis, disease, symptom, severity, vitals } = body;

        const updateData: any = {};
        if (notes !== undefined) updateData.notes = notes;
        if (stage !== undefined) updateData.stage = stage;
        if (status !== undefined) updateData.status = status;
        if (prognosis !== undefined) updateData.prognosis = prognosis;
        if (disease !== undefined) updateData.disease = disease;

        // If vitals object is passed, update patient vitals
        if (vitals && typeof vitals === "object") {
            const now = new Date();
            const lastUpdatedStr = now.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            updateData.vitals = {
                bp: vitals.bp !== undefined ? vitals.bp : "",
                temp: vitals.temp !== undefined ? vitals.temp : "",
                pulse: vitals.pulse !== undefined ? vitals.pulse : "",
                weight: vitals.weight !== undefined ? vitals.weight : "",
                lastUpdated: vitals.lastUpdated || lastUpdatedStr,
                updatedAt: now,
            };
        }

        // If there's a symptom to log, append it to recentSymptoms with MongoDB Date timestamp (Date.now())
        let pushUpdate: any = null;
        if (symptom && severity) {
            const now = new Date();
            // Format: e.g. "Wed, Oct 16"
            const dayDateMonth = now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
            // Format: e.g. "06:30 PM"
            const timeStr = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
            // Full formatted date-time string: e.g. "Wed, Oct 16 • 06:30 PM"
            const fullDateStr = `${dayDateMonth} • ${timeStr}`;

            pushUpdate = {
                recentSymptoms: {
                    symptom,
                    severity,
                    date: fullDateStr,
                    time: timeStr,
                    createdAt: now,
                },
            };
        }

        const query: any = { _id: id, role: "patient" };
        const updateParams: any = { $set: updateData };
        if (pushUpdate) {
            updateParams.$push = pushUpdate;
        }

        const updatedPatient = await User.findOneAndUpdate(query, updateParams, { new: true });

        if (!updatedPatient) {
            return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, patient: updatedPatient });
    } catch (err: any) {
        console.error("[PATIENT PATCH]", err);
        return NextResponse.json({ success: false, message: err.message || "Server error." }, { status: 500 });
    }
}