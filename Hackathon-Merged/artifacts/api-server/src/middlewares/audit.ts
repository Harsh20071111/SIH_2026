import type { Request, Response, NextFunction } from "express";
import { createAuditEvent } from "../lib/audit";
import type { AuthUser } from "./auth";

/**
 * Middleware to log an audit event for a specific action.
 * Should be used AFTER authentication (requireAuth) and ABAC (requireFIRAccess).
 */
export function auditMiddleware(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Capture the original send to intercept the response status
    const originalSend = res.send.bind(res);
    let responseBody: any;
    
    // Intercept response to check if it was successful
    res.send = (body: any) => {
      responseBody = body;
      return originalSend(body);
    };

    res.on("finish", async () => {
      const user = req.user as AuthUser | undefined;
      // ABAC middleware attaches fir to req
      const fir = (req as any).fir;
      const firId = fir?.firNumber || req.params.id || req.params.firId;
      
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      
      if (user) {
        await createAuditEvent({
          action,
          userId: user.userId,
          userName: user.name,
          userRole: user.role,
          firId,
          result: isSuccess ? "Success" : "Failed",
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
          metadata: {
            statusCode: res.statusCode,
            method: req.method,
            path: req.originalUrl
          }
        });
      }
    });

    next();
  };
}
