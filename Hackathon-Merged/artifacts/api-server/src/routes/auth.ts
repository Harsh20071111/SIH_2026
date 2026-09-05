import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken, requireAuth } from "../middlewares/auth";
import { createAuditEvent } from "../lib/audit";
import { createSecurityEvent } from "../lib/security";

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

    // Find user by email or employeeId (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { employeeId: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
      ],
    });

    if (!user || !user.isActive) {
      // Create audit event for failed login — do not reveal if account exists
      await createAuditEvent({
        action: "LOGIN_FAILED",
        userName: email,
        result: "Failed",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        metadata: { reason: "Invalid credentials" },
      });

      // Create security event for failed login
      await createSecurityEvent({
        type: "LOGIN_FAILED",
        action: "Failed login attempt",
        userName: email,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(401).json({
        error: "Invalid credentials. Please check your email and password.",
      });
      return;
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
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

      await createSecurityEvent({
        type: "LOGIN_FAILED",
        userId: user._id.toString(),
        userName: user.name,
        action: "Failed login attempt — invalid password",
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(401).json({
        error: "Invalid credentials. Please check your email and password.",
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

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

    // Create audit event for successful login
    await createAuditEvent({
      action: "LOGIN_SUCCESS",
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      result: "Success",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

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
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * POST /api/auth/logout
 * Record logout event (stateless JWT — client discards token).
 */
router.post("/auth/logout", requireAuth, async (req: Request, res: Response) => {
  await createAuditEvent({
    action: "LOGOUT",
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    result: "Success",
    ipAddress: req.ip || "",
    userAgent: req.headers["user-agent"] || "",
  });

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
