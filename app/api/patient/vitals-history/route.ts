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
        let patientId = searchParams.get("patientId") || searchParams.get("id");

        if (!patientId) {
            const cookieStore = await cookies();
            const token = cookieStore.get("auth_token")?.value;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
                    patientId = decoded.id;
                } catch {}
            }
        }

        if (!patientId) {
            return NextResponse.json({ success: false, message: "Patient ID is required." }, { status: 400 });
        }

        const patient = await User.findOne({ _id: patientId, role: "patient" });
        if (!patient) {
            return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
        }

        let history = Array.isArray(patient.vitalsHistory) ? [...patient.vitalsHistory] : [];

        // If history is empty, check if initial/current vitals exist to synthesize baseline history
        if (
            history.length === 0 &&
            patient.vitals &&
            (patient.vitals.bp || patient.vitals.pulse || patient.vitals.temp || patient.vitals.weight)
        ) {
            const initialRecordedAt = patient.vitals.updatedAt || patient.createdAt || new Date();
            const baselineEntry = {
                bp: patient.vitals.bp || "",
                temp: patient.vitals.temp || "",
                pulse: patient.vitals.pulse || "",
                weight: patient.vitals.weight || "",
                lastUpdated: patient.vitals.lastUpdated || formatToISTDateTime(initialRecordedAt),
                recordedAt: initialRecordedAt,
                recordedBy: "Clinical Assessment",
                notes: "Initial recorded vitals",
            };
            history.push(baselineEntry);

            // Persist this baseline entry to MongoDB so it's permanently stored in history
            try {
                await User.findByIdAndUpdate(patient._id, {
                    $push: { vitalsHistory: baselineEntry },
                });
            } catch (err) {
                console.error("[VITALS-HISTORY] Failed to persist baseline entry:", err);
            }
        }

        // Sort descending by recordedAt (newest first)
        history.sort((a, b) => {
            const dateA = new Date(a.recordedAt || a.lastUpdated || 0).getTime();
            const dateB = new Date(b.recordedAt || b.lastUpdated || 0).getTime();
            return dateB - dateA;
        });

        // Ensure all history entries have formattedDate in IST
        const formattedHistory = history.map((entry: any) => {
            const entryObj = typeof entry.toObject === "function" ? entry.toObject() : { ...entry };
            const dateSource = entryObj.recordedAt || entryObj.lastUpdated;
            return {
                ...entryObj,
                formattedDate: formatToISTDateTime(dateSource),
                displayTime: formatToISTDateTime(dateSource),
            };
        });

        return NextResponse.json({
            success: true,
            patient: {
                id: patient._id.toString(),
                name: patient.name,
                patientId: patient.patientId || "Patient",
                disease: patient.disease || "",
                stage: patient.stage || "",
            },
            currentVitals: {
                ...patient.vitals,
                lastUpdated: patient.vitals?.updatedAt
                    ? formatToISTDateTime(patient.vitals.updatedAt)
                    : patient.vitals?.lastUpdated || "",
            },
            history: formattedHistory,
            total: formattedHistory.length,
        });
    } catch (err: any) {
        console.error("[VITALS HISTORY GET]", err);
        return NextResponse.json({ success: false, message: err.message || "Server error." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { patientId, vitals } = body;

        if (!patientId) {
            return NextResponse.json({ success: false, message: "Missing patientId." }, { status: 400 });
        }

        if (!vitals || typeof vitals !== "object") {
            return NextResponse.json({ success: false, message: "Invalid vitals data." }, { status: 400 });
        }

        // Determine recorder
        let recorderName = vitals.recordedBy || "Oncology Care Team";
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token && !vitals.recordedBy) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; name?: string };
                if (decoded.name) {
                    recorderName = decoded.name;
                } else if (decoded.id) {
                    const doc = await User.findById(decoded.id).select("name role");
                    if (doc?.name) {
                        recorderName = doc.role === "doctor" && !doc.name.startsWith("Dr.") ? `Dr. ${doc.name}` : doc.name;
                    }
                }
            } catch {}
        }

        const now = new Date();
        const istTimestamp = formatToISTDateTime(now);

        const newVitals = {
            bp: vitals.bp !== undefined ? String(vitals.bp).trim() : "",
            temp: vitals.temp !== undefined ? String(vitals.temp).trim() : "",
            pulse: vitals.pulse !== undefined ? String(vitals.pulse).trim() : "",
            weight: vitals.weight !== undefined ? String(vitals.weight).trim() : "",
            lastUpdated: istTimestamp,
            updatedAt: now,
        };

        const historyEntry = {
            bp: newVitals.bp,
            temp: newVitals.temp,
            pulse: newVitals.pulse,
            weight: newVitals.weight,
            lastUpdated: istTimestamp,
            recordedAt: now,
            recordedBy: recorderName,
            notes: vitals.notes || "",
        };

        const updatedPatient = await User.findOneAndUpdate(
            { _id: patientId, role: "patient" },
            {
                $set: { vitals: newVitals },
                $push: { vitalsHistory: historyEntry },
            },
            { new: true }
        );

        if (!updatedPatient) {
            return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Vitals recorded and saved to database successfully in IST.",
            vitals: updatedPatient.vitals,
            history: updatedPatient.vitalsHistory,
        });
    } catch (err: any) {
        console.error("[VITALS HISTORY POST]", err);
        return NextResponse.json({ success: false, message: err.message || "Server error." }, { status: 500 });
    }
}
