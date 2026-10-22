import { Storage, StorageOptions } from "@google-cloud/storage";

function getFormattedPrivateKey(): string | undefined {
  let key = process.env.GCP_PRIVATE_KEY;
  if (!key) return undefined;
  key = key.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

const privateKey = getFormattedPrivateKey();
const clientEmail = process.env.GCP_CLIENT_EMAIL?.trim();

const storageOptions: StorageOptions = {
  projectId: process.env.GCP_PROJECT_ID || "apex-512206",
};

// Use explicit credentials if provided (e.g. Local development)
// Otherwise fallback to ambient Cloud Run ADC (Production)
if (clientEmail && privateKey && privateKey.includes("BEGIN PRIVATE KEY")) {
  storageOptions.credentials = {
    client_email: clientEmail,
    private_key: privateKey,
  };
}

export const storage = new Storage(storageOptions);

export const BUCKET_NAME = process.env.GCP_BUCKET_NAME || "apex-chat-bucket";
export const bucket = storage.bucket(BUCKET_NAME);

console.log("[GCS INIT]", {
  projectId: storageOptions.projectId,
  bucket: BUCKET_NAME,
  usingExplicitCredentials: !!storageOptions.credentials,
  hasClientEmail: !!process.env.GCP_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.GCP_PRIVATE_KEY,
});

console.log("[GCS CONFIG]", {
  projectId: process.env.GCP_PROJECT_ID,
  bucket: BUCKET_NAME,
  hasClientEmail: !!process.env.GCP_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.GCP_PRIVATE_KEY,
});

// ==========================================
// File Validation Rules
// ==========================================

export const ALLOWED_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
  video: ["mp4", "webm", "mov", "m4v"],
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
  video: 60 * 1024 * 1024, // 60 MB
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
    category = "image";
  } else if (ALLOWED_EXTENSIONS.video.includes(ext) || mimeType.startsWith("video/")) {
    category = "video";
  } else if (
    ALLOWED_EXTENSIONS.document.includes(ext) ||
    mimeType === "application/pdf"
  ) {
    category = "document";
  }

  if (!category) {
    return {
      valid: false,
      error:
        "Unsupported file format. Only images, short videos, PDFs, and documents are permitted.",
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
 * Uploads a chat attachment directly to Google Cloud Storage using explicit streams.
 */
export async function uploadChatAttachmentToGCS(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  senderId?: string
) {
  const timestamp = Date.now();

  const cleanName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const objectKey = `chat-attachments/${senderId || "general"
    }/${timestamp}_${cleanName}`;

  const gcsFile = bucket.file(objectKey);

  console.log("[GCS UPLOAD] Starting upload");
  console.log("[GCS UPLOAD] Object:", objectKey);
  console.log("[GCS UPLOAD] Size:", buffer.length);
  console.log("[GCS UPLOAD] MIME:", mimeType);

  try {
    await gcsFile.save(buffer, {
      resumable: false,

      metadata: {
        contentType: mimeType,

        metadata: {
          originalName: fileName,
          uploadedBy: senderId || "unknown",
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    console.log("[GCS UPLOAD] Upload SUCCESS:", objectKey);
  } catch (error) {
    console.error("[GCS UPLOAD] Upload FAILED:", error);
    throw error;
  }

  // Generate signed URL
  let fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${objectKey}`;

  try {
    console.log("[GCS UPLOAD] Generating signed URL...");

    const [signedUrl] = await gcsFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    fileUrl = signedUrl;

    console.log("[GCS UPLOAD] Signed URL generated successfully");
  } catch (signErr) {
    console.warn(
      "[GCS UPLOAD] Signed URL generation failed. Using standard URL:",
      signErr
    );
  }

  return {
    fileUrl,
    objectKey,
    fileName,
    fileSize: buffer.length,
    mimeType,
  };
}