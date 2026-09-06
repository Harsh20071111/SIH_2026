import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User, type SecureDocsRole } from "../models/User";
import { logger } from "../lib/logger";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: SecureDocsRole;
  department: string;
  policeStationId: string;
  districtCode: string;
  stateCode: string;
  forensicTokens?: string[];
  isActive?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// In-memory token cache for verified Appwrite JWTs (TTL: 60 seconds)
interface CachedTokenUser {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}
const tokenCache = new Map<string, CachedTokenUser>();

/**
 * Cryptographically verifies an Appwrite JWT against Appwrite Cloud.
 * Returns verified user metadata or null if invalid/expired/tampered.
 */
async function verifyAppwriteToken(
  jwt: string
): Promise<{ userId: string; email: string; name: string } | null> {
  const cached = tokenCache.get(jwt);
  if (cached && cached.expiresAt > Date.now()) {
    return { userId: cached.userId, email: cached.email, name: cached.name };
  }

  const endpoint = process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID || "6a9babf9001cc3f047af";

  try {
    const res = await fetch(`${endpoint}/account`, {
      method: "GET",
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Appwrite-JWT": jwt,
      },
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "Appwrite JWT verification rejected by Appwrite Cloud");
      return null;
    }

    const data: any = await res.json();
    if (!data || !data.$id) {
      return null;
    }

    const verified = {
      userId: String(data.$id),
      email: String(data.email || "").toLowerCase(),
      name: String(data.name || "Appwrite User"),
    };

    tokenCache.set(jwt, { ...verified, expiresAt: Date.now() + 60_000 });
    return verified;
  } catch (err) {
    logger.error({ err }, "Network error contacting Appwrite Cloud for token verification");
    return null;
  }
}

/**
 * Appwrite Authentication Middleware
 *
 * Rules:
 * 1. Health endpoint (/api/health) is always public.
 * 2. Establishes verified identity via Appwrite JWT or strictly isolated development authorization.
 * 3. ALLOW_DEV_AUTH is strictly ignored in production (NODE_ENV === "production").
 * 4. Does NOT trust client-supplied roles or unverified identity claims.
 * 5. Does NOT derive roles from email patterns (e.g. email.includes("admin")).
 * 6. If MongoDB is connected: resolves authoritative role exclusively from MongoDB User collection.
 * 7. If MongoDB is disconnected: protected operations FAIL CLOSED with HTTP 503 ("Authorization service temporarily unavailable.").
 * 8. Authentication failures fail closed (returns 401 immediately on invalid credentials).
 */
export async function authenticateAppwriteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Health endpoint is unconditionally public
    if (req.path === "/health" || req.originalUrl === "/api/health") {
      req.user = undefined;
      return next();
    }

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const appwriteJwt = (req.headers["x-appwrite-jwt"] as string)?.trim() || bearerToken;

    // Check if development authorization fallback is allowed (strictly disabled in production)
    const isDevAuthAllowed =
      process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH === "true";

    const devUserId = isDevAuthAllowed
      ? ((req.headers["x-dev-user-id"] || req.headers["x-appwrite-user-id"]) as string)?.trim()
      : undefined;

    // Case 1: No credentials or tokens provided at all
    if (!appwriteJwt && !devUserId) {
      req.user = undefined;
      return next();
    }

    let verifiedIdentity: { userId: string; email: string; name: string } | null = null;

    // Case 2: Appwrite JWT provided
    if (appwriteJwt) {
      verifiedIdentity = await verifyAppwriteToken(appwriteJwt);
      if (!verifiedIdentity) {
        // In dev mode only, allow dev-token-<userId> format for local testing if explicitly configured
        if (isDevAuthAllowed && appwriteJwt.startsWith("dev-token-")) {
          const testId = appwriteJwt.substring("dev-token-".length).trim();
          verifiedIdentity = {
            userId: testId,
            email: `${testId}@securedocs.gov.in`,
            name: testId.replace(/_/g, " "),
          };
        } else {
          // Token verification failed: fail closed immediately with 401
          res.status(401).json({
            error: "Invalid or expired Appwrite authentication token.",
          });
          return;
        }
      }
    } else if (isDevAuthAllowed && devUserId) {
      // Case 3: Development identity key provided (strictly permitted only when NODE_ENV !== "production" AND ALLOW_DEV_AUTH === "true")
      verifiedIdentity = {
        userId: devUserId,
        email: ((req.headers["x-appwrite-user-email"] as string)?.trim().toLowerCase()) || `${devUserId}@securedocs.gov.in`,
        name: ((req.headers["x-appwrite-user-name"] as string)?.trim()) || devUserId.replace(/_/g, " "),
      };
    }

    if (!verifiedIdentity) {
      res.status(401).json({
        error: "Authentication failed. Could not verify Appwrite identity.",
      });
      return;
    }

    // Role resolution requires authoritative MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      // MongoDB is disconnected: protected operations fail closed with HTTP 503
      logger.warn(
        { userId: verifiedIdentity.userId },
        "MongoDB is unavailable. Rejecting protected operation with HTTP 503."
      );
      res.status(503).json({
        error: "Authorization service temporarily unavailable.",
      });
      return;
    }

    // MongoDB is connected: load trusted user profile
    let dbUser = await User.findOne({
      $or: [
        { appwriteId: verifiedIdentity.userId },
        ...(mongoose.Types.ObjectId.isValid(verifiedIdentity.userId)
          ? [{ _id: verifiedIdentity.userId }]
          : []),
        { email: verifiedIdentity.email },
      ],
    });

    if (!dbUser) {
      // Unknown user: provision new record with baseline "Officer" role (NEVER Admin)
      const baselineRole: SecureDocsRole = "Officer";
      dbUser = await User.create({
        appwriteId: verifiedIdentity.userId,
        email: verifiedIdentity.email,
        name: verifiedIdentity.name,
        role: baselineRole,
        department: "Operations",
        policeStationId: "PS-CENTRAL-01",
        districtCode: "DIST-01",
        stateCode: "ST-01",
        isActive: true,
      });

      logger.info(
        { userId: verifiedIdentity.userId, role: baselineRole },
        "Provisioned new user record in MongoDB with baseline role"
      );
    }

    req.user = {
      userId: dbUser.appwriteId || (dbUser._id as any).toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      department: dbUser.department,
      policeStationId: dbUser.policeStationId || "PS-CENTRAL-01",
      districtCode: dbUser.districtCode || "DIST-01",
      stateCode: dbUser.stateCode || "ST-01",
      forensicTokens: dbUser.forensicTokens || [],
      isActive: dbUser.isActive,
    };

    return next();
  } catch (err) {
    logger.error({ err }, "Authentication middleware unexpected error");
    // Fail closed on error: do not silently allow unauthenticated access
    res.status(500).json({ error: "Internal authentication error." });
  }
}

/**
 * Guard requiring an authenticated user.
 * Returns 401 if unauthenticated, 403 if user account is deactivated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: "Authentication required. Please sign in via Appwrite.",
    });
    return;
  }

  if (req.user.isActive === false) {
    res.status(403).json({
      error: "Access denied. Account is inactive or suspended.",
    });
    return;
  }

  next();
}
