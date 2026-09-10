import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import multer from "multer";
import { SecureDocument } from "../models/Document";
import { DocumentVersion } from "../models/DocumentVersion";
import { Case } from "../models/Case";
import { Review } from "../models/Review";
import { requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { getClientIp } from "../lib/ip";
import { uploadToFirebase, downloadFromFirebase, getSignedUrl } from "../lib/firebase";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Multer: store in memory for SHA-256 hashing before Firebase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

/**
 * Generate a unique document ID.
 */
function generateDocId(): string {
  const num = Math.floor(260000 + Math.random() * 900);
  return `SD-${num}`;
}

/**
 * GET /api/documents/local-download
 * Serve locally-stored files (fallback when Firebase is not configured).
 * This route MUST be defined before any :id param routes.
 */
router.get("/documents/local-download", requireAuth, async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath || !filePath.startsWith("local://")) {
      res.status(400).json({ error: "Invalid local file path." });
      return;
    }

    const fs = await import("fs/promises");
    const path = await import("path");
    const localPath = filePath.replace("local://", "");

    // Security: ensure the path is strictly within the uploads directory (not just a prefix match)
    const uploadsDir = path.join(process.cwd(), "uploads");
    const resolved = path.resolve(localPath);
    if (!resolved.startsWith(uploadsDir + path.sep) && resolved !== uploadsDir) {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    const buffer = await fs.readFile(resolved);
    const filename = path.basename(resolved);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(buffer);
  } catch (err) {
    res.status(404).json({ error: "File not found locally." });
  }
});

/**
 * GET /api/documents
 * List all documents with filtering.
 */
router.get("/documents", requireAuth, async (req: Request, res: Response) => {
  try {
    const { caseId, documentType, status, integrity, confidentiality, uploadedBy, search, page, limit } =
      req.query;

    const filter: Record<string, unknown> = {};
    if (caseId) filter.caseId = caseId;
    if (documentType) filter.documentType = documentType;
    if (status) filter.status = status;
    if (integrity) filter.integrity = integrity;
    if (confidentiality) filter.confidentiality = confidentiality;
    if (uploadedBy) filter.uploadedBy = uploadedBy;

    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      filter.$or = [
        { documentName: searchRegex },
        { documentId: searchRegex },
        { caseId: searchRegex },
        { uploadedBy: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit || "20"), 10)));

    const [documents, total] = await Promise.all([
      SecureDocument.find(filter)
        .sort({ uploadDate: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      SecureDocument.countDocuments(filter),
    ]);

    res.json({ data: documents, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents." });
  }
});

/**
 * POST /api/documents
 * Upload a document with multipart/form-data.
 * Flow: Multer → SHA-256 → Firebase Storage → MongoDB metadata → Audit event
 */
router.post(
  "/documents",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided." });
        return;
      }

      const { caseId, documentType, description, confidentiality, documentName } = req.body;

      if (!caseId || !documentType) {
        res.status(400).json({ error: "caseId and documentType are required." });
        return;
      }

      // Compute SHA-256 hash of the file buffer using Node.js crypto
      const fileHash = crypto
        .createHash("sha256")
        .update(req.file.buffer)
        .digest("hex");

      const docId = generateDocId();
      const safeFilename = `${docId}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `documents/${caseId}/${safeFilename}`;

      // Upload to Firebase Storage
      const firebasePath = await uploadToFirebase(
        req.file.buffer,
        storagePath,
        req.file.mimetype
      );

      // Create document metadata in MongoDB
      const doc = await SecureDocument.create({
        documentId: docId,
        documentName: documentName || req.file.originalname,
        caseId,
        documentType,
        description: description || "",
        firebaseStoragePath: firebasePath,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        hash: fileHash,
        version: 1,
        status: "Pending Review",
        integrity: "Verified",
        confidentiality: confidentiality || "Confidential",
        uploadedBy: req.user?.name || req.user?.email || "Officer",
        uploadDate: new Date(),
        lastModified: new Date(),
        lastAccessedBy: req.user?.name || req.user?.email || "Officer",
        lastAccessed: new Date(),
      });

      // Create version 1 record
      await DocumentVersion.create({
        documentId: docId,
        version: 1,
        hash: fileHash,
        firebaseStoragePath: firebasePath,
        uploadedBy: req.user?.name || req.user?.email || "Officer",
        changeDescription: "Initial upload",
        size: req.file.size,
      });

      // Increment case document count (fire-and-forget — non-critical)
      Case.findOneAndUpdate({ caseId }, { $inc: { documentsCount: 1 } }).catch(() => {});

      // Audit event — wrapped so a failure here does NOT roll back the successful upload
      try {
        await createAuditEvent({
          action: "DOCUMENT_UPLOADED",
          userId: req.user?.userId || "",
          userName: req.user?.name || req.user?.email || "Officer",
          userRole: req.user?.role || "Officer",
          caseId,
          documentId: docId,
          result: "Success",
          ipAddress: getClientIp(req),
          metadata: {
            documentName: doc.documentName,
            documentType,
            hash: fileHash,
            size: req.file.size,
          },
        });
      } catch (_) {}

      res.status(201).json(doc);
    } catch (err: any) {
      logger.error({ err }, "Failed to upload document");
      res.status(500).json({ error: err?.message || "Failed to upload document." });
    }
  }
);

/**
 * GET /api/documents/:id
 * Get document details.
 */
router.get("/documents/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const doc = await SecureDocument.findOne({ documentId: req.params.id }).lean();

    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    // Increment access count (fire-and-forget — non-critical)
    SecureDocument.updateOne(
      { documentId: req.params.id },
      {
        $inc: { totalAccesses: 1 },
        lastAccessedBy: req.user!.name,
        lastAccessed: new Date(),
      }
    ).catch(() => {});

    // Audit — non-critical, should not block or fail the response
    try {
      await createAuditEvent({
        action: "DOCUMENT_VIEWED",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId: doc.caseId,
        documentId: doc.documentId,
        result: "Success",
        ipAddress: getClientIp(req),
      });
    } catch (_) {}

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch document." });
  }
});

/**
 * GET /api/documents/:id/download
 * Get a signed download URL for the document.
 */
router.get("/documents/:id/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const doc = await SecureDocument.findOne({ documentId: req.params.id });

    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    const url = await getSignedUrl(doc.firebaseStoragePath);

    // Update access info — use updateOne to avoid save() race conditions
    SecureDocument.updateOne(
      { documentId: req.params.id },
      {
        $inc: { totalAccesses: 1 },
        lastAccessedBy: req.user!.name,
        lastAccessed: new Date(),
      }
    ).catch(() => {});

    // Audit — non-critical
    try {
      await createAuditEvent({
        action: "DOCUMENT_DOWNLOADED",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId: doc.caseId,
        documentId: doc.documentId,
        result: "Success",
        ipAddress: getClientIp(req),
      });
    } catch (_) {}

    let finalUrl = url;
    if (finalUrl.startsWith("/api/documents/local-download")) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        finalUrl = `${finalUrl}&token=${token}`;
      }
    }

    res.json({ downloadUrl: finalUrl, documentName: doc.documentName });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate download URL." });
  }
});

/**
 * GET /api/documents/:id/versions
 * Get version history for a document.
 */
router.get("/documents/:id/versions", requireAuth, async (req: Request, res: Response) => {
  try {
    const versions = await DocumentVersion.find({ documentId: req.params.id })
      .sort({ version: -1 })
      .lean();

    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch version history." });
  }
});

/**
 * POST /api/documents/:id/versions
 * Upload a new version for an existing document.
 */
router.post(
  "/documents/:id/versions",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided for new version." });
        return;
      }

      const doc = await SecureDocument.findOne({ documentId: req.params.id });
      if (!doc) {
        res.status(404).json({ error: "Document not found." });
        return;
      }

      const { changeDescription } = req.body;
      const newVersionNum = (doc.version || 1) + 1;

      // Compute SHA-256 for the new version buffer
      const fileHash = crypto
        .createHash("sha256")
        .update(req.file.buffer)
        .digest("hex");

      const safeFilename = `${doc.documentId}_v${newVersionNum}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `documents/${doc.caseId}/${safeFilename}`;

      const firebasePath = await uploadToFirebase(
        req.file.buffer,
        storagePath,
        req.file.mimetype
      );

      // Create new version history record
      const versionRecord = await DocumentVersion.create({
        documentId: doc.documentId,
        version: newVersionNum,
        hash: fileHash,
        firebaseStoragePath: firebasePath,
        uploadedBy: req.user!.name,
        changeDescription: changeDescription || `Updated to version ${newVersionNum}`,
        size: req.file.size,
      });

      // Update the main document record
      doc.version = newVersionNum;
      doc.hash = fileHash;
      doc.size = req.file.size;
      doc.mimeType = req.file.mimetype;
      doc.firebaseStoragePath = firebasePath;
      doc.originalFilename = req.file.originalname;
      doc.lastModified = new Date();
      doc.lastAccessedBy = req.user!.name;
      doc.lastAccessed = new Date();
      doc.status = "Pending Review";
      doc.integrity = "Verified";
      await doc.save();

      // Audit event
      try {
        await createAuditEvent({
          action: "DOCUMENT_UPDATED",
          userId: req.user!.userId,
          userName: req.user!.name,
          userRole: req.user!.role,
          caseId: doc.caseId,
          documentId: doc.documentId,
          result: "Success",
          ipAddress: getClientIp(req),
          metadata: {
            newVersion: newVersionNum,
            hash: fileHash,
            size: req.file.size,
            changeDescription: changeDescription || `Updated to version ${newVersionNum}`,
          },
        });
      } catch (_) {}

      res.status(201).json({
        document: doc,
        version: versionRecord,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload new document version." });
    }
  }
);

/**
 * POST /api/documents/:id/verify-integrity
 * Verify document integrity by comparing stored hash with recomputed SHA-256.
 */
router.post("/documents/:id/verify-integrity", requireAuth, async (req: Request, res: Response) => {
  try {
    const doc = await SecureDocument.findOne({ documentId: req.params.id });

    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    let currentHash: string;
    let verified: boolean;

    try {
      // Download from Firebase and recompute SHA-256
      const fileBuffer = await downloadFromFirebase(doc.firebaseStoragePath);
      currentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      verified = currentHash === doc.hash;
    } catch {
      // If download fails, mark as issue
      currentHash = "DOWNLOAD_FAILED";
      verified = false;
    }

    // Update integrity status — use updateOne to avoid unguarded save()
    try {
      await SecureDocument.updateOne(
        { documentId: req.params.id },
        { integrity: verified ? "Verified" : "Failed", lastModified: new Date() }
      );
    } catch (_) {}

    const auditAction = verified ? "INTEGRITY_VERIFIED" : "INTEGRITY_ISSUE_DETECTED";

    // Audit — non-critical
    try {
      await createAuditEvent({
        action: auditAction,
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId: doc.caseId,
        documentId: doc.documentId,
        result: verified ? "Verified" : "Issue Detected",
        ipAddress: getClientIp(req),
        metadata: {
          storedHash: doc.hash,
          currentHash,
          matched: verified,
        },
      });
    } catch (_) {}

    res.json({
      verified,
      documentId: doc.documentId,
      documentName: doc.documentName,
      storedHash: doc.hash,
      currentHash,
      verifiedBy: req.user!.name,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify integrity." });
  }
});

/**
 * PATCH /api/documents/:id
 * Update document status (Pending Review, Approved, Rejected, Flagged), comments, and reviewer.
 */
router.patch("/documents/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, comment, reviewer } = req.body;

    const validStatuses = ["Pending Review", "Approved", "Rejected", "Flagged", "Under Review", "Changes Requested"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    // Normalize status names for consistent database storage
    let normalizedStatus = status;
    if (status === "Changes Requested") normalizedStatus = "Flagged";
    if (status === "Pending") normalizedStatus = "Pending Review";

    const updateFields: Record<string, unknown> = {
      lastModified: new Date(),
    };
    if (normalizedStatus) updateFields.status = normalizedStatus;
    if (reviewer || req.user?.name) updateFields.lastAccessedBy = reviewer || req.user?.name;
    updateFields.lastAccessed = new Date();

    const doc = await SecureDocument.findOneAndUpdate(
      { $or: [{ documentId: req.params.id }, { _id: req.params.id }] },
      { $set: updateFields },
      { new: true }
    );

    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    // Mirror to Review collection
    const reviewStatusMap: Record<string, string> = {
      "Pending Review": "Pending",
      "Under Review": "In Review",
      "Approved": "Approved",
      "Rejected": "Rejected",
      "Flagged": "Flagged",
    };
    const reviewStatus = reviewStatusMap[normalizedStatus] || normalizedStatus;

    Review.findOneAndUpdate(
      { documentId: doc.documentId },
      {
        $set: {
          status: reviewStatus,
          comment: comment || "",
          reviewer: reviewer || req.user?.name || "Assigned Reviewer",
          reviewedDate: new Date(),
        },
      }
    ).catch(() => {});

    // Audit log
    const auditActionMap: Record<string, string> = {
      "Approved": "DOCUMENT_APPROVED",
      "Rejected": "DOCUMENT_REJECTED",
      "Flagged": "DOCUMENT_FLAGGED",
      "Pending Review": "DOCUMENT_STATUS_RESET",
    };
    const auditAction = auditActionMap[normalizedStatus] || "DOCUMENT_STATUS_UPDATED";

    try {
      await createAuditEvent({
        action: auditAction as any,
        userId: req.user?.userId || "",
        userName: reviewer || req.user?.name || req.user?.email || "Reviewer",
        userRole: req.user?.role || "Legal Reviewer",
        caseId: doc.caseId,
        documentId: doc.documentId,
        result: "Success",
        ipAddress: getClientIp(req),
        metadata: {
          previousStatus: doc.status,
          newStatus: normalizedStatus,
          comment: comment || "",
        },
      });
    } catch (_) {}

    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to update document status." });
  }
});

export default router;
