import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  validateChatFile,
  uploadChatAttachmentToGCS,
  BUCKET_NAME,
} from "@/lib/gcs";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let userId = "anonymous";
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallback_secret"
        ) as { id: string };
        userId = decoded.id;
      } catch {
        // Fall back to anonymous
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Strict format and size validation:
    // Only allow image file formats, short video formats, PDF, and document formats
    const validation = validateChatFile(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.error ||
            "Unsupported file type. Only images, short videos, PDFs, and documents are permitted.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload file directly to GCP Cloud Storage Bucket
    try {
      // const gcpResult = await uploadChatAttachmentToGCS(
      //   buffer,
      //   file.name,
      //   file.type || "application/octet-stream",
      //   userId
      // );
      console.log("[UPLOAD TEST] File received successfully", {
        name: file.name,
        size: buffer.length,
        type: file.type,
      });

      return NextResponse.json({
        success: true,
        test: true,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type,
      });

      // const fileExtension = file.name.split(".").pop()?.toUpperCase() || "FILE";

      return NextResponse.json({
        // success: true,
        // fileUrl: gcpResult.fileUrl,
        // fileName: file.name,
        // fileType: fileExtension,
        // category: validation.category,
        // objectKey: gcpResult.objectKey,
        // fileSize: file.size,
        // mimeType: file.type,
        // storage: "gcp",
        // bucket: BUCKET_NAME,
      });
    } catch (gcpErr: unknown) {
      console.error("[GCP Storage Upload Error]:", gcpErr);
      const errObj = gcpErr as { code?: number; message?: string };
      const isPermissionDenied =
        errObj?.code === 403 ||
        errObj?.message?.includes("Permission 'storage.objects.create' denied");

      if (isPermissionDenied) {
        // Place the fallback definition here:
        const saEmail = process.env.GCP_CLIENT_EMAIL || "Cloud Run default service account";

        return NextResponse.json(
          {
            error: `Google Cloud Storage Permission Denied: The service account '${saEmail}' requires the 'Storage Object Admin' (or 'Storage Object Creator') role on bucket '${BUCKET_NAME}' in your Google Cloud Console.`,
            details: errObj?.message,
            gcpConfigured: true,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: `Google Cloud Storage upload failed: ${errObj?.message || "Unknown error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errObj = error as { message?: string };
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: errObj?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
