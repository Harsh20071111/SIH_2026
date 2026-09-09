import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { createAuditEvent, type AuditAction } from "../lib/audit";

const router: IRouter = Router();

/**
 * GET /api/users
 * List all users (admin only).
 */
router.get("/users", requireAuth, requireRole("Admin"), async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

/**
 * POST /api/users
 * Create a new user (admin only). Password is hashed with bcrypt.
 */
router.post("/users", requireAuth, requireRole("Admin"), async (req: Request, res: Response) => {
  try {
    const { email, name, department, employeeId, assignedCases } = req.body;
    let { role, password } = req.body;

    if (!email || !name || !role || !employeeId) {
      res.status(400).json({ error: "email, name, role, and employeeId are required." });
      return;
    }

    // Normalize role aliases
    if (role === "Administrator") role = "Admin";
    if (role === "Reviewer") role = "Legal Reviewer";

    if (!password || !password.trim()) {
      password = "SecureDocs@2026";
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { employeeId: employeeId.trim() }],
    });
    if (existing) {
      res.status(409).json({ error: "A user with this email or employee ID already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
      department: department || "General",
      passwordHash,
      employeeId: employeeId.trim(),
      assignedCases: Array.isArray(assignedCases) ? assignedCases : [],
      isActive: true,
    });

    // Audit — non-critical
    try {
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
    } catch (_) {}

    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
      assignedCases: user.assignedCases || [],
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create user." });
  }
});

/**
 * PATCH /api/users/:id
 * Update a user (admin only).
 */
router.patch("/users/:id", requireAuth, requireRole("Admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department, isActive, assignedCases, employeeId, email, password } = req.body;
    let { role } = req.body;

    const updateFields: Record<string, unknown> = {};
    if (name !== undefined) updateFields.name = name;
    if (role !== undefined) {
      if (role === "Administrator") role = "Admin";
      if (role === "Reviewer") role = "Legal Reviewer";
      updateFields.role = role;
    }
    if (department !== undefined) updateFields.department = department;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (assignedCases !== undefined && Array.isArray(assignedCases)) {
      updateFields.assignedCases = assignedCases;
    }
    if (employeeId !== undefined) updateFields.employeeId = employeeId;
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();

    let passwordChanged = false;
    if (password && typeof password === "string" && password.trim().length > 0) {
      if (password.trim().length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters long." });
        return;
      }
      const salt = await bcrypt.genSalt(12);
      updateFields.passwordHash = await bcrypt.hash(password.trim(), salt);
      passwordChanged = true;
    }

    const user = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    let action: AuditAction = isActive === false ? "USER_DEACTIVATED" : "USER_UPDATED";
    if (passwordChanged && Object.keys(updateFields).length === 1) {
      action = "USER_PASSWORD_RESET";
    }

    // Audit — non-critical
    try {
      await createAuditEvent({
        action,
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        result: "Success",
        metadata: {
          targetUserId: user._id.toString(),
          targetUserEmail: user.email,
          updatedFields: Object.keys(updateFields).filter((k) => k !== "passwordHash"),
          passwordReset: passwordChanged,
        },
      });
    } catch (_) {}

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user." });
  }
});

/**
 * POST /api/users/:id/reset-password
 * Admin resets a user's password directly.
 */
router.post("/users/:id/reset-password", requireAuth, requireRole("Admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.trim().length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    const user = await User.findByIdAndUpdate(id, { passwordHash }, { new: true }).select("-passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Audit — non-critical
    try {
      await createAuditEvent({
        action: "USER_PASSWORD_RESET",
        userId: req.user!.userId,
        userName: req.user!.name,
        userRole: req.user!.role,
        result: "Success",
        metadata: {
          targetUserId: user._id.toString(),
          targetUserEmail: user.email,
          targetUserName: user.name,
        },
      });
    } catch (_) {}

    res.json({ message: `Password successfully updated for ${user.name}.`, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset password." });
  }
});

export default router;
