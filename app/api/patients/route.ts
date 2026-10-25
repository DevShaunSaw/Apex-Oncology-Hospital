import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { doctorPatients } from "@/app/data/mockData";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Get current user session if exists
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        let loggedInDoctorId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role: string };
                if (decoded.role === "doctor") {
                    loggedInDoctorId = decoded.id;
                }
            } catch (e) {
                // Ignore token errors
            }
        }

        // 2. Database seeding if there are no patients in the DB
        const patientCount = await User.countDocuments({ role: "patient" });
        if (patientCount === 0) {
            console.log("[SEED] No patients found in database. Starting database seeding...");
            
            // Check if a doctor exists
            let doctor = await User.findOne({ role: "doctor" });
            if (!doctor) {
                const hashedPassword = await bcrypt.hash("password", 10);
                doctor = await User.create({
                    name: "Dr. Priya Sharma",
                    email: "doctor@email.com",
                    password: hashedPassword,
                    role: "doctor",
                    specialty: "Medical Oncology",
                    experience: "18 Years Experience",
                    rating: 4.9,
                    available: true,
                    phone: "+91 99999 99999",
                });
                console.log("[SEED] Default doctor account created:", doctor.email);
            }

            // Seed mock patients assigned to this doctor
            const patientsToSeed = doctorPatients.map((p, idx) => {
                const { id, ...patientData } = p;
                return {
                    ...patientData,
                    email: patientData.email || `patient${idx + 1}@email.com`,
                    password: "password_placeholder_never_used_directly", // Will be hashed if registering, otherwise dummy
                    role: "patient",
                    assignedDoctor: doctor._id,
                };
            });

            // Hash passwords for patients
            for (const p of patientsToSeed) {
                p.password = await bcrypt.hash("password", 10);
            }

            await User.insertMany(patientsToSeed);
            console.log("[SEED] Seeded mock patients in the database successfully.");
        }

        // 3. Query patients
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() ?? "";
        const status = searchParams.get("status") ?? "all";
        const sortBy = searchParams.get("sortBy") ?? "name";
        const showAll = searchParams.get("all") === "true";

        // Build MongoDB query
        const query: any = { role: "patient" };
        
        // If a doctor is logged in, show only patients assigned to them unless all=true is specified
        if (loggedInDoctorId && !showAll) {
            query.assignedDoctor = loggedInDoctorId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { patientId: { $regex: search, $options: "i" } },
                { disease: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } }
            ];
        }

        if (status !== "all") {
            if (status === "active-treatment") {
                query.status = "Active Treatment";
            } else if (status === "post-chemotherapy") {
                query.status = "Post-Chemotherapy";
            } else if (status === "remission") {
                query.status = "Remission";
            }
        }

        // Fetch patients
        const dbPatients = await User.find(query);

        // Map to plain objects
        let patients = dbPatients.map(p => {
            const obj = p.toObject();
            obj.id = obj._id.toString(); // Ensure compatibility with client-side code expecting 'id'
            return obj;
        });

        // Sort patients in JS for simplicity & consistency with original logic
        if (sortBy === "name") {
            patients.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortBy === "age") {
            patients.sort((a, b) => (b.age || 0) - (a.age || 0));
        } else if (sortBy === "recovery") {
            patients.sort((a, b) => (b.recoveryIndex || 0) - (a.recoveryIndex || 0));
        } else if (sortBy === "appointment") {
            patients.sort((a, b) => (a.nextAppointment || "").localeCompare(b.nextAppointment || ""));
        }

        // Compute summary stats dynamically from all patients assigned to this doctor (or all patients if not filtering)
        const statsQuery = loggedInDoctorId ? { role: "patient", assignedDoctor: loggedInDoctorId } : { role: "patient" };
        const allPatientsForStats = await User.find(statsQuery);
        const stats = {
            total: allPatientsForStats.length,
            active: allPatientsForStats.filter((p) => p.status === "Active Treatment").length,
            remission: allPatientsForStats.filter((p) => p.status === "Remission").length,
            flagged: allPatientsForStats.filter((p) => p.flagged).length,
            avgRecovery: allPatientsForStats.length > 0 
                ? Math.round(allPatientsForStats.reduce((sum, p) => sum + (p.recoveryIndex || 0), 0) / allPatientsForStats.length)
                : 0,
        };

        return NextResponse.json({ success: true, patients, stats });
    } catch (err) {
        console.error("[PATIENTS GET]", err);
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}