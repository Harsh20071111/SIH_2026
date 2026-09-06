import { Router, type IRouter, type Request, type Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { auditMiddleware } from "../middlewares/audit";

const router: IRouter = Router();

const fallbackReviews: any[] = [
  {
    _id: "rev_001",
    documentId: "DOC-2026-001",
    documentName: "FIR_2026_001.pdf",
    caseId: "CASE-2026-001",
    priority: "High",
    status: "Pending",
    comments: "Urgent evidentiary verification required before chargesheet submission.",
    assignedTo: "Legal Reviewer Desk",
    createdAt: new Date("2026-09-02T10:30:00Z"),
  },
  {
    _id: "rev_002",
    documentId: "DOC-2026-002",
    documentName: "Evidence_Record_01.pdf",
    caseId: "CASE-2026-001",
    priority: "Medium",
    status: "In Review",
    comments: "Forensic chain-of-custody stamp verification in progress.",
    assignedTo: "Officer Vikram Rao",
    createdAt: new Date("2026-09-03T12:00:00Z"),
  },
];

/**
 * GET /api/reviews
 * List review queue items with filtering.
 */
router.get(
  "/",
  requireAuth,
  auditMiddleware("REVIEWS_LIST_VIEWED"),
  async (req: Request, res: Response) => {
    try {
      const { status, caseId, priority } = req.query;

      if (mongoose.connection.readyState !== 1) {
        let list = [...fallbackReviews];
        if (status) list = list.filter((r) => r.status === status);
        if (caseId) list = list.filter((r) => r.caseId === caseId);
        if (priority) list = list.filter((r) => r.priority === priority);
        res.json({ data: list, total: list.length });
        return;
      }

      const filter: Record<string, any> = {};
      if (status) filter.status = status;
      if (caseId) filter.caseId = caseId;
      if (priority) filter.priority = priority;

      const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
      res.json({ data: reviews, total: reviews.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch review queue." });
    }
  }
);

/**
 * POST /api/reviews
 * Create a new document review entry.
 */
router.post(
  "/",
  requireAuth,
  auditMiddleware("REVIEW_CREATED"),
  async (req: Request, res: Response) => {
    try {
      const { documentId, documentName, caseId, priority, comments } = req.body;

      if (!documentId || !caseId) {
        res.status(400).json({ error: "documentId and caseId are required." });
        return;
      }

      const review = await Review.create({
        documentId,
        documentName: documentName || "Document " + documentId,
        caseId,
        priority: priority || "Medium",
        comments: comments || "",
        status: "Pending",
      });

      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({ error: "Failed to create review item." });
    }
  }
);

/**
 * PATCH /api/reviews/:id
 * Update review status, comments, or resolution.
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole("Admin", "Legal Reviewer", "Officer"),
  auditMiddleware("REVIEW_UPDATED"),
  async (req: Request, res: Response) => {
    try {
      const { status, comments } = req.body;
      const user = req.user!;

      const updateData: Record<string, any> = {};
      if (status) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      updateData.reviewedBy = user.name;
      updateData.reviewedAt = new Date();

      const review = await Review.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!review) {
        res.status(404).json({ error: "Review item not found." });
        return;
      }

      res.json(review);
    } catch (err) {
      res.status(500).json({ error: "Failed to update review item." });
    }
  }
);

export default router;
