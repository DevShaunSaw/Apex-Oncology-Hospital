import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role?: string };

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const all = searchParams.get("all");

    // If patient is fetching available contacts to chat with:
    // Only return Dr. Amit Gupta and the Admin staff account (marked as greyed out)
    if (decoded.role === "patient" && role === "doctor" && all !== "true") {
      const drAmit = await User.findOne({
        $or: [
          { email: "amitgupta@gmail.com" },
          { name: { $regex: "Amit M. Gupta", $options: "i" } },
          { name: { $regex: "Amit Gupta", $options: "i" } },
        ],
        role: "doctor",
      }).select("-password");

      const adminUser = await User.findOne({ role: "admin" }).select("-password");

      const list: any[] = [];
      if (drAmit) {
        const obj = drAmit.toObject();
        obj.id = obj._id.toString();
        list.push(obj);
      }
      if (adminUser) {
        const adm = adminUser.toObject();
        adm.id = adm._id.toString();
        adm.isGreyedOut = true;
        adm.isStaffAccount = true;
        adm.statusText = "Staff Panel (Coming Soon)";
        adm.specialty = "Hospital Administration";
        list.push(adm);
      }
      return NextResponse.json({ users: list });
    }

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

// POST /api/users — create a new doctor (admin management)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, department, position, degree, experience, yoe, specialty, available } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email is already registered." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "doctor",
      department: department || "Department of Oncology",
      position: position || "Specialist Consultant",
      degree: degree || "",
      experience: experience || "",
      yoe: yoe || "",
      specialty: specialty || department || "Department of Oncology",
      available: available !== false,
    });

    const obj = doctor.toObject();
    delete obj.password;
    obj.id = obj._id.toString();

    return NextResponse.json({ success: true, user: obj, message: "Doctor registered successfully." });
  } catch (err: any) {
    console.error("[USERS POST]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error." },
      { status: 500 }
    );
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

    if (updates.department && !updates.specialty) {
      updates.specialty = updates.department;
    }

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

