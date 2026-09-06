import type { Request, Response, NextFunction } from "express";
import { createAuditEvent } from "../lib/audit";

/**
 * Middleware to record an audit log event upon request completion.
 */
export function auditMiddleware(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", async () => {
      const user = req.user;
      const fir = (req as any).fir;
      const toStr = (v: any) => (Array.isArray(v) ? String(v[0] || "") : String(v || ""));
      const firId = fir?.firNumber || toStr(req.params.firId) || (req.body?.firNumber as string) || "";
      const caseId = fir?.caseId || toStr(req.params.caseId) || (req.body?.caseId as string) || "";
      const documentId = toStr(req.params.documentId) || toStr(req.params.id) || (req.body?.documentId as string) || "";

      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

      if (user) {
        await createAuditEvent({
          action,
          userId: user.userId,
          userName: user.name,
          userRole: user.role,
          firId,
          caseId,
          documentId,
          result: isSuccess ? "Success" : "Failed",
          ipAddress: req.ip || "",
          userAgent: req.headers["user-agent"] || "",
          metadata: {
            statusCode: res.statusCode,
            method: req.method,
            path: req.originalUrl,
          },
        });
      }
    });

    next();
  };
}
