import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import multer from "multer";
import { SecureDocument } from "../models/Document";
import { DocumentVersion } from "../models/DocumentVersion";
import { Case } from "../models/Case";
import { requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { uploadToFirebase, downloadFromFirebase, getSignedUrl } from "../lib/firebase";

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
        uploadedBy: req.user!.name,
        uploadDate: new Date(),
        lastModified: new Date(),
        lastAccessedBy: req.user!.name,
        lastAccessed: new Date(),
      });

      // Create version 1 record
      await DocumentVersion.create({
        documentId: docId,
        version: 1,
        hash: fileHash,
        firebaseStoragePath: firebasePath,
        uploadedBy: req.user!.name,
        changeDescription: "Initial upload",
        size: req.file.size,
      });

      // Increment case document count
      await Case.findOneAndUpdate({ caseId }, { $inc: { documentsCount: 1 } });

      // Audit event
      await createAuditEvent({
        action: "DOCUMENT_UPLOADED",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId,
        documentId: docId,
        result: "Success",
        ipAddress: req.ip || "",
        metadata: {
          documentName: doc.documentName,
          documentType,
          hash: fileHash,
          size: req.file.size,
        },
      });

      res.status(201).json(doc);
    } catch (err) {
      res.status(500).json({ error: "Failed to upload document." });
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

    // Increment access count
    await SecureDocument.updateOne(
      { documentId: req.params.id },
      {
        $inc: { totalAccesses: 1 },
        lastAccessedBy: req.user!.name,
        lastAccessed: new Date(),
      }
    );

    await createAuditEvent({
      action: "DOCUMENT_VIEWED",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: doc.caseId,
      documentId: doc.documentId,
      result: "Success",
    });

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

    // Update access info
    doc.totalAccesses += 1;
    doc.lastAccessedBy = req.user!.name;
    doc.lastAccessed = new Date();
    await doc.save();

    await createAuditEvent({
      action: "DOCUMENT_DOWNLOADED",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: doc.caseId,
      documentId: doc.documentId,
      result: "Success",
      ipAddress: req.ip || "",
    });

    res.json({ downloadUrl: url, documentName: doc.documentName });
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

    // Update integrity status
    doc.integrity = verified ? "Verified" : "Failed";
    doc.lastModified = new Date();
    await doc.save();

    const auditAction = verified ? "INTEGRITY_VERIFIED" : "INTEGRITY_ISSUE_DETECTED";
    await createAuditEvent({
      action: auditAction,
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: doc.caseId,
      documentId: doc.documentId,
      result: verified ? "Verified" : "Issue Detected",
      metadata: {
        storedHash: doc.hash,
        currentHash,
        matched: verified,
      },
    });

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

export default router;
