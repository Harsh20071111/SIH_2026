import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/User";

/**
 * Normalize role aliases to primary system roles.
 */
export function normalizeRole(role?: string): string {
  if (!role) return "Officer";
  const r = role.trim().toLowerCase();
  if (r === "admin" || r === "administrator") return "Admin";
  if (r === "legal reviewer" || r === "reviewer" || r === "legal_reviewer") return "Legal Reviewer";
  if (r === "auditor") return "Auditor";
  if (r === "clerk") return "Clerk";
  if (
    r === "officer" ||
    r === "dutyofficer" ||
    r === "duty officer" ||
    r === "io" ||
    r === "sho" ||
    r === "sp" ||
    r === "forensicexpert" ||
    r === "forensic expert" ||
    r === "investigator"
  ) {
    return "Officer";
  }
  return role;
}

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
export function requireRole(...allowedRoles: (UserRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const rawUserRole = req.user.role || "";
    const userRoleNorm = normalizeRole(rawUserRole);
    const allowedNorm = allowedRoles.map((r) => normalizeRole(r));

    // Admin / Administrator has access to all protected resources
    const isSuperAdmin = userRoleNorm === "Admin";
    const isAuthorized =
      isSuperAdmin ||
      allowedRoles.includes(rawUserRole as UserRole) ||
      allowedNorm.includes(userRoleNorm);

    if (!isAuthorized) {
      res.status(403).json({
        error: "Access denied. You do not have permission to perform this action.",
        requiredRoles: allowedRoles,
        currentRole: rawUserRole,
      });
      return;
    }

    next();
  };
}
