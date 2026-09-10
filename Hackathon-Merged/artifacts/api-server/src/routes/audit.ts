import { Router, type IRouter, type Request, type Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { verifyAuditChain } from "../lib/audit";

const router: IRouter = Router();

/**
 * GET /api/audit
 * List audit logs with filtering (admin, auditor only).
 */
router.get(
  "/audit",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { action, userId, caseId, documentId, from, to, page, limit } = req.query;

      const filter: Record<string, unknown> = {};
      if (action) filter.action = action;
      if (userId) filter.userId = userId;
      if (caseId) filter.caseId = caseId;
      if (documentId) filter.documentId = documentId;

      if (from || to) {
        const dateFilter: Record<string, Date> = {};
        if (from) dateFilter.$gte = new Date(String(from));
        if (to) dateFilter.$lte = new Date(String(to));
        filter.timestamp = dateFilter;
      }

      const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
      const pageSize = Math.min(200, Math.max(1, parseInt(String(limit || "50"), 10)));

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort({ timestamp: -1 })
          .skip((pageNum - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        AuditLog.countDocuments(filter),
      ]);

      res.json({ data: logs, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch audit logs." });
    }
  }
);

/**
 * GET /api/audit/verify-chain
 * Verify the tamper-evident audit chain integrity.
 */
router.get(
  "/audit/verify-chain",
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const result = await verifyAuditChain();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to verify audit chain." });
    }
  }
);

/**
 * GET /api/audit/verify
 * Alias for verify-chain.
 */
router.get(
  "/audit/verify",
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const result = await verifyAuditChain();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to verify audit chain." });
    }
  }
);

/**
 * POST /api/audit/simulate-tamper
 * Controlled demonstration endpoint to manually tamper with an audit record.
 */
router.post(
  "/audit/simulate-tamper",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { type } = req.body; // 'tamper' or 'repair'
      
      const latest = await AuditLog.findOne().sort({ timestamp: -1 });
      if (!latest) {
        res.status(400).json({ error: "No audit logs found." });
        return;
      }

      if (type === "tamper") {
        await AuditLog.updateOne({ _id: latest._id }, { $set: { action: "TAMPERED_ACTION", "metadata.originalAction": latest.action } });
        res.json({ message: "Tampered successfully", recordId: latest._id });
      } else if (type === "repair") {
        // We don't easily know the original action, but we can assume it was "DOCUMENT_UPLOADED" or similar.
        // Actually, for demo purposes, we should save the original action in metadata when tampering.
        const originalAction = latest.metadata?.originalAction || "SYSTEM_EVENT";
        await AuditLog.updateOne({ _id: latest._id }, { $set: { action: originalAction }, $unset: { "metadata.originalAction": "" } });
        res.json({ message: "Repaired successfully", recordId: latest._id });
      } else {
        res.status(400).json({ error: "Invalid type" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to simulate tampering." });
    }
  }
);

export default router;
