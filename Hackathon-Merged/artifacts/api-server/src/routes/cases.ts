import { Router, type IRouter, type Request, type Response } from "express";
import mongoose from "mongoose";
import { Case, type ICase } from "../models/Case";
import { Document } from "../models/Document";

const router: IRouter = Router();

// In-memory fallback store used ONLY if MongoDB Atlas is temporarily disconnected/auth-failed
interface FallbackCase {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  caseType: string;
  status: "Open" | "Under Investigation" | "Pending Review" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  createdBy: string | null;
  assignedOfficer: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const fallbackCases: FallbackCase[] = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    caseId: "CASE-2026-001",
    title: "Theft Investigation",
    description: "Investigation related to reported theft and collection of supporting evidence.",
    caseType: "Theft",
    status: "Open",
    priority: "High",
    createdBy: "user_appwrite_admin",
    assignedOfficer: "user_appwrite_officer_a",
    createdAt: new Date("2026-09-01T08:45:00Z"),
    updatedAt: new Date("2026-09-01T08:45:00Z"),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    caseId: "CASE-2026-002",
    title: "Financial Fraud Inquiry",
    description: "Analysis of unauthorized transactions and account manipulation.",
    caseType: "Fraud",
    status: "Under Investigation",
    priority: "High",
    createdBy: "user_appwrite_admin",
    assignedOfficer: "user_appwrite_officer_b",
    createdAt: new Date("2026-09-02T10:15:00Z"),
    updatedAt: new Date("2026-09-02T10:15:00Z"),
  },
];

const VALID_STATUSES = ["Open", "Under Investigation", "Pending Review", "Closed"] as const;
const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

async function findCaseByIdentifier(identifier: string) {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const doc = await Case.findById(identifier);
      if (doc) return doc;
    }
    return await Case.findOne({ caseId: identifier });
  }

  // Fallback in-memory lookup
  return (
    fallbackCases.find((c) => c._id === identifier || c.caseId.toLowerCase() === identifier.toLowerCase()) || null
  );
}

// POST /api/cases - Create a new case
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      title,
      description,
      caseType,
      status,
      priority,
      createdBy,
      assignedOfficer,
    } = req.body;

    if (!caseId || !title) {
      return res.status(400).json({
        success: false,
        message: "caseId and title are required fields",
      });
    }

    const trimmedCaseId = String(caseId).trim();
    const trimmedTitle = String(title).trim();

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `${status} is not a valid status`,
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `${priority} is not a valid priority`,
      });
    }

    if (isDbConnected()) {
      const existing = await Case.findOne({ caseId: trimmedCaseId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Case with caseId '${caseId}' already exists`,
        });
      }

      const newCase = new Case({
        caseId: trimmedCaseId,
        title: trimmedTitle,
        description: description || "",
        caseType: caseType || "General",
        status: status || "Open",
        priority: priority || "Medium",
        createdBy: createdBy || null,
        assignedOfficer: assignedOfficer || null,
      });

      const saved = await newCase.save();

      return res.status(201).json({
        success: true,
        message: "Case created successfully",
        data: saved,
      });
    }

    // In-memory fallback
    const exists = fallbackCases.some((c) => c.caseId.toLowerCase() === trimmedCaseId.toLowerCase());
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Case with caseId '${caseId}' already exists`,
      });
    }

    const newCase: FallbackCase = {
      _id: new mongoose.Types.ObjectId().toString(),
      caseId: trimmedCaseId,
      title: trimmedTitle,
      description: description || "",
      caseType: caseType || "General",
      status: status || "Open",
      priority: priority || "Medium",
      createdBy: createdBy || null,
      assignedOfficer: assignedOfficer || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fallbackCases.unshift(newCase);

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// GET /api/cases - Return all cases (with search and filtering)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, priority, caseType, search } = req.query;

    if (isDbConnected()) {
      const filter: Record<string, unknown> = {};

      if (status) {
        filter.status = status;
      }
      if (priority) {
        filter.priority = priority;
      }
      if (caseType) {
        filter.caseType = caseType;
      }
      if (search) {
        const searchRegex = new RegExp(String(search).trim(), "i");
        filter.$or = [
          { caseId: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { caseType: searchRegex },
        ];
      }

      const cases = await Case.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: cases,
      });
    }

    // In-memory fallback
    let list = [...fallbackCases];
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (priority) {
      list = list.filter((c) => c.priority === priority);
    }
    if (caseType) {
      list = list.filter((c) => c.caseType === caseType);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (c) =>
          c.caseId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.caseType.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// GET /api/cases/:id/documents - Return all documents belonging to a case
router.get("/:id/documents", async (req: Request, res: Response) => {
  try {
    const caseDoc = await findCaseByIdentifier(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (isDbConnected()) {
      const documents = await Document.find({ caseId: caseDoc.caseId }).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        data: documents,
      });
    }

    // Fallback document lookup
    const { fallbackDocuments } = await import("./documents");
    const docs = fallbackDocuments.filter(
      (d) => d.caseId.toLowerCase() === caseDoc.caseId.toLowerCase()
    );

    return res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// GET /api/cases/:id - Return one case
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const caseDoc = await findCaseByIdentifier(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseDoc,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// PUT /api/cases/:id - Update case information
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const caseDoc = await findCaseByIdentifier(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const { status, priority } = req.body;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `${status} is not a valid status`,
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `${priority} is not a valid priority`,
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "caseType",
      "status",
      "priority",
      "assignedOfficer",
    ] as const;

    if (isDbConnected() && typeof (caseDoc as ICase).save === "function") {
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          (caseDoc as Record<string, unknown>)[key] = req.body[key];
        }
      }

      const updated = await (caseDoc as ICase).save();

      return res.status(200).json({
        success: true,
        message: "Case updated successfully",
        data: updated,
      });
    }

    // In-memory update
    const memCase = caseDoc as FallbackCase;
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        (memCase as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }
    memCase.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: memCase,
    });
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

// DELETE /api/cases/:id - Delete a case
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const caseDoc = await findCaseByIdentifier(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (isDbConnected()) {
      await Case.deleteOne({ _id: (caseDoc as ICase)._id });
    } else {
      const idx = fallbackCases.findIndex(
        (c) => c._id === (caseDoc as FallbackCase)._id || c.caseId === (caseDoc as FallbackCase).caseId
      );
      if (idx >= 0) fallbackCases.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
});

export default router;
