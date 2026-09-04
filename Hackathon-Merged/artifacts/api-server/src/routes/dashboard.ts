import { Router, type IRouter, type Request, type Response } from "express";
import { Case } from "../models/Case";
import { SecureDocument } from "../models/Document";
import { Review } from "../models/Review";
import { SecurityEvent } from "../models/SecurityEvent";
import { AuditLog } from "../models/AuditLog";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * GET /api/dashboard
 * Return aggregated dashboard metrics (role-aware).
 */
router.get("/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    const [
      totalCases,
      totalDocuments,
      pendingReviews,
      integrityIssues,
      suspiciousActivities,
      casesByStatus,
      recentActivity,
      securityAlerts,
    ] = await Promise.all([
      Case.countDocuments(),
      SecureDocument.countDocuments(),
      Review.countDocuments({ status: "Pending" }),
      SecureDocument.countDocuments({ integrity: { $ne: "Verified" } }),
      SecurityEvent.countDocuments({ status: "Open" }),
      Case.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
      SecurityEvent.find({ status: { $ne: "Resolved" } })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean(),
    ]);

    // Risk distribution
    const riskDistribution = await Case.aggregate([
      { $group: { _id: "$risk", count: { $sum: 1 } } },
    ]);

    // Document type distribution
    const documentTypes = await SecureDocument.aggregate([
      { $group: { _id: "$documentType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      stats: {
        totalCases,
        totalDocuments,
        pendingReviews,
        integrityIssues,
        suspiciousActivities,
      },
      casesByStatus,
      riskDistribution,
      documentTypes,
      recentActivity,
      securityAlerts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

export default router;
