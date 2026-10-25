import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/gcs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("filename") || "attachment";
    const objectKey = searchParams.get("key");

    // Clean filename for Content-Disposition header
    const cleanFileName = fileName.replace(/[/\\?%*:|"<>]/g, "_");

    // 1. Try reading directly from GCS bucket if objectKey is provided
    if (objectKey) {
      try {
        const gcsFile = bucket.file(objectKey);
        const [exists] = await gcsFile.exists();
        if (exists) {
          const [metadata] = await gcsFile.getMetadata();
          const contentType = metadata.contentType || "application/octet-stream";
          const [fileBuffer] = await gcsFile.download();

          return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${cleanFileName}"`,
              "Content-Length": fileBuffer.length.toString(),
            },
          });
        }
      } catch (gcsErr) {
        console.warn("[DOWNLOAD ROUTE] Direct GCS read failed, falling back to URL fetch:", gcsErr);
      }
    }

    // 2. Fall back to fetching fileUrl if provided
    if (fileUrl) {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch file: ${res.statusText}` },
          { status: res.status }
        );
      }

      const contentType = res.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await res.arrayBuffer();

      return new NextResponse(new Uint8Array(arrayBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${cleanFileName}"`,
          "Content-Length": arrayBuffer.byteLength.toString(),
        },
      });
    }

    return NextResponse.json({ error: "Missing file url or object key" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[DOWNLOAD ROUTE ERROR]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
