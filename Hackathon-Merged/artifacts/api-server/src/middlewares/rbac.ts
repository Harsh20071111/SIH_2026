import type { Request, Response, NextFunction } from "express";
import type { OfficerRank } from "../models/User";

/**
 * RBAC middleware factory.
 * Returns a middleware that checks if the authenticated user's role
 * is in the list of allowed roles.
 *
 * Must be used AFTER requireAuth middleware.
 *
 * Usage:
 *   router.get("/admin-only", requireAuth, requireRole("Admin"), handler);
 *   router.get("/mixed", requireAuth, requireRole("Admin", "Auditor"), handler);
 */
export function requireRole(...allowedRoles: OfficerRank[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const userRole = req.user.role as OfficerRank;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: "Access denied. You do not have permission to perform this action.",
        requiredRoles: allowedRoles,
        currentRole: userRole,
      });
      return;
    }

    next();
  };
}
