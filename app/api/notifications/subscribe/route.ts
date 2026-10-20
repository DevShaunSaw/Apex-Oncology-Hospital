import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

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
    ) as { id: string };
    const userId = decoded.id;

    const body = await req.json();
    const { subscription, deviceType, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    // Upsert subscription based on endpoint
    const updated = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        deviceType: deviceType || "desktop-browser",
        userAgent: userAgent || req.headers.get("user-agent") || "unknown",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription registered successfully",
      subscriptionId: updated._id,
    });
  } catch (err: any) {
    console.error("[Push Subscribe POST Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register subscription" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
    ) as { id: string };
    const userId = decoded.id;

    const count = await PushSubscription.countDocuments({ user: userId });

    return NextResponse.json({
      success: true,
      hasActiveSubscription: count > 0,
      deviceCount: count,
    });
  } catch (err: any) {
    console.error("[Push Subscribe GET Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check subscription" },
      { status: 500 }
    );
  }
}
