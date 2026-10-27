import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// POST /api/auth/reset-password
// Test-mode password reset verified via matching email and phone number
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, phone, newPassword } = body;

    if (!email || !phone || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, registered phone number, and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found matching this email address." },
        { status: 404 }
      );
    }

    // Clean phone numbers: remove all non-digit characters for resilient matching
    const cleanEnteredPhone = phone.toString().replace(/\D/g, "");
    const cleanStoredPhone = (user.phone || "").toString().replace(/\D/g, "");

    if (!cleanStoredPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "No phone number is on file for this account. Please contact hospital administrator.",
        },
        { status: 400 }
      );
    }

    // Flexible match: exact digits match OR last 10 digits match (handling country code / leading 0s)
    const isExactMatch = cleanEnteredPhone === cleanStoredPhone;
    const is10DigitMatch =
      cleanEnteredPhone.length >= 10 &&
      cleanStoredPhone.length >= 10 &&
      cleanEnteredPhone.slice(-10) === cleanStoredPhone.slice(-10);

    if (!isExactMatch && !is10DigitMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "The phone number entered does not match the registered phone for this account.",
        },
        { status: 400 }
      );
    }

    // Hash the new password and persist
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Password has been successfully updated for ${user.name || user.email}. You can now sign in with your new password.`,
      email: user.email,
      role: user.role,
    });
  } catch (err: any) {
    console.error("[RESET-PASSWORD]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
