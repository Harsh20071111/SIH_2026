import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { requireFIRAccess } from "../middlewares/abac";
import { redactSensitiveFields } from "../middlewares/redact";
import { auditMiddleware } from "../middlewares/audit";
import { FIR } from "../models/FIR";
import { AuthUser } from "../middlewares/auth";

const router = Router();

// ── Draft FIR — Duty Officer only ──
router.post(
  "/",
  requireAuth,
  requireRole("DutyOfficer"),
  auditMiddleware("FIR_DRAFTED"),
  async (req, res) => {
    try {
      const user = req.user as AuthUser;
      const firData = {
        ...req.body,
        status: "Draft",
        draftedBy: user.userId,
        policeStationId: user.policeStationId,
        districtCode: user.districtCode,
        stateCode: user.stateCode,
        jurisdictionId: user.jurisdictionId,
        contentHash: "pending", // Generate real hash based on payload
      };
      
      const newFIR = await FIR.create(firData);
      res.status(201).json({ fir: newFIR });
    } catch (error) {
      res.status(500).json({ error: "Error drafting FIR" });
    }
  }
);

// ── View FIR — All authorized roles (ABAC enforced) ──
router.get(
  "/:id",
  requireAuth,
  requireFIRAccess("view"),
  redactSensitiveFields,
  auditMiddleware("FIR_VIEWED"),
  (req, res) => {
    // ABAC middleware attaches the FIR to the request
    res.json({ fir: (req as any).fir });
  }
);

// ── Edit FIR — IO only (ABAC checks assignment) ──
router.put(
  "/:id",
  requireAuth,
  requireFIRAccess("edit"), // IO and DutyOfficer can edit based on ABAC
  auditMiddleware("FIR_EDITED"),
  async (req, res) => {
    try {
      const fir = (req as any).fir;
      // Apply updates...
      Object.assign(fir, req.body);
      
      // Update hash and version...
      fir.version += 1;
      fir.lastModifiedBy = req.user?.userId;
      
      await fir.save();
      res.json({ fir });
    } catch (error) {
      res.status(500).json({ error: "Error updating FIR" });
    }
  }
);

// ── Assign IO — SHO only ──
router.post(
  "/:id/assign-io",
  requireAuth,
  requireRole("SHO"),
  requireFIRAccess("assign"),
  auditMiddleware("IO_ASSIGNED"),
  async (req, res) => {
    try {
      const fir = (req as any).fir;
      const { ioId } = req.body;
      
      if (!ioId) {
        return res.status(400).json({ error: "IO ID is required" });
      }
      
      fir.assignedIOId = ioId;
      fir.status = "UnderInvestigation";
      await fir.save();
      
      res.json({ success: true, fir });
    } catch (error) {
      res.status(500).json({ error: "Error assigning IO" });
    }
  }
);

// ── Approve Charge Sheet — SHO only ──
router.post(
  "/:id/approve-chargesheet",
  requireAuth,
  requireRole("SHO"),
  requireFIRAccess("approve"),
  auditMiddleware("CHARGESHEET_APPROVED"),
  async (req, res) => {
    try {
      const fir = (req as any).fir;
      fir.status = "ChargeSheetApproved";
      fir.isLocked = true;
      await fir.save();
      
      res.json({ success: true, fir });
    } catch (error) {
      res.status(500).json({ error: "Error approving charge sheet" });
    }
  }
);

// ── Inter-station Transfer — SP only ──
router.post(
  "/:id/transfer",
  requireAuth,
  requireRole("SP"),
  requireFIRAccess("transfer"),
  auditMiddleware("FIR_TRANSFERRED"),
  async (req, res) => {
    try {
      const fir = (req as any).fir;
      const { toStation, reason } = req.body;
      const user = req.user as AuthUser;
      
      fir.transferHistory.push({
        fromStation: fir.policeStationId,
        toStation,
        transferredBy: user.userId,
        reason,
        timestamp: new Date()
      });
      
      fir.policeStationId = toStation;
      fir.status = "Transferred";
      await fir.save();
      
      res.json({ success: true, fir });
    } catch (error) {
      res.status(500).json({ error: "Error transferring FIR" });
    }
  }
);

// ── List FIRs — Scoped by jurisdiction automatically ──
router.get(
  "/",
  requireAuth,
  auditMiddleware("FIR_LIST_VIEWED"),
  async (req, res) => {
    try {
      const user = req.user as AuthUser;
      let query: any = {};
      
      // Apply scoping based on role
      switch (user.role) {
        case "DutyOfficer":
          query.draftedBy = user.userId;
          break;
        case "IO":
          query.assignedIOId = user.userId;
          break;
        case "SHO":
          query.policeStationId = user.policeStationId;
          break;
        case "SP":
          query.districtCode = user.districtCode;
          break;
        case "ForensicExpert":
          query.firNumber = { $in: user.forensicTokens || [] };
          break;
        case "Magistrate":
          query.status = { $in: ["ChargeSheetApproved", "CourtReferred", "Closed"] };
          break;
      }
      
      const firs = await FIR.find(query);
      res.json({ firs });
    } catch (error) {
      res.status(500).json({ error: "Error fetching FIRs" });
    }
  }
);

export default router;
