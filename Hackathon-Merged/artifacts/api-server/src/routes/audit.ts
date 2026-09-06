import { Router, type IRouter, type Request, type Response } from "express";
import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { verifyAuditChain, getInMemoryAuditLogs } from "../lib/audit";

const router: IRouter = Router();

/**
 * GET /api/audit
 * List audit logs with optional filtering (Admin and Auditor only).
 */
router.get(
  "/",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (req: Request, res: Response) => {
    try {
      const { action, userId, caseId, firId, documentId, from, to, page, limit } = req.query;

      const filter: Record<string, unknown> = {};
      if (action) filter.action = action;
      if (userId) filter.userId = userId;
      if (caseId) filter.caseId = caseId;
      if (firId) filter.firId = firId;
      if (documentId) filter.documentId = documentId;

      if (from || to) {
        const dateFilter: Record<string, Date> = {};
        if (from) dateFilter.$gte = new Date(String(from));
        if (to) dateFilter.$lte = new Date(String(to));
        filter.timestamp = dateFilter;
      }

      const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
      const pageSize = Math.min(200, Math.max(1, parseInt(String(limit || "50"), 10)));

      if (mongoose.connection.readyState !== 1) {
        const memoryLogs = getInMemoryAuditLogs().slice().reverse();
        res.json({
          data: memoryLogs,
          total: memoryLogs.length,
          page: 1,
          totalPages: 1,
        });
        return;
      }

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
 * Cryptographically verify the SHA-256 hash continuity of the audit trail.
 */
router.get(
  "/verify-chain",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (_req: Request, res: Response) => {
    try {
      const result = await verifyAuditChain();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to verify audit chain integrity." });
    }
  }
);

export default router;
