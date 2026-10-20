import { Storage } from "@google-cloud/storage";

function getFormattedPrivateKey(): string | undefined {
  let key = process.env.GCP_PRIVATE_KEY;
  if (!key) return undefined;
  key = key.trim();
  // Strip outer quotes if present
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  // Convert escaped newlines into real newlines
  return key.replace(/\\n/g, "\n");
}

export const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: getFormattedPrivateKey(),
  },
});

export const BUCKET_NAME = process.env.GCP_BUCKET_NAME || "apex-chat-bucket";
export const bucket = storage.bucket(BUCKET_NAME);

// ==========================================
// File Validation Rules
// ==========================================

export const ALLOWED_EXTENSIONS = {
  // Images
  image: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
  // Short Videos
  video: ["mp4", "webm", "mov", "m4v"],
  // PDF & Documents
  document: [
    "pdf",
    "doc",
    "docx",
    "txt",
    "rtf",
    "csv",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ],
};

export const MAX_FILE_SIZES = {
  image: 25 * 1024 * 1024, // 25 MB
  video: 60 * 1024 * 1024, // 60 MB (short videos)
  document: 35 * 1024 * 1024, // 35 MB
};

export type FileCategory = "image" | "video" | "document";

export interface FileValidationResult {
  valid: boolean;
  category?: FileCategory;
  extension?: string;
  mimeType?: string;
  error?: string;
}

export function validateChatFile(
  fileName: string,
  mimeType: string,
  fileSize: number
): FileValidationResult {
  if (!fileName) {
    return { valid: false, error: "Missing file name" };
  }

  const parts = fileName.split(".");
  if (parts.length < 2) {
    return { valid: false, error: "File must have a valid extension" };
  }

  const ext = parts.pop()!.toLowerCase();

  let category: FileCategory | undefined;

  if (ALLOWED_EXTENSIONS.image.includes(ext) || mimeType.startsWith("image/")) {
    if (ALLOWED_EXTENSIONS.image.includes(ext)) {
      category = "image";
    }
  }

  if (ALLOWED_EXTENSIONS.video.includes(ext) || mimeType.startsWith("video/")) {
    if (ALLOWED_EXTENSIONS.video.includes(ext)) {
      category = "video";
    }
  }

  if (ALLOWED_EXTENSIONS.document.includes(ext) || mimeType === "application/pdf") {
    if (ALLOWED_EXTENSIONS.document.includes(ext)) {
      category = "document";
    }
  }

  if (!category) {
    return {
      valid: false,
      error:
        "Unsupported file format. Only image formats (JPG, PNG, WEBP, GIF, SVG), short video formats (MP4, WEBM, MOV), PDFs, and document formats (DOC, DOCX, TXT, CSV, XLS, PPT) are allowed.",
    };
  }

  const maxSize = MAX_FILE_SIZES[category];
  if (fileSize > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File is too large. Maximum size for ${category} files is ${maxMb}MB.`,
    };
  }

  return {
    valid: true,
    category,
    extension: ext,
    mimeType,
  };
}

/**
 * Uploads a chat attachment directly to Google Cloud Storage.
 * Generates a signed URL with 7 days validity for immediate viewing.
 */
export async function uploadChatAttachmentToGCS(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  senderId?: string
) {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const objectKey = `chat-attachments/${senderId || "general"}/${timestamp}_${cleanName}`;

  const gcsFile = bucket.file(objectKey);

  // Upload to GCS
  await gcsFile.save(buffer, {
    resumable: false,
    contentType: mimeType,
    metadata: {
      contentType: mimeType,
      metadata: {
        originalName: fileName,
        uploadedBy: senderId || "unknown",
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Generate 7-day signed read URL
  let fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${objectKey}`;
  try {
    const [signedUrl] = await gcsFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    fileUrl = signedUrl;
  } catch (signErr) {
    console.warn("[GCS] Signed URL generation fallback to public URL:", signErr);
  }

  return {
    fileUrl,
    objectKey,
    fileName,
    fileSize: buffer.length,
    mimeType,
  };
}