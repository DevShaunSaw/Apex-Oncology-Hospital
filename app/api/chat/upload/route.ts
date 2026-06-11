import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique file name
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${timestamp}_${cleanName}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Save file locally using fs
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;
    const fileType = file.name.split(".").pop()?.toUpperCase() || "FILE";

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileType,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
