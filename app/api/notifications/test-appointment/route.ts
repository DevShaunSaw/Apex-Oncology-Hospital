import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendPushNotificationToUser } from "@/lib/pushNotifications";
import Appointment from "@/models/Appointment";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string; role: string };
    const userId = decoded.id;

    const body = await req.json();
    const { reminderType } = body; // "24h" | "1h"

    // Find user's latest appointment if exists, or use default demo values
    const query = decoded.role === "doctor" ? { doctor: userId } : { patient: userId };
    const appt = await Appointment.findOne(query)
      .populate("patient", "name")
      .populate("doctor", "name");

    const doctorName = appt?.doctor?.name || "Dr. Sarah Jenkins";
    const patientName = appt?.patient?.name || "Michael Johnson";
    const apptType = appt?.type || "Infusion Therapy";
    const apptTime = appt?.time || "10:00 AM";

    let payload = {
      title: "Upcoming Appointment in 24 Hours",
      body: `Reminder: You have a ${apptType} appointment with ${doctorName} tomorrow at ${apptTime}. Click to view details.`,
      url: "/appointments",
      tag: "test-appt-24h",
      data: { appointmentId: appt?._id?.toString() || "demo" },
    };

    if (reminderType === "1h") {
      payload = {
        title: "Appointment Starting in 1 Hour ⏰",
        body: `Your ${apptType} appointment with ${doctorName} begins in 1 hour at ${apptTime}. Please be prepared.`,
        url: "/appointments",
        tag: "test-appt-1h",
        data: { appointmentId: appt?._id?.toString() || "demo" },
      };
    }

    const result = await sendPushNotificationToUser(userId, payload);

    if (result.sentCount === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No push subscription found on this device. Please click 'Enable Notifications' first.",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Sent test ${reminderType === "1h" ? "1-Hour" : "24-Hour"} appointment notification!`,
      result,
    });
  } catch (err: any) {
    console.error("[Test Appointment Push Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger appointment push test" },
      { status: 500 }
    );
  }
}
