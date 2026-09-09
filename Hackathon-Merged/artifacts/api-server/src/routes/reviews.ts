import { Router, type IRouter, type Request, type Response } from "express";
import { Review } from "../models/Review";
import { SecureDocument } from "../models/Document";
import { requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { getClientIp } from "../lib/ip";

const router: IRouter = Router();

/**
 * GET /api/reviews
 * List all reviews with filtering.
 */
router.get("/reviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, caseId, page, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (caseId) filter.caseId = caseId;

    const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit || "20"), 10)));

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ submittedDate: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({ data: reviews, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

/**
 * POST /api/reviews
 * Submit a document for review.
 */
router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const { documentId, caseId, documentName, priority } = req.body;

    if (!documentId || !caseId) {
      res.status(400).json({ error: "documentId and caseId are required." });
      return;
    }

    const review = await Review.create({
      documentId,
      caseId,
      documentName: documentName || documentId,
      submittedBy: req.user!.name,
      priority: priority || "Medium",
      status: "Pending",
      submittedDate: new Date(),
    });

    // Audit — non-critical
    try {
      await createAuditEvent({
        action: "REVIEW_SUBMITTED",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId,
        documentId,
        result: "Success",
        ipAddress: getClientIp(req),
      });
    } catch (_) {}

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review." });
  }
});

/**
 * PATCH /api/reviews/:id
 * Update review status (approve, reject, flag) with optional comment.
 */
router.patch("/reviews/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, comment } = req.body;

    if (!status || !["Approved", "Rejected", "Flagged"].includes(status)) {
      res.status(400).json({ error: "Valid status is required (Approved, Rejected, Flagged)." });
      return;
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        comment: comment || "",
        reviewer: req.user!.name,
        reviewedDate: new Date(),
      },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ error: "Review not found." });
      return;
    }

    // Mirror status onto the document (non-critical)
    SecureDocument.updateOne(
      { documentId: review.documentId },
      { status }
    ).catch(() => {});

    const actionMap: Record<string, string> = {
      Approved: "DOCUMENT_APPROVED",
      Rejected: "DOCUMENT_REJECTED",
      Flagged: "DOCUMENT_FLAGGED",
    };

    // Audit — non-critical
    try {
      await createAuditEvent({
        action: actionMap[status] as any,
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        caseId: review.caseId,
        documentId: review.documentId,
        result: "Success",
        ipAddress: getClientIp(req),
        metadata: { reviewStatus: status, comment },
      });
    } catch (_) {}

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to update review." });
  }
});

export default router;
