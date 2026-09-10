import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";
import { createAuditEvent } from "../lib/audit";
import { createSecurityEvent } from "../lib/security";
import { getClientIp } from "../lib/ip";

const JWT_SECRET: string =
  process.env["JWT_SECRET"] || "securedocs-dev-secret-change-in-production";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  department: string;
  employeeId: string;
}

// Extend Express Request to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Sign a JWT token for the given user payload.
 */
export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Middleware: Verify JWT bearer token from Authorization header.
 * Attaches decoded user to req.user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ error: "Authentication required. Please provide a valid token." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    logger.warn({ err }, "Invalid or expired JWT token");

    if (err.name === "TokenExpiredError") {
      try {
        const decoded = jwt.decode(token) as unknown as AuthUser;
        if (decoded && decoded.userId) {
          createAuditEvent({
            action: "UNAUTHORIZED_ACCESS",
            userId: decoded.userId,
            userName: decoded.email || "Unknown",
            result: "Failed",
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
            metadata: { reason: "Expired token" },
          }).catch(() => {});

          createSecurityEvent({
            type: "EXPIRED_TOKEN_ACCESS",
            action: "Access attempt with expired token",
            userId: decoded.userId,
            userName: decoded.email || "Unknown",
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "",
          }).catch(() => {});
        }
      } catch (_) {}
    }

    res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}
