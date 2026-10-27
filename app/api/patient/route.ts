import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { formatToISTDateTime } from "@/lib/dateTime";

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

        const patientObj = patient.toObject();

        // Ensure vitals timestamp is normalized to IST
        if (patientObj.vitals && patientObj.vitals.updatedAt) {
            patientObj.vitals.lastUpdated = formatToISTDateTime(patientObj.vitals.updatedAt);
        }

        // If vitalsHistory is empty but vitals exist, provide initial history item
        if (
            (!patientObj.vitalsHistory || patientObj.vitalsHistory.length === 0) &&
            (patientObj.vitals?.bp || patientObj.vitals?.pulse || patientObj.vitals?.temp || patientObj.vitals?.weight)
        ) {
            patientObj.vitalsHistory = [
                {
                    bp: patientObj.vitals.bp || "",
                    temp: patientObj.vitals.temp || "",
                    pulse: patientObj.vitals.pulse || "",
                    weight: patientObj.vitals.weight || "",
                    lastUpdated: patientObj.vitals.lastUpdated || formatToISTDateTime(patientObj.vitals.updatedAt || new Date()),
                    recordedAt: patientObj.vitals.updatedAt || new Date(),
                    recordedBy: "Clinical Assessment",
                    notes: "Initial recorded vitals",
                },
            ];
        }

        return NextResponse.json({ success: true, patient: patientObj });
    } catch (err: any) {
        console.error("[PATIENT GET]", err);
        return NextResponse.json({ success: false, message: err.message || "Server error." }, { status: 500 });
    }
}

// PATCH — update doctor notes, disease status, stage, prognosis, vitals, and log symptoms
export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        let id = searchParams.get("id");
        let recorderName = "Oncology Care Team";

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role?: string; name?: string };
                if (!id) {
                    id = decoded.id;
                }
                if (decoded.name) {
                    recorderName = decoded.name;
                } else if (decoded.id) {
                    const loggedInUser = await User.findById(decoded.id).select("name role");
                    if (loggedInUser?.name) {
                        recorderName = loggedInUser.role === "doctor" && !loggedInUser.name.startsWith("Dr.") 
                            ? `Dr. ${loggedInUser.name}` 
                            : loggedInUser.name;
                    }
                }
            } catch (e) {
                // Ignore token decode error
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

        let pushUpdate: any = null;

        // If vitals object is passed, update patient vitals and append to vitalsHistory
        if (vitals && typeof vitals === "object") {
            const now = new Date();
            const lastUpdatedStr = formatToISTDateTime(now);

            updateData.vitals = {
                bp: vitals.bp !== undefined ? vitals.bp : "",
                temp: vitals.temp !== undefined ? vitals.temp : "",
                pulse: vitals.pulse !== undefined ? vitals.pulse : "",
                weight: vitals.weight !== undefined ? vitals.weight : "",
                lastUpdated: lastUpdatedStr,
                updatedAt: now,
            };

            const vitalEntry = {
                bp: vitals.bp !== undefined ? vitals.bp : "",
                temp: vitals.temp !== undefined ? vitals.temp : "",
                pulse: vitals.pulse !== undefined ? vitals.pulse : "",
                weight: vitals.weight !== undefined ? vitals.weight : "",
                lastUpdated: lastUpdatedStr,
                recordedAt: now,
                recordedBy: vitals.recordedBy || recorderName,
                notes: vitals.notes || "",
            };

            if (!pushUpdate) pushUpdate = {};
            pushUpdate.vitalsHistory = vitalEntry;
        }

        // If there's a symptom to log, append it to recentSymptoms with MongoDB Date timestamp in IST
        if (symptom && severity) {
            const now = new Date();
            // Format: e.g. "Wed, Oct 16" in IST
            const dayDateMonth = now.toLocaleDateString("en-US", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
                month: "short",
                day: "numeric",
            });
            // Format: e.g. "06:30 PM IST"
            const timeStr = now.toLocaleTimeString("en-US", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }) + " IST";
            const fullDateStr = `${dayDateMonth} • ${timeStr}`;

            if (!pushUpdate) pushUpdate = {};
            pushUpdate.recentSymptoms = {
                symptom,
                severity,
                date: fullDateStr,
                time: timeStr,
                createdAt: now,
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