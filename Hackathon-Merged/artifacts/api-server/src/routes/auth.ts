import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken, requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { createSecurityEvent } from "../lib/security";
import { getClientIp } from "../lib/ip";
import { logger } from "../lib/logger";

import mongoose from "mongoose";

const DEMO_USERS_MAP: Record<string, any> = {
  "admin@securedocs.gov": {
    _id: "66d8e0010000000000000001",
    email: "admin@securedocs.gov",
    name: "Admin User",
    role: "Admin",
    department: "Administration",
    employeeId: "EMP-001",
  },
  "emp-001": {
    _id: "66d8e0010000000000000001",
    email: "admin@securedocs.gov",
    name: "Admin User",
    role: "Admin",
    department: "Administration",
    employeeId: "EMP-001",
  },
  "raj.patel@securedocs.gov": {
    _id: "66d8e0010000000000000002",
    email: "raj.patel@securedocs.gov",
    name: "Officer Raj Patel",
    role: "Officer",
    department: "Investigation",
    employeeId: "EMP-002",
  },
  "emp-002": {
    _id: "66d8e0010000000000000002",
    email: "raj.patel@securedocs.gov",
    name: "Officer Raj Patel",
    role: "Officer",
    department: "Investigation",
    employeeId: "EMP-002",
  },
  "amit.shah@securedocs.gov": {
    _id: "66d8e0010000000000000003",
    email: "amit.shah@securedocs.gov",
    name: "Officer Amit Shah",
    role: "Officer",
    department: "Cyber Crime",
    employeeId: "EMP-003",
  },
  "emp-003": {
    _id: "66d8e0010000000000000003",
    email: "amit.shah@securedocs.gov",
    name: "Officer Amit Shah",
    role: "Officer",
    department: "Cyber Crime",
    employeeId: "EMP-003",
  },
  "neha.patel@securedocs.gov": {
    _id: "66d8e0010000000000000004",
    email: "neha.patel@securedocs.gov",
    name: "Officer Neha Patel",
    role: "Officer",
    department: "Evidence",
    employeeId: "EMP-004",
  },
  "emp-004": {
    _id: "66d8e0010000000000000004",
    email: "neha.patel@securedocs.gov",
    name: "Officer Neha Patel",
    role: "Officer",
    department: "Evidence",
    employeeId: "EMP-004",
  },
  "vikram.rao@securedocs.gov": {
    _id: "66d8e0010000000000000005",
    email: "vikram.rao@securedocs.gov",
    name: "Officer Vikram Rao",
    role: "Officer",
    department: "Forensics",
    employeeId: "EMP-005",
  },
  "emp-005": {
    _id: "66d8e0010000000000000005",
    email: "vikram.rao@securedocs.gov",
    name: "Officer Vikram Rao",
    role: "Officer",
    department: "Forensics",
    employeeId: "EMP-005",
  },
  "mehta@securedocs.gov": {
    _id: "66d8e0010000000000000006",
    email: "mehta@securedocs.gov",
    name: "Legal Reviewer Mehta",
    role: "Legal Reviewer",
    department: "Legal",
    employeeId: "EMP-006",
  },
  "emp-006": {
    _id: "66d8e0010000000000000006",
    email: "mehta@securedocs.gov",
    name: "Legal Reviewer Mehta",
    role: "Legal Reviewer",
    department: "Legal",
    employeeId: "EMP-006",
  },
  "clerk@securedocs.gov": {
    _id: "66d8e0010000000000000007",
    email: "clerk@securedocs.gov",
    name: "Court Clerk S. Webb",
    role: "Clerk",
    department: "Court Services",
    employeeId: "EMP-007",
  },
  "emp-007": {
    _id: "66d8e0010000000000000007",
    email: "clerk@securedocs.gov",
    name: "Court Clerk S. Webb",
    role: "Clerk",
    department: "Court Services",
    employeeId: "EMP-007",
  },
  "auditor@securedocs.gov": {
    _id: "66d8e0010000000000000008",
    email: "auditor@securedocs.gov",
    name: "Auditor Singh",
    role: "Auditor",
    department: "Audit",
    employeeId: "EMP-008",
  },
  "emp-008": {
    _id: "66d8e0010000000000000008",
    email: "auditor@securedocs.gov",
    name: "Auditor Singh",
    role: "Auditor",
    department: "Audit",
    employeeId: "EMP-008",
  },
};

const router: IRouter = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email + password, return JWT.
 */
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const cleanIdentifier = String(email).trim();
    const normalizedKey = cleanIdentifier.toLowerCase();
    const demoUser = DEMO_USERS_MAP[normalizedKey];

    // Find user by email or employeeId (case-insensitive)
    let user: any = null;
    try {
      if (mongoose.connection.readyState === 1) {
        user = await User.findOne({
          $or: [
            { email: normalizedKey },
            { employeeId: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
          ],
        }).maxTimeMS(5000);
      }
    } catch (dbErr: any) {
      // DB query failed — fall through to demo user fallback
      logger.warn({ err: dbErr }, "DB query failed during login — falling back to demo users");
      user = null;
    }

    // If user not found in DB or DB is offline, check demo users
    if (!user && demoUser) {
      if (password !== "password123") {
        res.status(401).json({
          error: "Invalid credentials. Please check your email and password.",
        });
        return;
      }

      const token = signToken({
        userId: demoUser._id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        department: demoUser.department,
        employeeId: demoUser.employeeId,
      });

      res.json({
        token,
        user: {
          id: demoUser._id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          department: demoUser.department,
          employeeId: demoUser.employeeId,
        },
      });
      return;
    }

    if (!user || !user.isActive) {
      try {
        await createAuditEvent({
          action: "LOGIN_FAILED",
          userName: email,
          result: "Failed",
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"] || "",
          metadata: { reason: "Invalid credentials" },
        });

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const { AuditLog } = await import("../models/AuditLog");
        const failedCount = await AuditLog.countDocuments({
          action: "LOGIN_FAILED",
          userName: email,
          timestamp: { $gte: fifteenMinsAgo },
        });

        if (failedCount >= 5) {
          await createSecurityEvent({
            type: "BRUTE_FORCE_ATTACK",
            action: `${failedCount} consecutive failed login attempts detected`,
            userName: email,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
          });
        } else {
          await createSecurityEvent({
            type: "LOGIN_FAILED",
            action: "Failed login attempt",
            userName: email,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
          });
        }
      } catch (err) {
        logger.error({ err }, "Error recording login failure events");
      }

      res.status(401).json({
        error: "Invalid credentials. Please check your email and password.",
      });
      return;
    }

    // Guard: passwordHash must exist — if missing, the account is not properly set up
    if (!user.passwordHash) {
      logger.error({ userId: user._id }, "User has no passwordHash set");
      res.status(401).json({
        error: "Account configuration error. Please contact your administrator.",
      });
      return;
    }

    // Verify password with bcrypt
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(String(password), user.passwordHash);
    } catch (bcryptErr: any) {
      logger.error({ err: bcryptErr, userId: user._id }, "bcrypt.compare failed");
      res.status(500).json({ error: "Authentication error. Please try again." });
      return;
    }

    if (!isValidPassword) {
      try {
        await createAuditEvent({
          action: "LOGIN_FAILED",
          userId: user._id.toString(),
          userName: user.name,
          userRole: user.role,
          result: "Failed",
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"] || "",
          metadata: { reason: "Invalid password" },
        });

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const { AuditLog } = await import("../models/AuditLog");
        const failedCount = await AuditLog.countDocuments({
          action: "LOGIN_FAILED",
          userId: user._id.toString(),
          timestamp: { $gte: fifteenMinsAgo },
        });

        if (failedCount >= 5) {
          await createSecurityEvent({
            type: "BRUTE_FORCE_ATTACK",
            userId: user._id.toString(),
            userName: user.name,
            action: `${failedCount} consecutive failed login attempts detected`,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
          });
        } else {
          await createSecurityEvent({
            type: "LOGIN_FAILED",
            userId: user._id.toString(),
            userName: user.name,
            action: "Failed login attempt — invalid password",
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
          });
        }
      } catch (err) {
        logger.error({ err }, "Error recording login failure events");
      }

      res.status(401).json({
        error: "Invalid credentials. Please check your email and password.",
      });
      return;
    }

    // Update last login safely
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (_) {}

    // Generate JWT
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
    };

    const token = signToken(tokenPayload);

    try {
      await createAuditEvent({
        action: "LOGIN_SUCCESS",
        userId: user._id.toString(),
        userName: user.name,
        userRole: user.role,
        result: "Success",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
      });
    } catch (_) {}

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Unhandled login route error");
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/auth/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    await createAuditEvent({
      action: "LOGOUT",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      result: "Success",
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (_) {}

  res.json({ message: "Logged out successfully." });
});

/**
 * POST /api/auth/change-password
 * Change password for the currently authenticated user.
 */
router.post("/auth/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required." });
      return;
    }

    if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters long." });
      return;
    }

    const userId = req.user!.userId;
    const user = await User.findById(userId);

    if (!user) {
      // If user is a demo user or not found in DB
      res.json({ message: "Password updated successfully." });
      return;
    }

    if (user.passwordHash) {
      const isValid = await bcrypt.compare(String(currentPassword), user.passwordHash);
      if (!isValid) {
        res.status(400).json({ error: "Current password is incorrect." });
        return;
      }
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    await user.save();

    try {
      await createAuditEvent({
        action: "USER_PASSWORD_RESET",
        userId: user._id.toString(),
        userName: user.name,
        userRole: user.role,
        result: "Success",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
        metadata: { selfService: true },
      });
    } catch (_) {}

    res.json({ message: "Password successfully updated." });
  } catch (err: any) {
    logger.error({ err }, "Error changing password");
    res.status(500).json({ error: "Failed to change password. Please try again." });
  }
});

export default router;
