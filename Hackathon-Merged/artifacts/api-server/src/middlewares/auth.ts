import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env["JWT_SECRET"] || "securedocs-dev-secret-change-in-production";

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

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Please provide a valid token." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ err }, "Invalid or expired JWT token");
    res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}
