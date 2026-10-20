import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
    try {
        await connectToDatabase();

        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return NextResponse.json({
                success: true,
                message: "Admin account already exists.",
                email: existingAdmin.email,
            });
        }

        // Create the admin user
        const hashedPassword = await bcrypt.hash("Shaunak@123", 10);
        const adminUser = await User.create({
            name: "Shaunak Sawant",
            email: "shaunakprashant@gmail.com",
            password: hashedPassword,
            role: "admin",
        });

        const userObj = adminUser.toObject();
        delete userObj.password;

        return NextResponse.json({
            success: true,
            message: "Admin account seeded successfully.",
            user: userObj,
        }, { status: 201 });
    } catch (err: any) {
        console.error("[SEED ADMIN]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to seed admin." },
            { status: 500 }
        );
    }
}
