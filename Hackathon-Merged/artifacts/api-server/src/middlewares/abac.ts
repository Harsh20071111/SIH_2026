import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "./auth";
import { FIR } from "../models/FIR";
import { createAuditEvent } from "../lib/audit";

interface PolicyResult {
  allowed: boolean;
  reason: string;
}

function evaluatePolicy(user: AuthUser, fir: any, action: string): PolicyResult {
  const { role, policeStationId, districtCode, userId } = user;

  // 1. Admin has supervisory override across all cases and stations
  if (role === "Admin") {
    return { allowed: true, reason: "" };
  }

  // 2. Auditor has read-only access for compliance inspection
  if (role === "Auditor") {
    if (action === "view") return { allowed: true, reason: "" };
    return { allowed: false, reason: "AUDITOR_READ_ONLY_ACCESS" };
  }

  // 3. Legal Reviewer can review submitted or approved FIRs
  if (role === "Legal Reviewer") {
    if (action === "view") return { allowed: true, reason: "" };
    return { allowed: false, reason: "LEGAL_REVIEWER_CANNOT_MODIFY_FIR" };
  }

  // 4. Officer Attribute checks
  if (role === "Officer") {
    // Drafter can view and edit while in Draft status
    const isDrafter = fir.draftedBy === userId;
    const isAssignedIO = fir.assignedIOId === userId;
    const isSameStation = fir.policeStationId === policeStationId;

    if (action === "view") {
      if (isDrafter || isAssignedIO || isSameStation) {
        return { allowed: true, reason: "" };
      }
      return { allowed: false, reason: "OFFICER_JURISDICTION_OR_ASSIGNMENT_MISMATCH" };
    }

    if (action === "edit") {
      if (fir.isLocked) {
        return { allowed: false, reason: "FIR_LOCKED_CANNOT_EDIT" };
      }
      if (fir.status === "Draft" && isDrafter) {
        return { allowed: true, reason: "" };
      }
      if (fir.status === "UnderInvestigation" && isAssignedIO) {
        return { allowed: true, reason: "" };
      }
      return { allowed: false, reason: "OFFICER_NOT_AUTHORIZED_TO_EDIT_STAGE" };
    }

    if (action === "upload") {
      if (isAssignedIO || isDrafter || isSameStation) {
        return { allowed: true, reason: "" };
      }
      return { allowed: false, reason: "OFFICER_CANNOT_ATTACH_EVIDENCE_OUTSIDE_JURISDICTION" };
    }

    if (action === "approve" || action === "assign" || action === "transfer") {
      return { allowed: false, reason: "REQUIRES_ADMINISTRATIVE_SUPERVISION" };
    }
  }

  // 5. Clerk
  if (role === "Clerk") {
    if (action === "view" && fir.policeStationId === policeStationId) {
      return { allowed: true, reason: "" };
    }
    return { allowed: false, reason: "CLERK_ACCESS_RESTRICTED" };
  }

  return { allowed: false, reason: "UNRECOGNIZED_POLICY_ROLE" };
}

/**
 * ABAC Policy: Verifies the requesting user can perform an action on a specific FIR
 * based on role, assigned officer, jurisdiction station, and case lifecycle status.
 */
export function requireFIRAccess(action: "view" | "edit" | "upload" | "approve" | "assign" | "transfer") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const rawId = req.params.id || req.params.firId;
    const firIdentifier = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!firIdentifier) {
      res.status(400).json({ error: "FIR identifier is required." });
      return;
    }

    const fir = await FIR.findOne({
      $or: [
        { firNumber: firIdentifier },
        { _id: typeof firIdentifier === "string" && firIdentifier.match(/^[0-9a-fA-F]{24}$/) ? firIdentifier : null },
      ],
    });

    if (!fir) {
      res.status(404).json({ error: "FIR not found." });
      return;
    }

    const policy = evaluatePolicy(user, fir, action);

    if (!policy.allowed) {
      await createAuditEvent({
        action: `UNAUTHORIZED_${action.toUpperCase()}`,
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        firId: fir.firNumber,
        caseId: fir.caseId || "",
        result: "Denied",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          reason: policy.reason,
          userStation: user.policeStationId,
          firStation: fir.policeStationId,
          firStatus: fir.status,
        },
        isUnauthorized: true,
        denialReason: policy.reason,
      });

      res.status(403).json({
        error: "Access denied by ABAC policy.",
        reason: policy.reason,
      });
      return;
    }

    // Attach verified FIR to request for downstream handler
    (req as any).fir = fir;
    next();
  };
}
