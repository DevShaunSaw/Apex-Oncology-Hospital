import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // Explicitly drop index username_1 to clear legacy database unique constraints
    try {
      await mongoose.connection.collection("users").dropIndex("username_1");
      console.log("Dropped legacy username_1 unique index successfully.");
    } catch (err) {
      // Ignore if index doesn't exist
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      dob,
      gender,
      city,
      primaryConcern,
      preferredLanguage,
      healthHistory,
      role,
      specialty,
      experience,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "patient";

    let assignedDoc = null;
    if (userRole === "patient") {
      // Find a doctor to assign to this patient
      const doctor = await User.findOne({ role: "doctor" });
      if (doctor) {
        assignedDoc = doctor._id;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      dob,
      gender,
      city,
      primaryConcern,
      preferredLanguage,
      healthHistory,
      role: userRole,
      assignedDoctor: assignedDoc,
      specialty,
      experience,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ user: userObj }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
