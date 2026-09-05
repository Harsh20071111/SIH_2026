import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "./auth";
import { FIR } from "../models/FIR";
import { createAuditEvent } from "../lib/audit";

/**
 * ABAC Policy: Verify the requesting user can access a specific FIR
 * based on their role, jurisdiction, and assignment status.
 */
export function requireFIRAccess(action: "view" | "edit" | "upload" | "approve" | "assign" | "transfer") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as AuthUser;
    const firId = req.params.id || req.params.firId;
    
    if (!firId) {
      res.status(400).json({ error: "FIR ID is required." });
      return;
    }
    
    const fir = await FIR.findOne({ firNumber: firId });
    
    if (!fir) {
      res.status(404).json({ error: "FIR not found." });
      return;
    }
    
    const policy = evaluatePolicy(user, fir, action);
    
    if (!policy.allowed) {
      // ── LOG UNAUTHORIZED ACCESS ATTEMPT ──
      await createAuditEvent({
        action: `UNAUTHORIZED_${action.toUpperCase()}`,
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        firId: fir.firNumber,
        result: "Denied",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          reason: policy.reason,
          userStation: user.policeStationId,
          firStation: fir.policeStationId,
        },
        isUnauthorized: true,
        denialReason: policy.reason,
      });
      
      res.status(403).json({
        error: "Access denied.",
        reason: policy.reason,
        redirectTo: "/403",
      });
      return;
    }
    
    // Attach FIR to request for downstream handlers
    (req as any).fir = fir;
    next();
  };
}

interface PolicyResult {
  allowed: boolean;
  reason: string;
  redactFields?: string[];  // Fields to redact from response
}

function evaluatePolicy(user: AuthUser, fir: any, action: string): PolicyResult {
  const { role, policeStationId, districtCode, userId } = user;
  
  switch (role) {
    case "DutyOfficer":
      if (action === "view") {
        if (fir.draftedBy.toString() !== userId) return { allowed: false, reason: "DUTY_OFFICER_NOT_DRAFTER" };
        return { allowed: true, reason: "" };
      }
      if (action === "edit") {
        if (fir.status !== "Draft" || fir.draftedBy.toString() !== userId) return { allowed: false, reason: "DUTY_OFFICER_CANNOT_EDIT_SUBMITTED" };
        return { allowed: true, reason: "" };
      }
      return { allowed: false, reason: "DUTY_OFFICER_ACTION_FORBIDDEN" };
    
    case "IO":
      if (!fir.assignedIOId || fir.assignedIOId.toString() !== userId) return { allowed: false, reason: "IO_NOT_ASSIGNED_TO_FIR" };
      if (fir.policeStationId !== policeStationId) return { allowed: false, reason: "IO_JURISDICTION_MISMATCH" };
      if (action === "view" || action === "edit" || action === "upload") return { allowed: true, reason: "" };
      return { allowed: false, reason: "IO_ACTION_FORBIDDEN" };
    
    case "SHO":
      if (fir.policeStationId !== policeStationId) return { allowed: false, reason: "SHO_JURISDICTION_MISMATCH" };
      if (["view", "approve", "assign"].includes(action)) return { allowed: true, reason: "" };
      if (action === "edit") return { allowed: false, reason: "SHO_CANNOT_DIRECTLY_EDIT" };
      return { allowed: false, reason: "SHO_ACTION_FORBIDDEN" };
    
    case "SP":
      if (fir.districtCode !== districtCode) return { allowed: false, reason: "SP_DISTRICT_MISMATCH" };
      if (action === "view" || action === "transfer") return { allowed: true, reason: "" };
      return { allowed: false, reason: "SP_READ_ONLY" };
    
    case "ForensicExpert":
      if (!user.forensicTokens?.includes(fir.firNumber)) return { allowed: false, reason: "FORENSIC_NO_TOKEN_FOR_FIR" };
      if (action === "upload" || action === "view") {
        return {
          allowed: true,
          reason: "",
          redactFields: ["victimDetails", "witnessDetails", "complainantDetails", "incidentDescription"],
        };
      }
      return { allowed: false, reason: "FORENSIC_UPLOAD_ONLY" };
    
    case "Magistrate":
      if (!["ChargeSheetApproved", "CourtReferred", "Closed"].includes(fir.status)) return { allowed: false, reason: "MAGISTRATE_FIR_NOT_FINALIZED" };
      if (action === "view") return { allowed: true, reason: "" };
      return { allowed: false, reason: "MAGISTRATE_READ_ONLY" };
    
    default:
      return { allowed: false, reason: "UNKNOWN_ROLE" };
  }
}
