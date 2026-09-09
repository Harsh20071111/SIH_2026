import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken, requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { createSecurityEvent } from "../lib/security";

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

    const cleanIdentifier = email.trim();
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
        }).maxTimeMS(3000);
      }
    } catch (dbErr) {
      // Database query error or offline
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
      // Safely create audit/security event
      try {
        await createAuditEvent({
          action: "LOGIN_FAILED",
          userName: email,
          result: "Failed",
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
          metadata: { reason: "Invalid credentials" },
        });
      } catch (_) {}

      try {
        await createSecurityEvent({
          type: "LOGIN_FAILED",
          action: "Failed login attempt",
          userName: email,
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
        });
      } catch (_) {}

      res.status(401).json({
        error: "Invalid credentials. Please check your email and password.",
      });
      return;
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      try {
        await createAuditEvent({
          action: "LOGIN_FAILED",
          userId: user._id.toString(),
          userName: user.name,
          userRole: user.role,
          result: "Failed",
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
          metadata: { reason: "Invalid password" },
        });
      } catch (_) {}

      try {
        await createSecurityEvent({
          type: "LOGIN_FAILED",
          userId: user._id.toString(),
          userName: user.name,
          action: "Failed login attempt — invalid password",
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
        });
      } catch (_) {}

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

    // Create audit event safely
    try {
      await createAuditEvent({
        action: "LOGIN_SUCCESS",
        userId: user._id.toString(),
        userName: user.name,
        userRole: user.role,
        result: "Success",
        ipAddress: req.ip || "",
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
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * POST /api/auth/logout
 * Record logout event (stateless JWT — client discards token).
 */
router.post("/auth/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    await createAuditEvent({
      action: "LOGOUT",
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      result: "Success",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (_) {}

  res.json({ message: "Logged out successfully." });
});

/**
 * GET /api/auth/me
 * Return the current authenticated user from the JWT.
 */
router.get("/auth/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
