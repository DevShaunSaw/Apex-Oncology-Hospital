import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function seedAdminUser() {
    await connectToDatabase();

    const email = "shaunakprashant@gmail.com";
    const hashedPassword = await bcrypt.hash("Shaunak@123", 10);

    let adminUser = await User.findOne({ email });
    if (adminUser) {
        adminUser.role = "admin";
        adminUser.password = hashedPassword;
        adminUser.name = "Shaunak Sawant";
        await adminUser.save();
    } else {
        adminUser = await User.create({
            name: "Shaunak Sawant",
            email,
            phone: "9920004333",
            password: hashedPassword,
            role: "admin",
        });
    }

    const userObj = adminUser.toObject();
    delete userObj.password;

    return {
        success: true,
        message: "Admin account seeded successfully.",
        user: userObj,
    };
}

export async function POST() {
    try {
        const result = await seedAdminUser();
        return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
        console.error("[SEED ADMIN]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to seed admin." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const result = await seedAdminUser();
        return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
        console.error("[SEED ADMIN GET]", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to seed admin." },
            { status: 500 }
        );
    }
}
