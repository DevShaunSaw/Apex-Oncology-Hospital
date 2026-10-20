import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendPushNotificationToUser } from "@/lib/pushNotifications";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string };
    const userId = decoded.id;

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const result = await sendPushNotificationToUser(userId, {
      title: bodyData.title || "Apex Oncology Notifications",
      body:
        bodyData.body ||
        "Push notifications are actively connected to your device! You will receive timely appointment & message updates.",
      url: bodyData.url || "/dashboard",
      tag: "test-notification",
    });

    if (result.sentCount === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No active push subscription found for your account on this device. Please enable notifications first.",
        sentCount: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test push notification sent successfully!",
      result,
    });
  } catch (err: any) {
    console.error("[Push Test Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send test push" },
      { status: 500 }
    );
  }
}
