import type { Request, Response, NextFunction } from "express";

/**
 * Automatically redacts sensitive fields from FIR or Document responses
 * based on role and statutory sensitivity requirements (e.g. POCSO, Aadhaar masking).
 */
export function redactSensitiveFields(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  const user = req.user;

  res.json = (body: any): Response => {
    if (body?.fir && user) {
      const fir = body.fir;

      // POCSO Minor Identity Protection
      if (fir.isSensitive && fir.sensitiveCategory === "POCSO") {
        if (user.role !== "Admin" && fir.assignedIOId !== user.userId) {
          if (Array.isArray(fir.victimDetails)) {
            fir.victimDetails = fir.victimDetails.map((v: any) => ({
              ...v,
              name: "[REDACTED — POCSO Protection]",
              age: v.isMinor ? "[PROTECTED_MINOR]" : v.age,
            }));
          }
        }
      }

      // Mask Aadhaar/ID numbers for non-admin viewers
      if (user.role !== "Admin" && fir.complainantDetails?.idNumber) {
        fir.complainantDetails.idNumber =
          "XXXX-XXXX-" + String(fir.complainantDetails.idNumber).slice(-4);
      }
    }

    return originalJson(body);
  };

  next();
}
