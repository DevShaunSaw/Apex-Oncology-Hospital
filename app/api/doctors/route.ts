import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/doctors — Public endpoint to list doctors with department, position, degree, experience
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    const query: any = { role: "doctor", isBlocked: { $ne: true } };
    if (department && department !== "all") {
      query.$or = [{ department }, { specialty: department }];
    }

    const doctors = await User.find(query)
      .select("name email department position degree experience yoe specialty available rating createdAt")
      .sort({ department: 1, name: 1 })
      .lean();

    const formatted = doctors.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString(),
    }));

    return NextResponse.json({ success: true, doctors: formatted });
  } catch (err: any) {
    console.error("[DOCTORS GET]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch doctors." },
      { status: 500 }
    );
  }
}
