import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { appointments as mockAppointments } from "@/app/data/mockData";
import { checkAndSendAppointmentReminders } from "@/lib/pushNotifications";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role: string };
        
        // 1. Database Seeding if no appointments exist
        const appointmentCount = await Appointment.countDocuments();
        if (appointmentCount === 0) {
            console.log("[SEED] No appointments found in database. Seeding mock appointments...");
            const doctor = await User.findOne({ role: "doctor" });
            const patients = await User.find({ role: "patient" });

            if (doctor && patients.length > 0) {
                const appointmentsToSeed = mockAppointments.map((ma, idx) => {
                    // Try to match patient name
                    const matchedPatient = patients.find(p => p.name === ma.patient) || patients[0];
                    return {
                        patient: matchedPatient._id,
                        doctor: doctor._id,
                        date: ma.date,
                        time: ma.time,
                        type: ma.type,
                        status: ma.status,
                        contact: ma.contact,
                        diseaseDetails: ma.diseaseDetails,
                        treatmentPlan: ma.treatmentPlan,
                    };
                });
                await Appointment.insertMany(appointmentsToSeed);
                console.log("[SEED] Mock appointments seeded successfully.");
            }
        }

        // 2. Fetch appointments
        const query: any = {};
        if (decoded.role === "patient") {
            query.patient = decoded.id;
        } else if (decoded.role === "doctor") {
            query.doctor = decoded.id;
        }

        const appointmentsList = await Appointment.find(query)
            .populate("patient", "name email phone stage disease status patientId recentSymptoms recoveryIndex flagged")
            .populate("doctor", "name specialty experience rating")
            .sort({ date: 1, time: 1 });

        // Map to standard JSON response objects
        const formattedAppointments = appointmentsList.map(a => {
            const obj = a.toObject();
            obj.id = obj._id.toString();
            
            // For compatibility with frontend expecting a flat patient/doctor name string:
            obj.patientName = obj.patient?.name || "Unknown Patient";
            obj.doctorName = obj.doctor?.name || "Unknown Doctor";
            // Make sure simple strings work too:
            obj.patient = obj.patientName;
            obj.doctor = obj.doctorName;
            
            return obj;
        });

        // Trigger appointment reminder evaluations in background
        checkAndSendAppointmentReminders().catch((remErr) =>
            console.error("[APPOINTMENTS] Background reminders check error:", remErr)
        );

        return NextResponse.json({ success: true, appointments: formattedAppointments });
    } catch (err: any) {
        console.error("[APPOINTMENTS GET]", err);
        return NextResponse.json({ success: false, error: err.message || "Server error." }, { status: 500 });
    }
}

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
        const { date, time, type, doctorId, patientId, contact, diseaseDetails, treatmentPlan } = body;

        let finalPatientId = null;
        let finalDoctorId = null;

        if (decoded.role === "patient") {
            finalPatientId = decoded.id;
            
            // Find doctor: either passed, or use the patient's assigned doctor
            if (doctorId) {
                finalDoctorId = doctorId;
            } else {
                const patientUser = await User.findById(decoded.id);
                finalDoctorId = patientUser?.assignedDoctor;
            }
        } else if (decoded.role === "doctor") {
            finalDoctorId = decoded.id;
            finalPatientId = patientId;
        }

        if (!finalPatientId || !finalDoctorId || !date || !time || !type) {
            return NextResponse.json({ success: false, error: "Missing required booking details (date, time, type, patient, doctor)." }, { status: 400 });
        }

        // Create the appointment in DB
        const appointment = await Appointment.create({
            patient: finalPatientId,
            doctor: finalDoctorId,
            date,
            time,
            type,
            status: "confirmed", // auto-confirm for user testing convenience
            contact: contact || "+91 99999 99999",
            diseaseDetails: diseaseDetails || "Routine visit",
            treatmentPlan: treatmentPlan || "Review care path",
        });

        // Parse date for nextAppointment string formatting (e.g. "May 22, 10:00 AM")
        let nextApptStr = `${date} — ${time}`;
        try {
            if (date.includes("-")) {
                const parts = date.split("-").map(Number);
                if (parts.length === 3) {
                    const [year, month, day] = parts;
                    const dateObj = new Date(year, month - 1, day);
                    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    nextApptStr = `${formattedDate}, ${time}`;
                }
            } else {
                nextApptStr = `${date}, ${time}`;
            }
        } catch (e) {
            // Fallback to raw date-time
        }

        // Update the patient user record's next appointment info
        await User.findByIdAndUpdate(finalPatientId, {
            nextAppointment: nextApptStr,
        });

        // Trigger reminder check for newly scheduled appointment
        checkAndSendAppointmentReminders().catch((remErr) =>
            console.error("[APPOINTMENTS] Background reminders check error:", remErr)
        );

        return NextResponse.json({ success: true, appointment });
    } catch (err: any) {
        console.error("[APPOINTMENTS POST]", err);
        return NextResponse.json({ success: false, error: err.message || "Server error." }, { status: 500 });
    }
}
