import { NextRequest, NextResponse } from "next/server";
import { checkAndSendAppointmentReminders } from "@/lib/pushNotifications";

export async function GET(req: NextRequest) {
  try {
    const result = await checkAndSendAppointmentReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: any) {
    console.error("[Appointment Reminders Cron Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process appointment reminders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
