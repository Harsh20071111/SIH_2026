import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { FIR } from "../models/FIR";
import { requireAuth } from "../middlewares/auth";
import { requireRole, requirePermission } from "../middlewares/rbac";
import { requireFIRAccess } from "../middlewares/abac";
import { redactSensitiveFields } from "../middlewares/redact";
import { auditMiddleware } from "../middlewares/audit";

const router: IRouter = Router();

const fallbackFIRs: any[] = [
  {
    _id: "fir_fallback_001",
    firNumber: "FIR/BLR/KOR/2026/001847",
    firDate: new Date("2026-09-02T10:00:00Z"),
    caseId: "CASE-2026-001",
    crimeType: "Theft & Criminal Trespass",
    ipcSections: ["379", "451"],
    isSensitive: false,
    policeStationId: "PS-CENTRAL-01",
    status: "UnderInvestigation",
    priority: "High",
    draftedBy: "Officer Raj Patel",
    assignedIOId: "Officer Raj Patel",
    incidentDescription: "Theft of server hardware and backup drives from corporate premises.",
    incidentLocation: "Koramangala 4th Block",
    complainantDetails: { name: "Anil Kulkarni", phone: "9876543210" },
    contentHash: "c8e2b1f0987a6d5c4e3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d",
    version: 1,
    isLocked: false,
    createdAt: new Date("2026-09-02T10:00:00Z"),
    updatedAt: new Date("2026-09-02T10:00:00Z"),
  },
];

function generateFIRContentHash(data: any): string {
  const content = JSON.stringify({
    crimeType: data.crimeType,
    incidentDescription: data.incidentDescription,
    incidentDate: data.incidentDate,
    incidentLocation: data.incidentLocation,
    complainantDetails: data.complainantDetails,
    accusedDetails: data.accusedDetails,
  });
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * POST /api/fir
 * Draft new FIR. Logically connects to an existing Case if caseId is supplied.
 */
router.post(
  "/",
  requireAuth,
  requirePermission("fir.create"),
  auditMiddleware("FIR_DRAFTED"),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const count = mongoose.connection.readyState === 1 ? await FIR.countDocuments() : fallbackFIRs.length;
      const currentYear = new Date().getFullYear();
      const firNumber = req.body.firNumber || `FIR/BLR/${user.policeStationId || "KOR"}/${currentYear}/${String(count + 1).padStart(6, "0")}`;

      const contentHash = generateFIRContentHash(req.body);

      const firData = {
        _id: "fir_" + Date.now(),
        ...req.body,
        firNumber,
        status: "Draft",
        draftedBy: user.userId,
        policeStationId: user.policeStationId || "PS-CENTRAL-01",
        districtCode: user.districtCode || "DIST-01",
        stateCode: user.stateCode || "ST-01",
        contentHash,
        version: 1,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (mongoose.connection.readyState !== 1) {
        fallbackFIRs.unshift(firData);
        res.status(201).json({ fir: firData });
        return;
      }

      const newFIR = await FIR.create(firData);
      res.status(201).json({ fir: newFIR });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error drafting FIR" });
    }
  }
);

/**
 * GET /api/fir
 * List FIRs filtered by jurisdiction, caseId, or status.
 */
router.get(
  "/",
  requireAuth,
  auditMiddleware("FIR_LIST_VIEWED"),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { caseId, status, crimeType } = req.query;

      if (mongoose.connection.readyState !== 1) {
        let filtered = [...fallbackFIRs];
        if (caseId) filtered = filtered.filter((f) => f.caseId === caseId);
        if (status) filtered = filtered.filter((f) => f.status === status);
        if (crimeType) filtered = filtered.filter((f) => f.crimeType === crimeType);
        res.json({ firs: filtered, total: filtered.length });
        return;
      }

      const query: Record<string, any> = {};
      if (caseId) query.caseId = String(caseId);
      if (status) query.status = String(status);
      if (crimeType) query.crimeType = String(crimeType);

      if (user.role === "Officer") {
        query.$or = [
          { policeStationId: user.policeStationId },
          { draftedBy: user.userId },
          { assignedIOId: user.userId },
        ];
      } else if (user.role === "Clerk") {
        query.policeStationId = user.policeStationId;
      }

      const firs = await FIR.find(query).sort({ createdAt: -1 }).lean();
      res.json({ firs, total: firs.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error fetching FIR records" });
    }
  }
);

/**
 * GET /api/fir/:id
 * View FIR details. ABAC checked and statutory PII redacted.
 */
router.get(
  "/:id",
  requireAuth,
  requireFIRAccess("view"),
  redactSensitiveFields,
  auditMiddleware("FIR_VIEWED"),
  (req: Request, res: Response) => {
    // ABAC middleware verified access and attached FIR
    res.json({ fir: (req as any).fir });
  }
);

/**
 * PUT /api/fir/:id
 * Edit FIR. ABAC verified.
 */
router.put(
  "/:id",
  requireAuth,
  requireFIRAccess("edit"),
  auditMiddleware("FIR_EDITED"),
  async (req: Request, res: Response) => {
    try {
      const fir = (req as any).fir;
      Object.assign(fir, req.body);

      fir.contentHash = generateFIRContentHash(fir);
      fir.version = (fir.version || 1) + 1;
      fir.lastModifiedBy = req.user?.userId;

      await fir.save();
      res.json({ fir });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error updating FIR" });
    }
  }
);

/**
 * POST /api/fir/:id/assign-io
 * Assign Investigating Officer (Admin / SHO supervision).
 */
router.post(
  "/:id/assign-io",
  requireAuth,
  requireRole("Admin"),
  requireFIRAccess("assign"),
  auditMiddleware("IO_ASSIGNED"),
  async (req: Request, res: Response) => {
    try {
      const fir = (req as any).fir;
      const { ioId } = req.body;

      if (!ioId) {
        res.status(400).json({ error: "Investigating Officer (IO) ID is required." });
        return;
      }

      fir.assignedIOId = ioId;
      fir.status = "UnderInvestigation";
      await fir.save();

      res.json({ success: true, fir });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error assigning IO" });
    }
  }
);

/**
 * POST /api/fir/:id/approve-chargesheet
 * Approve Charge Sheet and lock the FIR record.
 */
router.post(
  "/:id/approve-chargesheet",
  requireAuth,
  requireRole("Admin"),
  requireFIRAccess("approve"),
  auditMiddleware("CHARGESHEET_APPROVED"),
  async (req: Request, res: Response) => {
    try {
      const fir = (req as any).fir;
      fir.status = "ChargeSheetApproved";
      fir.isLocked = true;
      await fir.save();

      res.json({ success: true, fir });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error approving charge sheet" });
    }
  }
);

/**
 * POST /api/fir/:id/transfer
 * Inter-station FIR transfer.
 */
router.post(
  "/:id/transfer",
  requireAuth,
  requireRole("Admin"),
  requireFIRAccess("transfer"),
  auditMiddleware("FIR_TRANSFERRED"),
  async (req: Request, res: Response) => {
    try {
      const fir = (req as any).fir;
      const { toStation, reason } = req.body;
      const user = req.user!;

      if (!toStation) {
        res.status(400).json({ error: "Destination station (toStation) is required." });
        return;
      }

      fir.transferHistory = fir.transferHistory || [];
      fir.transferHistory.push({
        fromStation: fir.policeStationId,
        toStation,
        transferredBy: user.userId,
        reason: reason || "Administrative Transfer",
        timestamp: new Date(),
      });

      fir.policeStationId = toStation;
      fir.status = "Transferred";
      await fir.save();

      res.json({ success: true, fir });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error transferring FIR" });
    }
  }
);

export default router;
