import { Router, type IRouter, type Request, type Response } from "express";
import { Case } from "../models/Case";
import { requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";

const router: IRouter = Router();

/**
 * GET /api/cases
 * List all cases (role-filtered).
 */
router.get("/cases", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, risk, priority, type, officer, search, page, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (risk) filter.risk = risk;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (officer) filter.assignedOfficer = officer;

    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      filter.$or = [
        { caseId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { assignedOfficer: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit || "20"), 10)));

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Case.countDocuments(filter),
    ]);

    res.json({
      data: cases,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases." });
  }
});

/**
 * POST /api/cases
 * Create a new case.
 */
router.post("/cases", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      title,
      type,
      description,
      department,
      assignedOfficer,
      priority,
      startDate,
      confidentiality,
    } = req.body;

    if (!caseId || !title || !type || !department || !assignedOfficer) {
      res.status(400).json({
        error: "caseId, title, type, department, and assignedOfficer are required.",
      });
      return;
    }

    // Check for duplicate case ID
    const existing = await Case.findOne({ caseId });
    if (existing) {
      res.status(409).json({ error: "A case with this ID already exists." });
      return;
    }

    const newCase = await Case.create({
      caseId,
      title,
      type,
      description: description || "",
      department,
      assignedOfficer,
      priority: priority || "Medium",
      status: "Active",
      risk: "Low",
      confidentiality: confidentiality || "Confidential",
      startDate: startDate ? new Date(startDate) : new Date(),
      createdBy: req.user!.name,
    });

    await createAuditEvent({
      action: "CASE_CREATED",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: newCase.caseId,
      result: "Success",
      ipAddress: req.ip || "",
      metadata: {
        title: newCase.title,
        type: newCase.type,
        department: newCase.department,
        assignedOfficer: newCase.assignedOfficer,
        priority: newCase.priority,
        confidentiality: newCase.confidentiality,
      },
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: "Failed to create case." });
  }
});

/**
 * GET /api/cases/:id
 * Get a single case by caseId.
 */
router.get("/cases/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const caseRecord = await Case.findOne({ caseId: req.params.id }).lean();

    if (!caseRecord) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    await createAuditEvent({
      action: "CASE_VIEWED",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: caseRecord.caseId,
      result: "Success",
    });

    res.json(caseRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case." });
  }
});

/**
 * PATCH /api/cases/:id
 * Update a case.
 */
router.patch("/cases/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, status, risk, priority, description, assignedOfficer, confidentiality } = req.body;

    const updateFields: Record<string, unknown> = {};
    if (title !== undefined) updateFields.title = title;
    if (status !== undefined) updateFields.status = status;
    if (risk !== undefined) updateFields.risk = risk;
    if (priority !== undefined) updateFields.priority = priority;
    if (description !== undefined) updateFields.description = description;
    if (assignedOfficer !== undefined) updateFields.assignedOfficer = assignedOfficer;
    if (confidentiality !== undefined) updateFields.confidentiality = confidentiality;

    const caseRecord = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!caseRecord) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    await createAuditEvent({
      action: "CASE_UPDATED",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      caseId: caseRecord.caseId,
      result: "Success",
      metadata: { updatedFields: Object.keys(updateFields) },
    });

    res.json(caseRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to update case." });
  }
});

export default router;
