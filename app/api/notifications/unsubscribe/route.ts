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
    const { endpoint } = body;

    if (endpoint) {
      await PushSubscription.deleteOne({ endpoint, user: userId });
    } else {
      // Remove all subscriptions for current user
      await PushSubscription.deleteMany({ user: userId });
    }

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (err: any) {
    console.error("[Push Unsubscribe Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
