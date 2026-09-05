import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireFIRAccess } from "../middlewares/abac";
import { auditMiddleware } from "../middlewares/audit";
import { Attachment } from "../models/Attachment";
import { AuthUser } from "../middlewares/auth";
import crypto from "crypto";

const router = Router();

// ── Upload Attachment ──
router.post(
  "/:firId",
  requireAuth,
  requireFIRAccess("upload"),
  auditMiddleware("EVIDENCE_UPLOADED"),
  async (req, res) => {
    try {
      const user = req.user as AuthUser;
      const fir = (req as any).fir;
      
      const { type, fileName, originalName, mimeType, size, storagePath, isSensitive, sha256Hash } = req.body;
      
      const attachment = await Attachment.create({
        attachmentId: crypto.randomUUID(),
        firId: fir._id,
        firNumber: fir.firNumber,
        type,
        fileName,
        originalName,
        mimeType,
        size,
        storagePath,
        sha256Hash,
        isSensitive: isSensitive || false,
        uploadedBy: user.userId,
        uploadedByRole: user.role,
        forensicToken: user.role === "ForensicExpert" ? fir.firNumber : null,
      });
      
      res.status(201).json({ attachment });
    } catch (error) {
      res.status(500).json({ error: "Error uploading attachment" });
    }
  }
);

// ── Download/View Attachment ──
router.get(
  "/:firId/:attachmentId",
  requireAuth,
  requireFIRAccess("view"),
  auditMiddleware("EVIDENCE_DOWNLOADED"),
  async (req, res) => {
    try {
      const user = req.user as AuthUser;
      const { attachmentId } = req.params;
      
      const attachment = await Attachment.findOne({ attachmentId });
      
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      
      // Update download count
      attachment.downloadCount += 1;
      await attachment.save();
      
      // Return presigned URL or attachment metadata (simulated)
      res.json({ 
        url: `https://storage.securegov.in/temp/${attachment.storagePath}`,
        watermarked: true // Signal to frontend that watermark is applied
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching attachment" });
    }
  }
);

export default router;
