import { Router, type IRouter, type Request, type Response } from "express";
import { SecurityEvent } from "../models/SecurityEvent";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { getRiskSummary } from "../lib/security";

const router: IRouter = Router();

/**
 * GET /api/security/events
 * List security events with filtering.
 */
router.get(
  "/security/events",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (req: Request, res: Response) => {
    try {
      const { type, riskLevel, status, page, limit } = req.query;

      const filter: Record<string, unknown> = {};
      if (type) filter.type = type;
      if (riskLevel) filter.riskLevel = riskLevel;
      if (status) filter.status = status;

      const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(String(limit || "20"), 10)));

      const [events, total] = await Promise.all([
        SecurityEvent.find(filter)
          .sort({ timestamp: -1 })
          .skip((pageNum - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        SecurityEvent.countDocuments(filter),
      ]);

      res.json({ data: events, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch security events." });
    }
  }
);

/**
 * GET /api/security/events/:id
 * Get a single security event detail.
 */
router.get(
  "/security/events/:id",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (req: Request, res: Response) => {
    try {
      const event = await SecurityEvent.findById(req.params.id).lean();

      if (!event) {
        res.status(404).json({ error: "Security event not found." });
        return;
      }

      res.json(event);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch security event." });
    }
  }
);

/**
 * GET /api/security/risk
 * Get risk summary statistics.
 */
router.get(
  "/security/risk",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (_req: Request, res: Response) => {
    try {
      const summary = await getRiskSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch risk summary." });
    }
  }
);

/**
 * PATCH /api/security/events/:id
 * Update security event status (resolve, monitor).
 */
router.patch(
  "/security/events/:id",
  requireAuth,
  requireRole("Admin", "Auditor"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      if (!status || !["Open", "Monitoring", "Resolved"].includes(status)) {
        res.status(400).json({ error: "Valid status required." });
        return;
      }

      const event = await SecurityEvent.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!event) {
        res.status(404).json({ error: "Security event not found." });
        return;
      }

      res.json(event);
    } catch (err) {
      res.status(500).json({ error: "Failed to update security event." });
    }
  }
);

export default router;
