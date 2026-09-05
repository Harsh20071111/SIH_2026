import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { logger } from "./logger";

let bucket: any = null;

/**
 * Initialize Firebase Admin SDK for Storage.
 *
 * Supports three credential modes:
 * 1. FIREBASE_SERVICE_ACCOUNT_PATH env var (path to JSON file)
 * 2. GOOGLE_APPLICATION_CREDENTIALS env var (standard GCP approach)
 * 3. Default credentials (GCE, Cloud Run, etc.)
 *
 * For local development without Firebase, operations will gracefully
 * fall back to logging warnings instead of crashing.
 */
export function initFirebase(): void {
  try {
    const storageBucket = process.env["FIREBASE_STORAGE_BUCKET"];
    const serviceAccountPath = process.env["FIREBASE_SERVICE_ACCOUNT_PATH"];

    if (!storageBucket) {
      logger.warn(
        "FIREBASE_STORAGE_BUCKET not set — file storage operations will use local fallback"
      );
      return;
    }

    const appConfig: any = {
      storageBucket,
    };

    if (serviceAccountPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(serviceAccountPath);
      // @ts-ignore
      appConfig.credential = admin.credential.cert(serviceAccount);
    }

    // @ts-ignore
    if (!admin.apps.length) {
      admin.initializeApp(appConfig);
    }

    bucket = getStorage().bucket();
    logger.info({ bucket: storageBucket }, "Firebase Storage initialized");
  } catch (err) {
    logger.warn({ err }, "Firebase Storage initialization failed — using local fallback");
  }
}

/**
 * Upload a file buffer to Firebase Storage.
 * Returns the storage path (not a public URL).
 */
export async function uploadToFirebase(
  buffer: Buffer,
  storagePath: string,
  mimeType: string
): Promise<string> {
  if (!bucket) {
    // Local fallback: store to a local uploads directory
    const fs = await import("fs/promises");
    const path = await import("path");
    const localDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(localDir, { recursive: true });
    const localPath = path.join(localDir, storagePath.replace(/\//g, "_"));
    await fs.writeFile(localPath, buffer);
    logger.info({ localPath }, "File saved locally (Firebase not configured)");
    return `local://${localPath}`;
  }

  const file = bucket.file(storagePath);
  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  logger.info({ storagePath }, "File uploaded to Firebase Storage");
  return storagePath;
}

/**
 * Download a file from Firebase Storage as a Buffer.
 */
export async function downloadFromFirebase(storagePath: string): Promise<Buffer> {
  if (!bucket) {
    // Local fallback
    if (storagePath.startsWith("local://")) {
      const fs = await import("fs/promises");
      const localPath = storagePath.replace("local://", "");
      return fs.readFile(localPath);
    }
    throw new Error("Firebase Storage not configured and file is not local");
  }

  const file = bucket.file(storagePath);
  const [contents] = await file.download();
  return contents;
}

/**
 * Generate a signed download URL (valid for 1 hour).
 */
export async function getSignedUrl(storagePath: string): Promise<string> {
  if (!bucket) {
    if (storagePath.startsWith("local://")) {
      // For local dev, return a placeholder
      return `/api/documents/local-download?path=${encodeURIComponent(storagePath)}`;
    }
    throw new Error("Firebase Storage not configured");
  }

  const file = bucket.file(storagePath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
}
