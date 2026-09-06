import { Router, type IRouter, type Request, type Response } from "express";
import mongoose from "mongoose";
import { User, type SecureDocsRole } from "../models/User";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { auditMiddleware } from "../middlewares/audit";

const router: IRouter = Router();

const fallbackUsers: any[] = [
  {
    _id: "usr_001",
    userId: "admin_test_001",
    email: "admin@securedocs.gov.in",
    name: "System Administrator",
    role: "Admin",
    policeStationId: "HQ-CENTRAL",
    isActive: true,
    createdAt: new Date("2026-08-01T00:00:00Z"),
  },
  {
    _id: "usr_002",
    userId: "officer_002",
    email: "raj.patel@police.gov.in",
    name: "Inspector Raj Patel",
    role: "Officer",
    policeStationId: "PS-CENTRAL-01",
    isActive: true,
    createdAt: new Date("2026-08-15T00:00:00Z"),
  },
  {
    _id: "usr_003",
    userId: "legal_003",
    email: "priya.nair@prosecution.gov.in",
    name: "Adv. Priya Nair",
    role: "Legal Reviewer",
    policeStationId: "LEGAL-CELL",
    isActive: true,
    createdAt: new Date("2026-08-20T00:00:00Z"),
  },
];

/**
 * GET /api/users/me
 * Get current authenticated user profile.
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

/**
 * GET /api/users
 * List users (Admin only).
 */
router.get(
  "/",
  requireAuth,
  requireRole("Admin"),
  auditMiddleware("USERS_LIST_VIEWED"),
  async (_req: Request, res: Response) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        res.json({ data: fallbackUsers, total: fallbackUsers.length });
        return;
      }

      const users = await User.find().select("-__v").sort({ createdAt: -1 }).lean();
      res.json({ data: users, total: users.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users." });
    }
  }
);

/**
 * PATCH /api/users/:id/role
 * Update user role (Admin only).
 */
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("Admin"),
  auditMiddleware("USER_ROLE_CHANGED"),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const validRoles: SecureDocsRole[] = ["Admin", "Officer", "Legal Reviewer", "Clerk", "Auditor"];

      if (!role || !validRoles.includes(role)) {
        res.status(400).json({ error: `Valid role required: ${validRoles.join(", ")}` });
        return;
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-__v");

      if (!updated) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      res.json({ user: updated });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user role." });
    }
  }
);

export default router;
