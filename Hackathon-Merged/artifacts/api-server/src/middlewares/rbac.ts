import type { Request, Response, NextFunction } from "express";
import type { SecureDocsRole } from "../models/User";
import { createAuditEvent } from "../lib/audit";

export type Permission =
  | "cases.view"
  | "cases.create"
  | "cases.update"
  | "cases.delete"
  | "documents.view"
  | "documents.upload"
  | "documents.update"
  | "documents.delete"
  | "documents.review"
  | "audit.view"
  | "security.view"
  | "fir.view"
  | "fir.create"
  | "fir.edit"
  | "fir.approve"
  | "fir.assign"
  | "fir.transfer"
  | "evidence.view"
  | "evidence.upload"
  | "users.manage";

export const ROLE_PERMISSIONS: Record<SecureDocsRole, Permission[]> = {
  Admin: [
    "cases.view", "cases.create", "cases.update", "cases.delete",
    "documents.view", "documents.upload", "documents.update", "documents.delete", "documents.review",
    "audit.view", "security.view",
    "fir.view", "fir.create", "fir.edit", "fir.approve", "fir.assign", "fir.transfer",
    "evidence.view", "evidence.upload",
    "users.manage",
  ],
  Officer: [
    "cases.view", "cases.create", "cases.update",
    "documents.view", "documents.upload", "documents.update",
    "fir.view", "fir.create", "fir.edit",
    "evidence.view", "evidence.upload",
  ],
  "Legal Reviewer": [
    "cases.view",
    "documents.view", "documents.review",
    "fir.view",
    "evidence.view",
  ],
  Clerk: [
    "cases.view",
    "documents.view", "documents.upload",
    "fir.view",
  ],
  Auditor: [
    "cases.view",
    "documents.view",
    "audit.view", "security.view",
    "fir.view",
    "evidence.view",
  ],
};

/**
 * RBAC middleware: checks if the authenticated user has any of the required roles.
 */
export function requireRole(...allowedRoles: (SecureDocsRole | string)[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      await createAuditEvent({
        action: "ACCESS_DENIED_ROLE",
        userId: req.user.userId,
        userName: req.user.name,
        userRole: req.user.role,
        result: "Denied",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          path: req.originalUrl,
          method: req.method,
          requiredRoles: allowedRoles,
          userRole,
        },
        isUnauthorized: true,
        denialReason: `User role '${userRole}' does not meet required roles: ${allowedRoles.join(", ")}`,
      });

      res.status(403).json({
        error: "Access denied. You do not have the required role.",
        requiredRoles: allowedRoles,
        currentRole: userRole,
      });
      return;
    }

    next();
  };
}

/**
 * RBAC middleware: checks if the authenticated user's role has the required permission.
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      await createAuditEvent({
        action: "ACCESS_DENIED_PERMISSION",
        userId: req.user.userId,
        userName: req.user.name,
        userRole: req.user.role,
        result: "Denied",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          path: req.originalUrl,
          method: req.method,
          requiredPermissions,
          userRole: req.user.role,
        },
        isUnauthorized: true,
        denialReason: `Missing required permission(s): ${requiredPermissions.join(", ")}`,
      });

      res.status(403).json({
        error: "Access denied. Insufficient permissions.",
        requiredPermissions,
        currentRole: req.user.role,
      });
      return;
    }

    next();
  };
}
