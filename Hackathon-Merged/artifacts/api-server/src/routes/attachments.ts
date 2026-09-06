import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { Attachment } from "../models/Attachment";
import { requireAuth } from "../middlewares/auth";
import { requireFIRAccess } from "../middlewares/abac";
import { auditMiddleware } from "../middlewares/audit";

const router: IRouter = Router();

/**
 * POST /api/attachments/:firId
 * Record attachment / evidence metadata linked to a FIR or Case.
 */
router.post(
  "/:firId",
  requireAuth,
  requireFIRAccess("upload"),
  auditMiddleware("EVIDENCE_UPLOADED"),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const fir = (req as any).fir;

      const {
        type,
        fileName,
        originalName,
        mimeType,
        size,
        storagePath,
        appwriteFileId,
        isSensitive,
        sha256Hash,
      } = req.body;

      const attachment = await Attachment.create({
        attachmentId: crypto.randomUUID(),
        firId: (fir._id as any).toString(),
        firNumber: fir.firNumber,
        caseId: fir.caseId || undefined,
        type: type || "Evidence_Photo",
        fileName: fileName || "evidence_" + Date.now(),
        originalName: originalName || fileName,
        mimeType: mimeType || "application/octet-stream",
        size: size || 0,
        storagePath: storagePath || `appwrite/buckets/evidence/${fileName}`,
        appwriteFileId: appwriteFileId || null,
        sha256Hash: sha256Hash || crypto.createHash("sha256").update(fileName || "").digest("hex"),
        isSensitive: Boolean(isSensitive),
        uploadedBy: user.userId,
        uploadedByRole: user.role,
        accessibleToRoles: ["Admin", "Officer", "Legal Reviewer", "Auditor"],
        watermarkApplied: false,
      });

      res.status(201).json({ attachment });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error uploading attachment" });
    }
  }
);

/**
 * GET /api/attachments/:firId
 * List all evidence / attachments linked to a FIR.
 */
router.get(
  "/:firId",
  requireAuth,
  requireFIRAccess("view"),
  auditMiddleware("EVIDENCE_LIST_VIEWED"),
  async (req: Request, res: Response) => {
    try {
      const fir = (req as any).fir;
      const attachments = await Attachment.find({ firNumber: fir.firNumber }).sort({ createdAt: -1 });
      res.json({ attachments });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error fetching attachments" });
    }
  }
);

/**
 * GET /api/attachments/:firId/:attachmentId
 * View and log download of attachment metadata.
 */
router.get(
  "/:firId/:attachmentId",
  requireAuth,
  requireFIRAccess("view"),
  auditMiddleware("EVIDENCE_DOWNLOADED"),
  async (req: Request, res: Response) => {
    try {
      const { attachmentId } = req.params;
      const attachment = await Attachment.findOne({ attachmentId });

      if (!attachment) {
        res.status(404).json({ error: "Attachment not found." });
        return;
      }

      attachment.downloadCount = (attachment.downloadCount || 0) + 1;
      await attachment.save();

      res.json({
        attachment,
        storagePath: attachment.storagePath,
        appwriteFileId: attachment.appwriteFileId,
        watermarked: attachment.watermarkApplied,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error retrieving attachment" });
    }
  }
);

export default router;
