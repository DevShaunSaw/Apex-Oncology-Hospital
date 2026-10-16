import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query: any = { _id: { $ne: decoded.id } };
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("assignedDoctor", "name specialty")
      .sort({ createdAt: -1 });

    const formatted = users.map((u: any) => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/users — update a user's details (e.g. doctor specialty, experience, availability)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    // Prevent password and role changes through this endpoint
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const obj = user.toObject();
    obj.id = obj._id.toString();

    return NextResponse.json({ success: true, user: obj });
  } catch (err: any) {
    console.error("[USERS PATCH]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error." },
      { status: 500 }
    );
  }
}

// DELETE /api/users — remove a user by id
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err: any) {
    console.error("[USERS DELETE]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error." },
      { status: 500 }
    );
  }
}

