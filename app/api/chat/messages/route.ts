import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { sendPushNotificationToUser } from "@/lib/pushNotifications";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
    const myId = decoded.id;

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
    const myId = decoded.id;

    // Verify sender is not blocked
    const senderUser = await User.findById(myId).select("role isBlocked blockedReason");
    if (senderUser?.isBlocked) {
      return NextResponse.json(
        { error: "Forbidden: Your account has been suspended from using chat.", blocked: true, reason: senderUser.blockedReason },
        { status: 403 }
      );
    }

    const { receiverId, message, type, fileName, fileUrl, fileType, objectKey, fileSize, mimeType, referredDoctor } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    // Verify receiver is not admin if sender is patient (staff panel coming soon, admin chat greyed out)
    const receiverUser = await User.findById(receiverId).select("role name");
    if (senderUser?.role === "patient" && receiverUser?.role === "admin") {
      return NextResponse.json(
        { error: "Hospital Staff Panel is under development. Direct messaging with administration is currently disabled. Please chat directly with Dr. Amit Gupta." },
        { status: 403 }
      );
    }

    const formattedTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newMsg = await Message.create({
      sender: myId,
      receiver: receiverId,
      message,
      type: type || "text",
      referredDoctor: type === "doctor_referral" && referredDoctor ? referredDoctor : null,
      fileName,
      fileUrl,
      fileType,
      objectKey,
      fileSize,
      mimeType,
      time: formattedTime,
    });

    // Send Web Push notification to receiver if subscribed
    try {
      const senderUser = await User.findById(myId).select("name");
      const senderName = senderUser?.name || "Apex Onco Care";
      let previewText = message || "";
      if (type === "image") previewText = "📷 Sent an image";
      else if (type === "video") previewText = "🎥 Sent a video";
      else if (type === "audio") previewText = "🎤 Sent an audio message";
      else if (type === "document") previewText = `📄 Sent a file: ${fileName || "Document"}`;
      else if (type === "appointment") previewText = `🗓️ ${message || "Scheduled an appointment"}`;
      else if (type === "doctor_referral") previewText = `👨‍⚕️ Referred Doctor: ${referredDoctor?.name || "Specialist Oncologist"}`;

      sendPushNotificationToUser(receiverId, {
        title: senderName,
        body: previewText.length > 120 ? previewText.slice(0, 117) + "..." : previewText,
        url: `/chat?userId=${myId}`,
        tag: `chat-${myId}`,
        data: { senderId: myId, messageId: newMsg._id.toString() },
      }).catch((pushErr) => console.error("[WebPush Chat Trigger] Error:", pushErr));
    } catch (pushErr) {
      console.error("[WebPush Chat Trigger] Failed to send push:", pushErr);
    }

    return NextResponse.json({ message: newMsg }, { status: 201 });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error", stack: error?.stack }, { status: 500 });
  }
}
