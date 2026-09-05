import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "./auth";

/**
 * Automatically redacts sensitive fields from FIR responses
 * based on the user's role and the FIR's sensitivity flags.
 */
export function redactSensitiveFields(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  const user = req.user as AuthUser;
  
  res.json = (body: any) => {
    if (body?.fir) {
      const fir = body.fir;
      
      // ── POCSO / Minor Identity Protection ──
      if (fir.isSensitive && fir.sensitiveCategory === "POCSO") {
        // Redact victim names for ALL roles except assigned IO and SHO
        if (!["IO", "SHO"].includes(user.role)) {
          fir.victimDetails = fir.victimDetails?.map((v: any) => ({
            ...v,
            name: "[REDACTED — POCSO Protection]",
            age: v.isMinor ? "[MINOR]" : v.age,
          }));
        }
      }
      
      // ── Forensic Expert — ZERO PII access ──
      if (user.role === "ForensicExpert") {
        delete fir.complainantDetails;
        delete fir.victimDetails;
        delete fir.witnessDetails;
        fir.incidentDescription = "[REDACTED — Forensic Access]";
      }
      
      // ── Mask Aadhaar/ID numbers for non-IO roles ──
      if (user.role !== "IO" && fir.complainantDetails?.idNumber) {
        fir.complainantDetails.idNumber = 
          "XXXX-XXXX-" + fir.complainantDetails.idNumber.slice(-4);
      }
    }
    
    return originalJson(body);
  };
  
  next();
}
