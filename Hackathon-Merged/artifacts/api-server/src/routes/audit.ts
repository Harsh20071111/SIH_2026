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
  requireRole("Admin", "Auditor"),
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
  requireRole("Admin", "Auditor"),
  async (_req: Request, res: Response) => {
    try {
      const result = await verifyAuditChain();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to verify audit chain." });
    }
  }
);

export default router;
