import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET() {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
      id: string;
      role: string;
    };

    const myId = decoded.id;

    // Fetch unique user IDs with whom we have exchanged messages
    const activeReceivers = await Message.distinct("receiver", { sender: myId });
    const activeSenders = await Message.distinct("sender", { receiver: myId });
    const uniqueIds = Array.from(new Set([...activeReceivers, ...activeSenders]));

    // Find profiles of these users
    const activeConversations = await User.find({ _id: { $in: uniqueIds } }).select("-password");

    return NextResponse.json({ conversations: activeConversations });
  } catch (error) {
    console.error("Conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
