import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { createAuditEvent } from "../lib/audit";

const router: IRouter = Router();

/**
 * GET /api/users
 * List all users (admin only).
 */
router.get(
  "/users",
  requireAuth,
  requireRole("Admin"),
  async (_req: Request, res: Response) => {
    try {
      const users = await User.find()
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .lean();

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users." });
    }
  }
);

/**
 * POST /api/users
 * Create a new user (admin only). Password is hashed with bcrypt.
 */
router.post(
  "/users",
  requireAuth,
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { email, name, role, department, password, employeeId } = req.body;

      if (!email || !name || !role || !password || !employeeId) {
        res.status(400).json({
          error: "email, name, role, password, and employeeId are required.",
        });
        return;
      }

      // Check for existing user
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { employeeId }],
      });

      if (existing) {
        res.status(409).json({ error: "A user with this email or employee ID already exists." });
        return;
      }

      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase().trim(),
        name,
        role,
        department: department || "General",
        passwordHash,
        employeeId,
        isActive: true,
      });

      await createAuditEvent({
        action: "USER_CREATED",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        result: "Success",
        metadata: {
          createdUserId: user._id.toString(),
          createdUserEmail: user.email,
          createdUserRole: user.role,
        },
      });

      res.status(201).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to create user." });
    }
  }
);

/**
 * PATCH /api/users/:id
 * Update a user (admin only). Can update role, department, isActive, name.
 * Cannot update password through this endpoint.
 */
router.patch(
  "/users/:id",
  requireAuth,
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, role, department, isActive } = req.body;

      const updateFields: Record<string, unknown> = {};
      if (name !== undefined) updateFields.name = name;
      if (role !== undefined) updateFields.role = role;
      if (department !== undefined) updateFields.department = department;
      if (isActive !== undefined) updateFields.isActive = isActive;

      const user = await User.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      }).select("-passwordHash");

      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      const action = isActive === false ? "USER_DEACTIVATED" : "USER_UPDATED";

      await createAuditEvent({
        action,
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        result: "Success",
        metadata: {
          targetUserId: user._id.toString(),
          targetUserEmail: user.email,
          updatedFields: Object.keys(updateFields),
        },
      });

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to update user." });
    }
  }
);

export default router;
