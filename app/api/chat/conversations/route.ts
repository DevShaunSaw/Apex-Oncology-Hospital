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
    const activeConversations = await User.find({ _id: { $in: uniqueIds } })
      .select("-password")
      .populate("assignedDoctor", "name specialty degree experience department position");

    // Special logic for patients:
    // When a patient logs in, they should see Dr. Amit Gupta (active) and the Admin staff account (greyed out),
    // plus any doctor they have chatted with (e.g. via referral/assignment).
    if (decoded.role === "patient") {
      // Find Dr. Amit Gupta
      const drAmitGupta = await User.findOne({
        $or: [
          { email: "amitgupta@gmail.com" },
          { name: { $regex: "Amit M. Gupta", $options: "i" } },
          { name: { $regex: "Amit Gupta", $options: "i" }, position: { $regex: "Head", $options: "i" } },
          { name: { $regex: "Amit Gupta", $options: "i" } },
        ],
        role: "doctor",
      }).select("-password");

      // Find Admin / Staff user
      const adminUser = await User.findOne({ role: "admin" }).select("-password");

      // Check current patient to see if an assignedDoctor exists
      const currentPatient = await User.findById(myId).populate("assignedDoctor", "name specialty degree experience department position");
      const assignedDoc = currentPatient?.assignedDoctor;

      const conversationMap = new Map<string, any>();

      // 1. Always place Dr. Amit Gupta first
      if (drAmitGupta) {
        const docObj = drAmitGupta.toObject();
        docObj.id = docObj._id.toString();
        conversationMap.set(docObj._id.toString(), docObj);
      }

      // 2. Add assigned doctor if different from Dr. Amit Gupta
      if (assignedDoc && (assignedDoc as any)._id) {
        const assignedObj = (assignedDoc as any).toObject ? (assignedDoc as any).toObject() : assignedDoc;
        const assignedId = (assignedObj._id || assignedObj.id).toString();
        if (!conversationMap.has(assignedId)) {
          assignedObj.id = assignedId;
          conversationMap.set(assignedId, assignedObj);
        }
      }

      // 3. Add any other existing chat partners (from previous referrals/conversations)
      for (const conv of activeConversations) {
        const id = conv._id.toString();
        if (!conversationMap.has(id)) {
          const convObj = conv.toObject();
          convObj.id = id;
          conversationMap.set(id, convObj);
        }
      }

      // 4. Add the Admin Staff Account (greyed out)
      if (adminUser) {
        const admObj = adminUser.toObject();
        const admId = admObj._id.toString();
        conversationMap.set(admId, {
          ...admObj,
          id: admId,
          name: admObj.name || "Admin Staff Desk",
          specialty: "Hospital Administration",
          isGreyedOut: true,
          isStaffAccount: true,
          statusText: "Staff Panel (Coming Soon)",
        });
      }

      const formatted = Array.from(conversationMap.values());
      return NextResponse.json({ conversations: formatted });
    }

    const formatted = activeConversations.map((c: any) => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("Conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
